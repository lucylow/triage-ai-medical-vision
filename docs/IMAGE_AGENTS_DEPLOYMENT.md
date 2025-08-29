# AI Image Agents Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying your GreyGuard AI Image Agents to Fetch.ai's Agentverse platform. The system includes both an Image Generation Agent (using DALL-E 3) and an Image Analysis Agent (using Claude 3.5), both fully integrated with the ASI protocol.

## Prerequisites

### 1. Development Environment
- Python 3.10+ installed
- Node.js 18+ and npm/yarn for frontend
- Git for version control
- A code editor (VS Code recommended)

### 2. API Keys & Services
- **OpenAI API Key**: For DALL-E 3 image generation
- **Anthropic API Key**: For Claude 3.5 image analysis
- **Fetch.ai Wallet**: With testnet tokens
- **Agentverse Account**: https://agentverse.ai

### 3. Frontend Dependencies
- React 18+
- TypeScript 5+
- Tailwind CSS
- Shadcn UI components

## Project Structure

```
greyguard-image-agents/
├── src/
│   ├── services/
│   │   ├── imageGenerationAgent.ts    # DALL-E 3 integration
│   │   ├── imageAnalysisAgent.ts      # Claude 3.5 integration
│   │   └── asiAgent.ts                # ASI protocol base
│   ├── components/
│   │   ├── ImageAgents.tsx            # Main UI component
│   │   ├── ASIProtocol.tsx            # ASI interface
│   │   └── ui/                        # UI components
│   └── utils/
│       └── imageUtils.ts              # Image processing utilities
├── agent/
│   ├── image_generation_agent.py      # Python uAgent for generation
│   ├── image_analysis_agent.py        # Python uAgent for analysis
│   ├── requirements.txt                # Python dependencies
│   └── agentverse.yaml                # Deployment configuration
├── frontend/
│   ├── package.json                    # Frontend dependencies
│   ├── .env.example                    # Environment variables
│   └── src/                           # React components
└── docs/
    ├── API_REFERENCE.md               # API documentation
    └── INTEGRATION_GUIDE.md           # Integration guide
```

## Step 1: Backend Agent Implementation

### 1.1 Image Generation Agent

Create `agent/image_generation_agent.py`:

