"""
Base Agent Class for Clinical Trial Matching System

This module provides a base class with common functionality for all uAgents
in the clinical trial matching system, including ASI protocol support,
encryption, monitoring, and error handling.
"""

import asyncio
import json
import logging
import os
import time
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass, asdict

import aiohttp
import redis.asyncio as redis
from cryptography.fernet import Fernet
from prometheus_client import Counter, Histogram, Gauge, start_http_server
from uagents import Agent, Context, Protocol
from uagents.setup import fund_agent_if_lucky

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter('agent_requests_total', 'Total requests processed', ['agent_type', 'endpoint'])
REQUEST_DURATION = Histogram('agent_request_duration_seconds', 'Request duration in seconds', ['agent_type', 'endpoint'])
ACTIVE_CONNECTIONS = Gauge('agent_active_connections', 'Number of active connections', ['agent_type'])
ERROR_COUNT = Counter('agent_errors_total', 'Total errors', ['agent_type', 'error_type'])

@dataclass
class AgentConfig:
    """Configuration for uAgents"""
    name: str
    seed: str
    port: int
    endpoint: str
    network: str = "testnet"
    enable_funding: bool = True
    max_retries: int = 3
    retry_delay: float = 1.0
    health_check_interval: int = 30
    log_level: str = "INFO"

@dataclass
class ASIMessage:
    """ASI Protocol message structure"""
    session_id: str
    message_type: str
    payload: Dict[str, Any]
    timestamp: str
    signature: Optional[str] = None

@dataclass
class EncryptedData:
    """Encrypted data structure"""
    encrypted_content: bytes
    iv: bytes
    timestamp: str
    key_id: str

