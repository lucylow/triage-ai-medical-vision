#!/usr/bin/env python3
"""
ASI:One Integration Service for GreyGuard Trials
Provides enhanced AI capabilities through ASI:One API integration
"""

import os
import json
import asyncio
import aiohttp
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ASIModel(str, Enum):
    """Available ASI:One models"""
    ASI1_MINI = "asi1-mini"
    ASI1_PRO = "asi1-pro"

@dataclass
class ASIMessage:
    """ASI:One message structure"""
    role: str
    content: str

@dataclass
class ASIChatRequest:
    """ASI:One chat completion request"""
    model: str
    messages: List[ASIMessage]
    temperature: float = 0.7
    stream: bool = True
    max_tokens: int = 0
    context: Optional[str] = None

@dataclass
class ASIChatResponse:
    """ASI:One chat completion response"""
    id: str
    model: str
    choices: List[Dict[str, Any]]
    created: int
    conversation_id: Optional[str] = None
    usage: Optional[Dict[str, int]] = None

@dataclass
class ASIStreamChunk:
    """ASI:One streaming chunk"""
    type: str
    content: Optional[str] = None
    thought: Optional[str] = None
    error: Optional[str] = None

class ASIOneService:
    """ASI:One API integration service"""
    
    def __init__(self):
        self.api_url = "https://api.asi1.ai/v1/chat/completions"
        self.api_key = os.getenv("ASI_API_KEY")
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limit_reset = datetime.now()
        self.request_count = 0
        self.max_requests_per_minute = 60
        
        if not self.api_key:
            logger.warning("ASI_API_KEY not found in environment variables")
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def check_health(self) -> bool:
        """Check ASI:One service health"""
        try:
            if not self.session:
                return False
                
            async with self.session.get(
                self.api_url.replace("/chat/completions", "/health")
            ) as response:
                return response.status == 200
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
    
    async def validate_api_key(self) -> bool:
        """Validate API key"""
        return bool(self.api_key)
    
    async def _check_rate_limit(self) -> bool:
        """Check and update rate limiting"""
        now = datetime.now()
        
        # Reset counter if minute has passed
        if now - self.rate_limit_reset >= timedelta(minutes=1):
            self.request_count = 0
            self.rate_limit_reset = now
        
        # Check if we're under the limit
        if self.request_count >= self.max_requests_per_minute:
            return False
        
        self.request_count += 1
        return True
    
    async def create_chat_completion(
        self,
        messages: List[ASIMessage],
        temperature: float = 0.7,
        stream: bool = True,
        max_tokens: int = 0,
        context: Optional[str] = None
    ) -> List[ASIStreamChunk]:
        """Create chat completion with ASI:One"""
        
        # Check rate limiting
        if not await self._check_rate_limit():
            raise Exception("Rate limit exceeded. Please wait before making another request.")
        
        # Validate API key
        if not await self.validate_api_key():
            raise Exception("Invalid or missing API key")
        
        # Prepare request
        request_data = {
            "model": ASIModel.ASI1_MINI.value,
            "messages": [{"role": msg.role, "content": msg.content} for msg in messages],
            "temperature": temperature,
            "stream": stream,
            "max_tokens": max_tokens
        }
        
        if context:
            request_data["context"] = context
        
        try:
            if not self.session:
                raise Exception("Session not initialized")
            
            async with self.session.post(
                self.api_url,
                json=request_data
            ) as response:
                
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"ASI:One API error {response.status}: {error_text}")
                    raise Exception(f"API error {response.status}: {error_text}")
                
                if stream:
                    return await self._handle_streaming_response(response)
                else:
                    return await self._handle_non_streaming_response(response)
                    
        except Exception as e:
            logger.error(f"Chat completion failed: {e}")
            raise
    
    async def _handle_streaming_response(self, response: aiohttp.ClientResponse) -> List[ASIStreamChunk]:
        """Handle streaming response from ASI:One"""
        chunks = []
        
        try:
            async for line in response.content:
                line_str = line.decode('utf-8').strip()
                
                if not line_str.startswith('data:'):
                    continue
                
                # Parse the data line
                data_str = line_str[5:].strip()
                
                if data_str == '[DONE]':
                    chunks.append(ASIStreamChunk(type='done'))
                    break
                
                try:
                    data = json.loads(data_str)
                    chunk = self._parse_stream_chunk(data)
                    if chunk:
                        chunks.append(chunk)
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse JSON chunk: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Streaming response handling failed: {e}")
            chunks.append(ASIStreamChunk(
                type='error',
                error='Failed to process streaming response'
            ))
        
        return chunks
    
    async def _handle_non_streaming_response(self, response: aiohttp.ClientResponse) -> List[ASIStreamChunk]:
        """Handle non-streaming response from ASI:One"""
        try:
            data = await response.json()
            content = data.get('choices', [{}])[0].get('delta', {}).get('content', '')
            
            return [ASIStreamChunk(
                type='content',
                content=content
            )]
        except Exception as e:
            logger.error(f"Non-streaming response handling failed: {e}")
            return [ASIStreamChunk(
                type='error',
                error='Failed to process response'
            )]
    
    def _parse_stream_chunk(self, data: Dict[str, Any]) -> Optional[ASIStreamChunk]:
        """Parse individual stream chunk"""
        try:
            # Handle content chunks
            if 'choices' in data and data['choices']:
                choice = data['choices'][0]
                if 'delta' in choice and 'content' in choice['delta']:
                    return ASIStreamChunk(
                        type='content',
                        content=choice['delta']['content']
                    )
            
            # Handle thought chunks (ASI:One specific)
            if 'thought' in data:
                return ASIStreamChunk(
                    type='thought',
                    thought=data['thought']
                )
            
            # Handle initialization chunks
            if 'init_thought' in data:
                return ASIStreamChunk(type='init_thought')
            
            return None
            
        except Exception as e:
            logger.warning(f"Failed to parse stream chunk: {e}")
            return None
    
    # Clinical Trial Specific Methods
    
    async def get_trial_recommendations(
        self,
        symptoms: str,
        location: str,
        medical_history: str = ""
    ) -> str:
        """Get clinical trial recommendations using ASI:One"""
        
        system_message = ASIMessage(
            role="system",
            content="""You are a clinical trial matching specialist. Your role is to help patients find relevant clinical trials based on their symptoms, location, and medical history. Provide clear, helpful information and suggest specific types of trials to look for. Always be encouraging and supportive."""
        )
        
        user_message = ASIMessage(
            role="user",
            content=f"""I'm looking for clinical trials. My symptoms are: {symptoms}. I'm located in: {location}. {f"My medical history includes: {medical_history}" if medical_history else ""}"""
        )
        
        try:
            chunks = await self.create_chat_completion(
                [system_message, user_message],
                temperature=0.3,
                stream=False
            )
            
            return chunks[0].content if chunks and chunks[0].content else "Unable to generate recommendations."
            
        except Exception as e:
            logger.error(f"Trial recommendations failed: {e}")
            return "I apologize, but I encountered an error while searching for trial recommendations. Please try again or contact support."
    
    async def explain_medical_term(self, term: str) -> str:
        """Explain medical terms using ASI:One"""
        
        system_message = ASIMessage(
            role="system",
            content="""You are a medical terminology expert. Explain medical terms in simple, easy-to-understand language that patients can comprehend. Use analogies when helpful and always prioritize clarity. Always recommend consulting healthcare providers for medical decisions."""
        )
        
        user_message = ASIMessage(
            role="user",
            content=f"""Can you explain what "{term}" means in simple terms?"""
        )
        
        try:
            chunks = await self.create_chat_completion(
                [system_message, user_message],
                temperature=0.2,
                stream=False
            )
            
            return chunks[0].content if chunks and chunks[0].content else "Unable to explain this term."
            
        except Exception as e:
            logger.error(f"Medical term explanation failed: {e}")
            return "I apologize, but I encountered an error while explaining this term. Please try again or consult with your healthcare provider."
    
    async def check_eligibility(
        self,
        trial_criteria: str,
        patient_profile: str
    ) -> str:
        """Check trial eligibility using ASI:One"""
        
        system_message = ASIMessage(
            role="system",
            content="""You are a clinical trial eligibility specialist. Analyze whether a patient profile matches trial criteria and provide clear reasoning. Be honest about uncertainties and suggest what additional information might be needed. Always prioritize patient safety."""
        )
        
        user_message = ASIMessage(
            role="user",
            content=f"""Trial Criteria: {trial_criteria}\n\nPatient Profile: {patient_profile}\n\nBased on this information, what's your assessment of eligibility?"""
        )
        
        try:
            chunks = await self.create_chat_completion(
                [system_message, user_message],
                temperature=0.1,
                stream=False
            )
            
            return chunks[0].content if chunks and chunks[0].content else "Unable to assess eligibility."
            
        except Exception as e:
            logger.error(f"Eligibility check failed: {e}")
            return "I apologize, but I encountered an error while checking eligibility. Please try again or consult with the trial coordinator."
    
    async def analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analyze message intent using ASI:One"""
        
        system_message = ASIMessage(
            role="system",
            content="""You are an intent analysis specialist. Analyze the user's message and classify their intent. Return a JSON response with: intent (string), confidence (0-1), entities (list), suggestedActions (list)."""
        )
        
        user_message = ASIMessage(
            role="user",
            content=message
        )
        
        try:
            chunks = await self.create_chat_completion(
                [system_message, user_message],
                temperature=0.1,
                stream=False
            )
            
            if chunks and chunks[0].content:
                try:
                    return json.loads(chunks[0].content)
                except json.JSONDecodeError:
                    # Fallback to simple analysis
                    return self._simple_intent_analysis(message)
            
            return self._simple_intent_analysis(message)
            
        except Exception as e:
            logger.error(f"Intent analysis failed: {e}")
            return self._simple_intent_analysis(message)
    
    def _simple_intent_analysis(self, message: str) -> Dict[str, Any]:
        """Simple fallback intent analysis"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['trial', 'study', 'research']):
            return {
                "intent": "trial_search",
                "confidence": 0.9,
                "entities": [],
                "suggestedActions": ["search_trials", "explain_criteria", "check_eligibility"]
            }
        elif any(word in message_lower for word in ['location', 'where', 'near']):
            return {
                "intent": "location_query",
                "confidence": 0.8,
                "entities": [],
                "suggestedActions": ["find_nearby_trials", "check_travel_options"]
            }
        elif any(word in message_lower for word in ['hello', 'hi', 'hey']):
            return {
                "intent": "greeting",
                "confidence": 0.95,
                "entities": [],
                "suggestedActions": ["search_trials", "explain_terms", "check_eligibility"]
            }
        else:
            return {
                "intent": "general_inquiry",
                "confidence": 0.7,
                "entities": [],
                "suggestedActions": ["search_trials", "explain_terms", "get_help"]
            }

# Example usage and testing
async def main():
    """Example usage of ASI:One service"""
    
    async with ASIOneService() as service:
        # Check health
        health = await service.check_health()
        print(f"Service health: {health}")
        
        # Test API key
        valid = await service.validate_api_key()
        print(f"API key valid: {valid}")
        
        if valid:
            # Test trial recommendations
            recommendations = await service.get_trial_recommendations(
                "Stage III lung cancer",
                "New York, NY"
            )
            print(f"Trial recommendations: {recommendations}")
            
            # Test medical term explanation
            explanation = await service.explain_medical_term("immunotherapy")
            print(f"Medical term explanation: {explanation}")
            
            # Test intent analysis
            intent = await service.analyze_intent("I need help finding clinical trials for diabetes")
            print(f"Intent analysis: {intent}")

if __name__ == "__main__":
    asyncio.run(main())