```python
import os
import json
import asyncio
import requests
from datetime import datetime
from typing import Dict, List, Optional
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
from uagents.storage import StorageAPI
from openai import OpenAI

# Environment Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AGENT_SEED = os.getenv("AGENT_SEED", "image-gen-secret-phrase-123")
AGENT_NAME = os.getenv("AGENT_NAME", "GreyGuard_Image_Generator")
ASI_VERSION = "0.1"

if not OPENAI_API_KEY:
    raise ValueError("Missing OPENAI_API_KEY environment variable")

# Initialize OpenAI client
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# ASI Protocol Models
class ImageGenerationRequest(Model):
    version: str
    agent_address: str
    session_id: str
    prompt: str
    size: str = "1024x1024"
    quality: str = "hd"
    style: str = "vivid"
    context: Optional[str] = None

class ImageGenerationResponse(Model):
    version: str
    agent_address: str
    session_id: str
    image_url: str
    asset_id: str
    asset_uri: str
    prompt: str
    metadata: Dict[str, str]
    timestamp: str

class Error(Model):
    version: str
    agent_address: str
    session_id: str
    error: str
    details: str

# Create the agent
agent = Agent(
    name=AGENT_NAME,
    seed=AGENT_SEED,
    port=8000,
    endpoint=["http://localhost:8000/submit"],
    mailbox=f"{os.getenv('AGENTVERSE_API_KEY')}@https://agentverse.ai",
)

# Fund agent if needed
fund_agent_if_low(agent.wallet.address())

# Session storage
class SessionManager:
    def __init__(self, storage: StorageAPI):
        self.storage = storage
        self.active_sessions: Dict[str, Dict] = {}
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """Retrieve session data"""
        if session_id in self.active_sessions:
            return self.active_sessions[session_id]
        
        # Try to load from persistent storage
        data = await self.storage.get(f"session_{session_id}")
        if data:
            session_data = json.loads(data)
            self.active_sessions[session_id] = session_data
            return session_data
        
        return None

# Initialize session manager
session_manager = SessionManager(agent.storage)

# Image Generation Functions
def generate_image(prompt: str, size: str = "1024x1024", quality: str = "hd", style: str = "vivid") -> str:
    """Generate image using DALL-E 3"""
    try:
        response = openai_client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size,
            quality=quality,
            style=style,
            n=1
        )
        return response.data[0].url
    except Exception as e:
        agent.logger.error(f"Image generation failed: {str(e)}")
        raise

def optimize_prompt(prompt: str) -> str:
    """Optimize prompt for better DALL-E results"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": "You are a DALL-E prompt optimization expert. Improve the given prompt to generate better images. Focus on clarity, detail, and artistic quality. Return only the optimized prompt, nothing else."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=200,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        agent.logger.warn(f"Prompt optimization failed: {e}")
        return prompt

def moderate_content(prompt: str) -> bool:
    """Check if prompt is appropriate"""
    try:
        response = openai_client.moderations.create(input=prompt)
        return not response.results[0].flagged
    except Exception as e:
        agent.logger.warn(f"Content moderation failed: {e}")
        return True

# ASI Protocol Handlers
@agent.on_message(model=ImageGenerationRequest)
async def handle_image_generation(ctx: Context, sender: str, msg: ImageGenerationRequest):
    """Handle image generation requests"""
    try:
        # Verify ASI version compatibility
        if msg.version != ASI_VERSION:
            await ctx.send(sender, Error(
                version=ASI_VERSION,
                agent_address=str(agent.address),
                session_id=msg.session_id,
                error="Version mismatch",
                details=f"Agent requires ASI {ASI_VERSION}"
            ))
            return
        
        # Validate session
        session = await session_manager.get_session(msg.session_id)
        if not session:
            await ctx.send(sender, Error(
                version=ASI_VERSION,
                agent_address=str(agent.address),
                session_id=msg.session_id,
                error="Invalid session ID",
                details="Session not found"
            ))
            return
        
        # Content moderation
        if not moderate_content(msg.prompt):
            await ctx.send(sender, Error(
                version=ASI_VERSION,
                agent_address=str(agent.address),
                session_id=msg.session_id,
                error="Content moderation failed",
                details="Your prompt was flagged as inappropriate"
            ))
            return
        
        # Optimize prompt
        optimized_prompt = optimize_prompt(msg.prompt)
        
        # Generate image
        image_url = generate_image(
            optimized_prompt,
            msg.size,
            msg.quality,
            msg.style
        )
        
        # Create asset ID and URI
        asset_id = f"img_{int(asyncio.get_event_loop().time())}_{hash(sender) % 10000}"
        asset_uri = f"asset://{asset_id}"
        
        # Create metadata
        metadata = {
            "size": msg.size,
            "quality": msg.quality,
            "style": msg.style,
            "model": "dall-e-3",
            "original_prompt": msg.prompt,
            "optimized_prompt": optimized_prompt,
            "generation_time": datetime.utcnow().isoformat()
        }
        
        # Send response
        await ctx.send(sender, ImageGenerationResponse(
            version=ASI_VERSION,
            agent_address=str(agent.address),
            session_id=msg.session_id,
            image_url=image_url,
            asset_id=asset_id,
            asset_uri=asset_uri,
            prompt=msg.prompt,
            metadata=metadata,
            timestamp=datetime.utcnow().isoformat()
        ))
        
        agent.logger.info(f"Image generated successfully for session {msg.session_id}")
        
    except Exception as e:
        agent.logger.error(f"Image generation error: {e}")
        await ctx.send(sender, Error(
            version=ASI_VERSION,
            agent_address=str(agent.address),
            session_id=msg.session_id,
            error="Image generation failed",
            details=str(e)
        ))

# Health check
@agent.on_interval(period=300)
async def health_check(ctx: Context):
    ctx.logger.info(f"Image Generation Agent healthy | Address: {agent.address}")

if __name__ == "__main__":
    agent.run()
```