class BaseAgent(ABC):
    """
    Base class for all uAgents in the clinical trial matching system.
    
    Provides common functionality including:
    - ASI protocol support
    - Encryption/decryption
    - Monitoring and metrics
    - Error handling and retries
    - Health checks
    - Redis integration
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.agent = Agent(
            name=config.name,
            port=config.port,
            seed=config.seed,
            endpoint=config.endpoint
        )
        
        # Initialize encryption
        self.encryption_key = self._get_or_generate_key()
        self.cipher_suite = Fernet(self.encryption_key)
        
        # Initialize Redis connection
        self.redis_client = None
        self._init_redis()
        
        # Initialize monitoring
        self._init_monitoring()
        
        # Health check state
        self.last_health_check = time.time()
        self.is_healthy = True
        
        # Register protocols
        self._register_protocols()
        
        # Start background tasks
        self._start_background_tasks()
        
        logger.info(f"Initialized {config.name} agent on port {config.port}")
    
    def _get_or_generate_key(self) -> bytes:
        """Get existing encryption key or generate a new one"""
        key_file = f".keys/{self.config.name}_key.key"
        os.makedirs(".keys", exist_ok=True)
        
        if os.path.exists(key_file):
            with open(key_file, "rb") as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, "wb") as f:
                f.write(key)
            return key
    
    def _init_redis(self):
        """Initialize Redis connection"""
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            self.redis_client = redis.from_url(redis_url)
            logger.info("Redis connection initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize Redis: {e}")
            self.redis_client = None
    
    def _init_monitoring(self):
        """Initialize Prometheus monitoring"""
        try:
            metrics_port = int(os.getenv("METRICS_PORT", "9090"))
            start_http_server(metrics_port)
            logger.info(f"Prometheus metrics server started on port {metrics_port}")
        except Exception as e:
            logger.warning(f"Failed to start metrics server: {e}")
    
    def _register_protocols(self):
        """Register agent protocols - to be implemented by subclasses"""
        pass
    
    def _start_background_tasks(self):
        """Start background tasks like health checks"""
        asyncio.create_task(self._health_check_loop())
        asyncio.create_task(self._cleanup_loop())
    
    async def _health_check_loop(self):
        """Periodic health check loop"""
        while True:
            try:
                await self._perform_health_check()
                await asyncio.sleep(self.config.health_check_interval)
            except Exception as e:
                logger.error(f"Health check failed: {e}")
                await asyncio.sleep(5)
    
    async def _cleanup_loop(self):
        """Periodic cleanup loop"""
        while True:
            try:
                await self._perform_cleanup()
                await asyncio.sleep(300)  # 5 minutes
            except Exception as e:
                logger.error(f"Cleanup failed: {e}")
                await asyncio.sleep(60)
    
    async def _perform_health_check(self):
        """Perform health check"""
        try:
            # Check Redis connection
            if self.redis_client:
                await self.redis_client.ping()
            
            # Check agent status
            if self.agent.is_running():
                self.is_healthy = True
                self.last_health_check = time.time()
            else:
                self.is_healthy = False
                
        except Exception as e:
            self.is_healthy = False
            logger.error(f"Health check failed: {e}")
    
    async def _perform_cleanup(self):
        """Perform periodic cleanup tasks"""
        try:
            # Clean up old session data
            if self.redis_client:
                cutoff_time = datetime.now() - timedelta(hours=24)
                pattern = f"{self.config.name}:sessions:*"
                keys = await self.redis_client.keys(pattern)
                
                for key in keys:
                    session_data = await self.redis_client.get(key)
                    if session_data:
                        data = json.loads(session_data)
                        if datetime.fromisoformat(data.get("created_at", "1970-01-01")) < cutoff_time:
                            await self.redis_client.delete(key)
                            
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
    
    def encrypt_data(self, data: Union[str, bytes]) -> EncryptedData:
        """Encrypt data using Fernet"""
        if isinstance(data, str):
            data = data.encode()
        
        iv = os.urandom(16)
        encrypted_content = self.cipher_suite.encrypt(data)
        
        return EncryptedData(
            encrypted_content=encrypted_content,
            iv=iv,
            timestamp=datetime.now().isoformat(),
            key_id=self.config.name
        )
    
    def decrypt_data(self, encrypted_data: EncryptedData) -> bytes:
        """Decrypt data using Fernet"""
        return self.cipher_suite.decrypt(encrypted_data.encrypted_content)
    
    async def send_asi_message(self, target_agent: str, message: ASIMessage) -> bool:
        """Send ASI protocol message to another agent"""
        try:
            if not self.redis_client:
                logger.error("Redis not available for message sending")
                return False
            
            # Store message in Redis for target agent
            message_key = f"{target_agent}:messages:{message.session_id}"
            await self.redis_client.setex(
                message_key,
                3600,  # 1 hour TTL
                json.dumps(asdict(message))
            )
            
            # Update metrics
            REQUEST_COUNT.labels(agent_type=self.config.name, endpoint="asi_message_sent").inc()
            
            logger.info(f"Sent ASI message to {target_agent}: {message.message_type}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send ASI message: {e}")
            ERROR_COUNT.labels(agent_type=self.config.name, error_type="asi_message_send").inc()
            return False
    
    async def receive_asi_message(self, session_id: str) -> Optional[ASIMessage]:
        """Receive ASI protocol message from Redis"""
        try:
            if not self.redis_client:
                return None
            
            message_key = f"{self.config.name}:messages:{session_id}"
            message_data = await self.redis_client.get(message_key)
            
            if message_data:
                data = json.loads(message_data)
                return ASIMessage(**data)
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to receive ASI message: {e}")
            ERROR_COUNT.labels(agent_type=self.config.name, error_type="asi_message_receive").inc()
            return None
    
    async def store_session_data(self, session_id: str, data: Dict[str, Any]) -> bool:
        """Store session data in Redis"""
        try:
            if not self.redis_client:
                return False
            
            session_key = f"{self.config.name}:sessions:{session_id}"
            session_data = {
                **data,
                "created_at": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat()
            }
            
            await self.redis_client.setex(
                session_key,
                86400,  # 24 hours TTL
                json.dumps(session_data)
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store session data: {e}")
            return False
    
    async def get_session_data(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve session data from Redis"""
        try:
            if not self.redis_client:
                return None
            
            session_key = f"{self.config.name}:sessions:{session_id}"
            session_data = await self.redis_client.get(session_key)
            
            if session_data:
                data = json.loads(session_data)
                # Update last accessed time
                data["last_accessed"] = datetime.now().isoformat()
                await self.redis_client.setex(
                    session_key,
                    86400,
                    json.dumps(data)
                )
                return data
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get session data: {e}")
            return None
    
    async def make_http_request(
        self, 
        url: str, 
        method: str = "GET", 
        headers: Optional[Dict[str, str]] = None,
        data: Optional[Dict[str, Any]] = None,
        timeout: int = 30
    ) -> Optional[Dict[str, Any]]:
        """Make HTTP request with retry logic and monitoring"""
        start_time = time.time()
        
        for attempt in range(self.config.max_retries):
            try:
                async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=timeout)) as session:
                    if method.upper() == "GET":
                        async with session.get(url, headers=headers) as response:
                            if response.status == 200:
                                result = await response.json()
                                duration = time.time() - start_time
                                REQUEST_DURATION.labels(
                                    agent_type=self.config.name, 
                                    endpoint=url
                                ).observe(duration)
                                return result
                            else:
                                logger.warning(f"HTTP {method} failed with status {response.status}")
                    else:
                        async with session.post(url, headers=headers, json=data) as response:
                            if response.status in [200, 201]:
                                result = await response.json()
                                duration = time.time() - start_time
                                REQUEST_DURATION.labels(
                                    agent_type=self.config.name, 
                                    endpoint=url
                                ).observe(duration)
                                return result
                            else:
                                logger.warning(f"HTTP {method} failed with status {response.status}")
                
                if attempt < self.config.max_retries - 1:
                    await asyncio.sleep(self.config.retry_delay * (2 ** attempt))
                    
            except Exception as e:
                logger.error(f"HTTP request attempt {attempt + 1} failed: {e}")
                if attempt < self.config.max_retries - 1:
                    await asyncio.sleep(self.config.retry_delay * (2 ** attempt))
        
        ERROR_COUNT.labels(agent_type=self.config.name, error_type="http_request").inc()
        return None
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get current health status"""
        return {
            "agent_name": self.config.name,
            "is_healthy": self.is_healthy,
            "last_health_check": self.last_health_check,
            "uptime": time.time() - self.agent.start_time if hasattr(self.agent, 'start_time') else 0,
            "redis_connected": self.redis_client is not None,
            "agent_running": self.agent.is_running() if hasattr(self.agent, 'is_running') else False
        }
    
    @abstractmethod
    async def start(self):
        """Start the agent - to be implemented by subclasses"""
        pass
    
    @abstractmethod
    async def stop(self):
        """Stop the agent - to be implemented by subclasses"""
        pass
    
    def run(self):
        """Run the agent with funding if enabled"""
        if self.config.enable_funding:
            fund_agent_if_lucky(self.agent.wallet.address())
        
        self.agent.run()