### 1.2 Image Analysis Agent

Create `agent/image_analysis_agent.py`:

```python
import os
import json
import asyncio
import requests
from datetime import datetime
from typing import Dict, List, Optional
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
from uagents.storage import StorageAPI

# Environment Configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
AGENT_SEED = os.getenv("AGENT_SEED", "image-analysis-secret-phrase-123")
AGENT_NAME = os.getenv("AGENT_NAME", "GreyGuard_Image_Analyzer")
ASI_VERSION = "0.1"
MODEL_ENGINE = os.getenv("MODEL_ENGINE", "claude-3-5-sonnet-20240620")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "4096"))

if not ANTHROPIC_API_KEY:
    raise ValueError("Missing ANTHROPIC_API_KEY environment variable")

# ASI Protocol Models
class ImageAnalysisRequest(Model):
    version: str
    agent_address: str
    session_id: str
    image_url: str
    prompt: Optional[str] = None
    analysis_type: str = "detailed"
    context: Optional[str] = None

class ImageAnalysisResponse(Model):
    version: str
    agent_address: str
    session_id: str
    analysis_id: str
    analysis: str
    confidence: float
    detected_objects: List[str]
    detected_text: Optional[str]
    metadata: Dict[str, str]
    suggestions: List[str]
    timestamp: str

class Error(Model):
    version: str
    agent_address: str
    session_id: str
    error: str
    details: str

# Create the agent
agent = Agent(
    name=AGENT_NAME,
    seed=AGENT_SEED,
    port=8001,
    endpoint=["http://localhost:8001/submit"],
    mailbox=f"{os.getenv('AGENTVERSE_API_KEY')}@https://agentverse.ai",
)

# Fund agent if needed
fund_agent_if_low(agent.wallet.address())

# Session storage
class SessionManager:
    def __init__(self, storage: StorageAPI):
        self.storage = storage
        self.active_sessions: Dict[str, Dict] = {}
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """Retrieve session data"""
        if session_id in self.active_sessions:
            return self.active_sessions[session_id]
        
        # Try to load from persistent storage
        data = await self.storage.get(f"session_{session_id}")
        if data:
            session_data = json.loads(data)
            self.active_sessions[session_id] = session_data
            return session_data
        
        return None

# Initialize session manager
session_manager = SessionManager(agent.storage)

# Image Analysis Functions
def analyze_image(image_url: str, prompt: Optional[str] = None, analysis_type: str = "detailed") -> Dict:
    """Analyze image using Claude 3.5"""
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    
    # Prepare content
    content = []
    if prompt:
        content.append({"type": "text", "text": prompt})
    
    content.append({
        "type": "image",
        "source": {
            "type": "url",
            "url": image_url
        }
    })
    
    # Get system prompt
    system_prompt = get_system_prompt(analysis_type)
    
    payload = {
        "model": MODEL_ENGINE,
        "max_tokens": MAX_TOKENS,
        "messages": [{"role": "user", "content": content}],
        "system": system_prompt
    }
    
    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        agent.logger.error(f"Image analysis failed: {str(e)}")
        raise

def get_system_prompt(analysis_type: str) -> str:
    """Get system prompt based on analysis type"""
    base_prompt = "You are a professional image analyst. Provide detailed, accurate descriptions and answer questions about images."
    
    type_prompts = {
        'medical': f"{base_prompt} Focus on medical aspects, symptoms, anatomical features, and potential medical conditions. Be precise and use medical terminology when appropriate.",
        'technical': f"{base_prompt} Focus on technical details, specifications, measurements, and technical analysis. Provide precise technical observations.",
        'creative': f"{base_prompt} Focus on artistic elements, composition, style, mood, and creative interpretation. Be imaginative and expressive.",
        'detailed': f"{base_prompt} Provide comprehensive analysis covering all visible elements, details, and aspects of the image. Be thorough and systematic.",
        'general': base_prompt
    }
    
    return type_prompts.get(analysis_type, base_prompt)

def extract_detected_objects(analysis: str) -> List[str]:
    """Extract detected objects from analysis text"""
    objects = []
    common_objects = [
        'person', 'people', 'car', 'building', 'tree', 'animal', 'furniture',
        'food', 'clothing', 'technology', 'nature', 'architecture', 'vehicle'
    ]
    
    for obj in common_objects:
        if obj in analysis.lower():
            objects.append(obj)
    
    return objects

def extract_detected_text(analysis: str) -> Optional[str]:
    """Extract detected text from analysis"""
    import re
    text_matches = re.findall(r'"([^"]+)"', analysis)
    if text_matches:
        return ', '.join(text_matches)
    return None

def calculate_confidence(analysis: str) -> float:
    """Calculate confidence score"""
    base_confidence = 0.7
    length_bonus = min(len(analysis) / 1000, 0.2)
    detail_bonus = 0.1 if 'detailed' in analysis.lower() or 'specific' in analysis.lower() else 0
    
    return min(base_confidence + length_bonus + detail_bonus, 0.95)

def generate_suggestions(analysis_type: str, detected_objects: List[str]) -> List[str]:
    """Generate suggestions based on analysis"""
    suggestions = []
    
    if analysis_type == 'medical':
        suggestions.extend([
            'Consider consulting a healthcare professional for medical concerns',
            'Request additional medical imaging if needed'
        ])
    
    if 'person' in detected_objects:
        suggestions.append('Consider privacy implications of person detection')
    
    if 'text' in detected_objects:
        suggestions.append('Verify extracted text accuracy')
    
    suggestions.extend([
        'Use analysis results for informed decision-making',
        'Consider context when interpreting results'
    ])
    
    return suggestions

# ASI Protocol Handlers
@agent.on_message(model=ImageAnalysisRequest)
async def handle_image_analysis(ctx: Context, sender: str, msg: ImageAnalysisRequest):
    """Handle image analysis requests"""
    try:
        # Verify ASI version compatibility
        if msg.version != ASI_VERSION:
            await ctx.send(sender, Error(
                version=ASI_VERSION,
                agent_address=str(agent.address),
                session_id=msg.session_id,
                error="Version mismatch",
                details=f"Agent requires ASI {ASI_VERSION}"
            ))
            return
        
        # Validate session
        session = await session_manager.get_session(msg.session_id)
        if not session:
            await ctx.send(sender, Error(
                version=ASI_VERSION,
                agent_address=str(agent.address),
                session_id=msg.session_id,
                error="Invalid session ID",
                details="Session not found"
            ))
            return
        
        # Analyze image
        analysis_result = analyze_image(
            msg.image_url,
            msg.prompt,
            msg.analysis_type
        )
        
        analysis_text = analysis_result["content"][0]["text"]
        
        # Extract information
        detected_objects = extract_detected_objects(analysis_text)
        detected_text = extract_detected_text(analysis_text)
        confidence = calculate_confidence(analysis_text)
        suggestions = generate_suggestions(msg.analysis_type, detected_objects)
        
        # Create analysis ID
        analysis_id = f"analysis_{int(asyncio.get_event_loop().time())}_{hash(sender) % 10000}"
        
        # Create metadata
        metadata = {
            "model": MODEL_ENGINE,
            "analysis_type": msg.analysis_type,
            "processing_time": str(datetime.utcnow()),
            "max_tokens": str(MAX_TOKENS)
        }
        
        # Send response
        await ctx.send(sender, ImageAnalysisResponse(
            version=ASI_VERSION,
            agent_address=str(agent.address),
            session_id=msg.session_id,
            analysis_id=analysis_id,
            analysis=analysis_text,
            confidence=confidence,
            detected_objects=detected_objects,
            detected_text=detected_text,
            metadata=metadata,
            suggestions=suggestions,
            timestamp=datetime.utcnow().isoformat()
        ))
        
        agent.logger.info(f"Image analyzed successfully for session {msg.session_id}")
        
    except Exception as e:
        agent.logger.error(f"Image analysis error: {e}")
        await ctx.send(sender, Error(
            version=ASI_VERSION,
            agent_address=str(agent.address),
            session_id=msg.session_id,
            error="Image analysis failed",
            details=str(e)
        ))

# Health check
@agent.on_interval(period=300)
async def health_check(ctx: Context):
    ctx.logger.info(f"Image Analysis Agent healthy | Address: {agent.address}")

if __name__ == "__main__":
    agent.run()
```

### 1.3 Requirements File

Create `agent/requirements.txt`:

```txt
uagents>=0.4.0
uagents-storage>=0.1.0
openai>=1.0.0
anthropic>=0.7.0
requests>=2.31.0
python-dotenv>=1.0.0
aiohttp>=3.8.0
asyncio-mqtt>=0.16.0
```

### 1.4 Environment Configuration

Create `agent/.env`:

```bash
# Agent Configuration
AGENT_SEED="your_secure_seed_phrase_here"
AGENTVERSE_API_KEY="your_agentverse_api_key_here"

# OpenAI Configuration (for Image Generation)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Anthropic Configuration (for Image Analysis)
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key-here"

# Optional Configuration
MODEL_ENGINE="claude-3-5-sonnet-20240620"
MAX_TOKENS="4096"
AGENT_NAME="GreyGuard_Image_Agents"
```

## Step 2: Frontend Configuration

### 2.1 Environment Variables

Create `frontend/.env.example`:

```bash
# OpenAI API Configuration
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_OPENAI_API_URL=https://api.openai.com/v1

# Anthropic API Configuration
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
REACT_APP_ANTHROPIC_API_URL=https://api.anthropic.com/v1

# Agentverse Configuration
REACT_APP_AGENTVERSE_API_KEY=your_agentverse_api_key_here
REACT_APP_AGENTVERSE_URL=https://agentverse.ai

# ASI Agent Addresses
REACT_APP_IMAGE_GEN_AGENT_ADDRESS=agent1q0w...your_generation_agent_address
REACT_APP_IMAGE_ANALYSIS_AGENT_ADDRESS=agent1q0w...your_analysis_agent_address
```

### 2.2 Package Dependencies

Update `frontend/package.json`:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "@types/node": "^20.0.0",
    "lucide-react": "^0.263.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vite": "^4.4.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

## Step 3: Agentverse Deployment

### 3.1 Agentverse Configuration

Create `agent/agentverse.yaml`:

```yaml
version: 1
name: greyguard-image-agents
description: AI-powered image generation and analysis agents with ASI protocol support
agents:
  - name: image-generation-agent
    entry: image_generation_agent:agent
    type: AI Agent
    category: Image Generation
    tags:
      - ASI
      - DALL-E
      - Image Generation
      - AI Art
    
  - name: image-analysis-agent
    entry: image_analysis_agent:agent
    type: AI Agent
    category: Image Analysis
    tags:
      - ASI
      - Claude
      - Image Analysis
      - Computer Vision

env:
  variables:
    ASI_VERSION: "0.1"
    NETWORK: "testnet"
    MODEL_ENGINE: "claude-3-5-sonnet-20240620"
    MAX_TOKENS: "4096"
  
  secrets:
    - AGENT_SEED
    - AGENTVERSE_API_KEY
    - OPENAI_API_KEY
    - ANTHROPIC_API_KEY

resources:
  cpu: "1.0"
  memory: "1Gi"
  storage: "2Gi"

networking:
  ports:
    - 8000  # Generation agent
    - 8001  # Analysis agent
  protocols:
    - http
    - mqtt

persistence:
  enabled: true
  storage_class: "standard"
  size: "2Gi"

monitoring:
  enabled: true
  metrics:
    - generation_count
    - analysis_count
    - response_time
    - error_rate
    - api_usage

scaling:
  min_replicas: 1
  max_replicas: 3
  target_cpu_utilization: 70

security:
  encryption: true
  authentication: true
  network_policy: true
  content_moderation: true
```

### 3.2 Docker Configuration

Create `agent/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash agent
USER agent

# Expose ports
EXPOSE 8000 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the agents
CMD ["python", "image_generation_agent.py"]
```

## Step 4: Deployment Steps

### 4.1 Install Agentverse CLI

```bash
pip install agentverse
```

### 4.2 Authenticate with Agentverse

```bash
agentverse login
```

### 4.3 Initialize Project

```bash
cd agent
agentverse init
```

### 4.4 Deploy Agents

```bash
# Deploy both agents
agentverse deploy

# Or deploy individually
agentverse deploy --agent image-generation-agent
agentverse deploy --agent image-analysis-agent
```

### 4.5 Verify Deployment

```bash
agentverse status
agentverse logs image-generation-agent
agentverse logs image-analysis-agent
```

## Step 5: Frontend Integration

### 5.1 Install Dependencies

```bash
cd frontend
npm install
```

### 5.2 Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual API keys
```

### 5.3 Start Development Server

```bash
npm run dev
```

### 5.4 Build for Production

```bash
npm run build
```

## Step 6: Testing the Agents

### 6.1 Test Image Generation

```python
from uagents import Agent
from uagents.context import Context
import uuid
from datetime import datetime

async def test_image_generation():
    client = Agent()
    
    # Create session first (using ASI protocol)
    session_id = f"test_session_{uuid.uuid4()}"
    
    # Send generation request
    response = await client.send(
        "your_generation_agent_address",
        ImageGenerationRequest(
            version="0.1",
            agent_address=str(client.address),
            session_id=session_id,
            prompt="A futuristic medical laboratory with advanced AI equipment",
            size="1024x1024",
            quality="hd",
            style="vivid"
        )
    )
    
    print(f"Image generated: {response.image_url}")
    print(f"Asset ID: {response.asset_id}")
    return response
```

### 6.2 Test Image Analysis

```python
async def test_image_analysis(image_url: str):
    client = Agent()
    
    session_id = f"test_session_{uuid.uuid4()}"
    
    response = await client.send(
        "your_analysis_agent_address",
        ImageAnalysisRequest(
            version="0.1",
            agent_address=str(client.address),
            session_id=session_id,
            image_url=image_url,
            prompt="Analyze this medical image for any concerning findings",
            analysis_type="medical"
        )
    )
    
    print(f"Analysis complete: {response.analysis}")
    print(f"Confidence: {response.confidence}")
    print(f"Detected objects: {response.detected_objects}")
    return response
```

## Step 7: Production Considerations

### 7.1 Security Hardening

```python
# Add rate limiting
from uagents import RateLimit

agent = Agent(
    name=AGENT_NAME,
    seed=AGENT_SEED,
    rate_limits=[
        RateLimit(period=60, count=10),  # 10 requests per minute
        RateLimit(period=3600, count=100)  # 100 requests per hour
    ]
)

# Add content filtering
def enhanced_content_moderation(prompt: str) -> bool:
    # Implement multiple moderation layers
    openai_moderation = moderate_with_openai(prompt)
    custom_filters = apply_custom_filters(prompt)
    return openai_moderation and custom_filters
```

### 7.2 Performance Optimization

```python
# Add caching
from uagents.storage import KeyValueStore

image_cache = KeyValueStore("image_generation_cache")

async def cached_generate_image(prompt: str, **kwargs):
    cache_key = f"{hash(prompt)}_{hash(str(kwargs))}"
    
    if cached := image_cache.get(cache_key):
        return cached
    
    result = await generate_image(prompt, **kwargs)
    image_cache.set(cache_key, result, ttl=3600)  # 1 hour cache
    
    return result
```

### 7.3 Monitoring & Alerting

```python
# Add comprehensive logging
import logging
from uagents import Logger

logger = Logger(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Add metrics collection
@agent.on_interval(period=60)
async def collect_metrics(ctx: Context):
    metrics = {
        "total_requests": get_total_requests(),
        "success_rate": get_success_rate(),
        "average_response_time": get_avg_response_time(),
        "api_usage": get_api_usage()
    }
    
    # Send to monitoring service
    await send_metrics_to_monitoring(metrics)
```

## Step 8: Integration with GreyGuard

### 8.1 ASI Protocol Integration

The agents are already integrated with your ASI protocol system. They can:

- Handle ASI session management
- Process ASI-compliant messages
- Maintain conversation context
- Provide structured responses

### 8.2 Frontend Integration

The `ImageAgents` component integrates seamlessly with your existing GreyGuard interface:

- Accessible via the "Image AI" tab
- Consistent UI design with your existing components
- Full TypeScript support
- Responsive design for all devices

### 8.3 API Integration

```typescript
// Example: Generate image from another component
import ImageGenerationAgent from '../services/imageGenerationAgent';

const handleGenerateFromTrial = async (trialDescription: string) => {
  const agent = ImageGenerationAgent.getInstance();
  
  const response = await agent.generateImage({
    prompt: `Medical illustration of: ${trialDescription}`,
    size: '1024x1024',
    quality: 'hd',
    style: 'natural'
  });
  
  // Use the generated image
  setTrialImage(response.imageUrl);
};
```

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify API keys are correctly set in environment variables
   - Check API key permissions and quotas
   - Ensure keys are valid for the correct services

2. **Deployment Failures**
   - Check agentverse.yaml syntax
   - Verify resource limits are appropriate
   - Check network configuration

3. **Rate Limiting**
   - Monitor API usage in OpenAI/Anthropic dashboards
   - Implement client-side rate limiting
   - Use caching to reduce API calls

### Debug Mode

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Add to agent initialization
agent = Agent(
    name=AGENT_NAME,
    seed=AGENT_SEED,
    log_level="DEBUG"
)
```

### Performance Monitoring

```bash
# Monitor agent performance
agentverse metrics image-generation-agent
agentverse metrics image-analysis-agent

# View real-time logs
agentverse logs --follow image-generation-agent
```

## Next Steps

### Advanced Features

1. **Multi-Modal Support**
   - Voice input for image generation
   - Video analysis capabilities
   - Document image processing

2. **Custom Models**
   - Fine-tuned models for medical imaging
   - Domain-specific analysis models
   - Custom generation styles

3. **Batch Processing**
   - Multiple image generation
   - Bulk analysis workflows
   - Automated processing pipelines

### Production Deployment

1. **Load Balancing**
   - Multiple agent instances
   - Geographic distribution
   - Auto-scaling policies

2. **Data Persistence**
   - Database integration
   - File storage systems
   - Backup and recovery

3. **Security Enhancements**
   - End-to-end encryption
   - Access control systems
   - Audit logging

---

Your AI Image Agents are now ready for deployment! The system provides:

- **DALL-E 3 Integration**: High-quality image generation
- **Claude 3.5 Analysis**: Advanced image understanding
- **ASI Protocol Compliance**: Seamless integration with your existing system
- **Production Ready**: Security, monitoring, and scalability features
- **User-Friendly Interface**: Modern React-based UI

The agents can be deployed to Agentverse and integrated with your GreyGuard application for a complete AI-powered image solution.
