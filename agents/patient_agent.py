"""
Patient Agent for Clinical Trial Matching System

This module implements a uAgent for patient management, including:
- Patient profile creation and management
- Encrypted health data storage
- Clinical trial matching requests
- Consent management
- ASI protocol integration
"""

import asyncio
import hashlib
import json
import logging
import os
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union

from uagents import Context, Protocol
from uagents.protocol import ProtocolMessage

from .base_agent import BaseAgent, AgentConfig, ASIMessage

logger = logging.getLogger(__name__)

# Patient-specific message types
class PatientMessage:
    CREATE_PROFILE = "create_profile"
    UPDATE_PROFILE = "update_profile"
    REQUEST_MATCHING = "request_matching"
    GRANT_CONSENT = "grant_consent"
    REVOKE_CONSENT = "revoke_consent"
    GET_MATCHES = "get_matches"
    DELETE_PROFILE = "delete_profile"

@ProtocolMessage
class PatientProfileRequest:
    """Request to create or update patient profile"""
    patient_id: str
    symptoms: List[str]
    location: str
    age_group: str
    gender: str
    encrypted_health_data: str
    consent_level: str
    timestamp: str

@ProtocolMessage
class PatientProfileResponse:
    """Response to profile creation/update"""
    success: bool
    patient_id: str
    message: str
    profile_hash: str
    btc_anchor: Optional[str]
    timestamp: str

@ProtocolMessage
class MatchingRequest:
    """Request for clinical trial matching"""
    patient_id: str
    symptoms: List[str]
    location: str
    age_group: str
    gender: str
    consent_level: str
    timestamp: str

@ProtocolMessage
class MatchingResponse:
    """Response with matching trials"""
    patient_id: str
    matches: List[Dict[str, Any]]
    total_matches: int
    timestamp: str

@ProtocolMessage
class ConsentRequest:
    """Request for patient consent"""
    patient_id: str
    trial_id: str
    data_requirements: List[str]
    purpose: str
    duration: str
    timestamp: str

@ProtocolMessage
class ConsentResponse:
    """Response to consent request"""
    patient_id: str
    trial_id: str
    granted: bool
    consent_id: str
    timestamp: str

class PatientAgent(BaseAgent):
    """
    Patient Agent for managing patient profiles and clinical trial matching.
    
    Features:
    - Secure patient profile management
    - Encrypted health data storage
    - Clinical trial matching requests
    - Consent management with ASI protocol
    - Bitcoin anchoring for audit trails
    """
    
    def __init__(self, config: AgentConfig):
        super().__init__(config)
        
        # Patient data storage
        self.patients: Dict[str, Dict[str, Any]] = {}
        self.consents: Dict[str, Dict[str, Any]] = {}
        self.matching_history: Dict[str, List[Dict[str, Any]]] = {}
        
        # Load existing data
        self._load_patient_data()
        
        # Register patient-specific protocols
        self._register_patient_protocols()
        
        logger.info(f"Patient Agent {config.name} initialized")
    
    def _register_patient_protocols(self):
        """Register patient-specific protocols"""
        
        # Profile management protocol
        profile_protocol = Protocol()
        
        @profile_protocol.on_message(PatientProfileRequest)
        async def handle_profile_request(ctx: Context, sender: str, msg: PatientProfileRequest):
            """Handle profile creation/update requests"""
            try:
                if msg.patient_id in self.patients:
                    # Update existing profile
                    result = await self._update_patient_profile(msg)
                else:
                    # Create new profile
                    result = await self._create_patient_profile(msg)
                
                response = PatientProfileResponse(
                    success=result["success"],
                    patient_id=msg.patient_id,
                    message=result["message"],
                    profile_hash=result["profile_hash"],
                    btc_anchor=result.get("btc_anchor"),
                    timestamp=datetime.now().isoformat()
                )
                
                await ctx.send(sender, response)
                
            except Exception as e:
                logger.error(f"Profile request handling failed: {e}")
                error_response = PatientProfileResponse(
                    success=False,
                    patient_id=msg.patient_id,
                    message=f"Error: {str(e)}",
                    profile_hash="",
                    btc_anchor=None,
                    timestamp=datetime.now().isoformat()
                )
                await ctx.send(sender, error_response)
        
        # Matching protocol
        matching_protocol = Protocol()
        
        @matching_protocol.on_message(MatchingRequest)
        async def handle_matching_request(ctx: Context, sender: str, msg: MatchingRequest):
            """Handle clinical trial matching requests"""
            try:
                matches = await self._find_matching_trials(msg)
                
                response = MatchingResponse(
                    patient_id=msg.patient_id,
                    matches=matches,
                    total_matches=len(matches),
                    timestamp=datetime.now().isoformat()
                )
                
                await ctx.send(sender, response)
                
                # Store matching history
                self.matching_history[msg.patient_id] = matches
                
            except Exception as e:
                logger.error(f"Matching request handling failed: {e}")
                error_response = MatchingResponse(
                    patient_id=msg.patient_id,
                    matches=[],
                    total_matches=0,
                    timestamp=datetime.now().isoformat()
                )
                await ctx.send(sender, error_response)
        
        # Consent protocol
        consent_protocol = Protocol()
        
        @consent_protocol.on_message(ConsentRequest)
        async def handle_consent_request(ctx: Context, sender: str, msg: ConsentRequest):
            """Handle consent requests"""
            try:
                # Store consent request for patient review
                consent_id = str(uuid.uuid4())
                self.consents[consent_id] = {
                    "patient_id": msg.patient_id,
                    "trial_id": msg.trial_id,
                    "data_requirements": msg.data_requirements,
                    "purpose": msg.purpose,
                    "duration": msg.duration,
                    "status": "pending",
                    "timestamp": msg.timestamp,
                    "requestor": sender
                }
                
                # Send ASI message to notify patient
                await self._notify_patient_consent_request(msg.patient_id, consent_id)
                
                # For demo purposes, auto-grant consent
                # In production, this would require patient interaction
                consent_granted = await self._auto_grant_consent(consent_id)
                
                response = ConsentResponse(
                    patient_id=msg.patient_id,
                    trial_id=msg.trial_id,
                    granted=consent_granted,
                    consent_id=consent_id,
                    timestamp=datetime.now().isoformat()
                )
                
                await ctx.send(sender, response)
                
            except Exception as e:
                logger.error(f"Consent request handling failed: {e}")
                error_response = ConsentResponse(
                    patient_id=msg.patient_id,
                    trial_id=msg.trial_id,
                    granted=False,
                    consent_id="",
                    timestamp=datetime.now().isoformat()
                )
                await ctx.send(sender, error_response)
        
        # Register protocols with agent
        self.agent.add_protocol(profile_protocol)
        self.agent.add_protocol(matching_protocol)
        self.agent.add_protocol(consent_protocol)
    
    async def _create_patient_profile(self, msg: PatientProfileRequest) -> Dict[str, Any]:
        """Create a new patient profile"""
        try:
            # Generate patient ID if not provided
            patient_id = msg.patient_id or str(uuid.uuid4())
            
            # Create profile hash
            profile_data = {
                "symptoms": msg.symptoms,
                "location": msg.location,
                "age_group": msg.age_group,
                "gender": msg.gender,
                "consent_level": msg.consent_level,
                "timestamp": msg.timestamp
            }
            
            profile_hash = hashlib.sha256(
                json.dumps(profile_data, sort_keys=True).encode()
            ).hexdigest()
            
            # Store patient profile
            self.patients[patient_id] = {
                "id": patient_id,
                "symptoms": msg.symptoms,
                "location": msg.location,
                "age_group": msg.age_group,
                "gender": msg.gender,
                "encrypted_health_data": msg.encrypted_health_data,
                "consent_level": msg.consent_level,
                "profile_hash": profile_hash,
                "created_at": msg.timestamp,
                "updated_at": msg.timestamp,
                "btc_anchor": None,
                "zk_public_key": self._generate_zk_public_key(patient_id)
            }
            
            # Store in Redis for persistence
            await self.store_session_data(f"patient:{patient_id}", self.patients[patient_id])
            
            # Anchor to Bitcoin (simulated for demo)
            btc_anchor = await self._anchor_to_bitcoin(profile_hash)
            if btc_anchor:
                self.patients[patient_id]["btc_anchor"] = btc_anchor
            
            logger.info(f"Created patient profile: {patient_id}")
            
            return {
                "success": True,
                "message": "Patient profile created successfully",
                "profile_hash": profile_hash,
                "btc_anchor": btc_anchor
            }
            
        except Exception as e:
            logger.error(f"Failed to create patient profile: {e}")
            return {
                "success": False,
                "message": f"Failed to create profile: {str(e)}",
                "profile_hash": "",
                "btc_anchor": None
            }
    
    async def _update_patient_profile(self, msg: PatientProfileRequest) -> Dict[str, Any]:
        """Update existing patient profile"""
        try:
            patient_id = msg.patient_id
            
            if patient_id not in self.patients:
                raise ValueError(f"Patient {patient_id} not found")
            
            # Update profile data
            self.patients[patient_id].update({
                "symptoms": msg.symptoms,
                "location": msg.location,
                "age_group": msg.age_group,
                "gender": msg.gender,
                "encrypted_health_data": msg.encrypted_health_data,
                "consent_level": msg.consent_level,
                "updated_at": msg.timestamp
            })
            
            # Recalculate profile hash
            profile_data = {
                "symptoms": msg.symptoms,
                "location": msg.location,
                "age_group": msg.age_group,
                "gender": msg.gender,
                "consent_level": msg.consent_level,
                "timestamp": msg.timestamp
            }
            
            profile_hash = hashlib.sha256(
                json.dumps(profile_data, sort_keys=True).encode()
            ).hexdigest()
            
            self.patients[patient_id]["profile_hash"] = profile_hash
            
            # Store updated profile in Redis
            await self.store_session_data(f"patient:{patient_id}", self.patients[patient_id])
            
            # Update Bitcoin anchor
            btc_anchor = await self._anchor_to_bitcoin(profile_hash)
            if btc_anchor:
                self.patients[patient_id]["btc_anchor"] = btc_anchor
            
            logger.info(f"Updated patient profile: {patient_id}")
            
            return {
                "success": True,
                "message": "Patient profile updated successfully",
                "profile_hash": profile_hash,
                "btc_anchor": btc_anchor
            }
            
        except Exception as e:
            logger.error(f"Failed to update patient profile: {e}")
            return {
                "success": False,
                "message": f"Failed to update profile: {str(e)}",
                "profile_hash": "",
                "btc_anchor": None
            }
    
    async def _find_matching_trials(self, msg: MatchingRequest) -> List[Dict[str, Any]]:
        """Find matching clinical trials for patient"""
        try:
            # This would typically query the trial agent or database
            # For demo purposes, return mock matches
            
            mock_trials = [
                {
                    "trial_id": "TRIAL_001",
                    "title": "Diabetes Treatment Study",
                    "description": "Investigating new diabetes treatment options",
                    "match_score": 0.95,
                    "eligibility_proof": "zk_proof_001",
                    "consent_required": True,
                    "data_requirements": ["blood_glucose", "medication_history"],
                    "sponsor": "Research Institute A",
                    "location": msg.location,
                    "recruitment_status": "active"
                },
                {
                    "trial_id": "TRIAL_002", 
                    "title": "Cardiovascular Health Research",
                    "description": "Study on cardiovascular disease prevention",
                    "match_score": 0.87,
                    "eligibility_proof": "zk_proof_002",
                    "consent_required": True,
                    "data_requirements": ["blood_pressure", "cholesterol_levels"],
                    "sponsor": "Medical Center B",
                    "location": msg.location,
                    "recruitment_status": "active"
                }
            ]
            
            # Filter by symptoms and other criteria
            filtered_trials = []
            for trial in mock_trials:
                if any(symptom in trial["title"].lower() for symptom in msg.symptoms):
                    filtered_trials.append(trial)
            
            logger.info(f"Found {len(filtered_trials)} matching trials for patient {msg.patient_id}")
            return filtered_trials
            
        except Exception as e:
            logger.error(f"Failed to find matching trials: {e}")
            return []
    
    async def _notify_patient_consent_request(self, patient_id: str, consent_id: str):
        """Notify patient of consent request via ASI protocol"""
        try:
            message = ASIMessage(
                session_id=consent_id,
                message_type="consent_request",
                payload={
                    "patient_id": patient_id,
                    "consent_id": consent_id,
                    "action": "review_consent"
                },
                timestamp=datetime.now().isoformat()
            )
            
            # Send to patient's notification endpoint
            await self.send_asi_message(f"patient_{patient_id}", message)
            
        except Exception as e:
            logger.error(f"Failed to notify patient of consent request: {e}")
    
    async def _auto_grant_consent(self, consent_id: str) -> bool:
        """Auto-grant consent for demo purposes"""
        try:
            if consent_id in self.consents:
                self.consents[consent_id]["status"] = "granted"
                self.consents[consent_id]["granted_at"] = datetime.now().isoformat()
                
                # Store consent in Redis
                await self.store_session_data(f"consent:{consent_id}", self.consents[consent_id])
                
                logger.info(f"Auto-granted consent: {consent_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to auto-grant consent: {e}")
            return False
    
    async def _anchor_to_bitcoin(self, data_hash: str) -> Optional[str]:
        """Anchor data hash to Bitcoin blockchain (simulated)"""
        try:
            # In production, this would make an actual Bitcoin transaction
            # For demo purposes, return a mock transaction hash
            
            # Simulate API call to Bitcoin service
            btc_response = await self.make_http_request(
                url="https://api.bitcoin.testnet/transaction",
                method="POST",
                data={
                    "data_hash": data_hash,
                    "timestamp": datetime.now().isoformat(),
                    "description": "Clinical trial data anchor"
                }
            )
            
            if btc_response:
                return btc_response.get("transaction_hash")
            else:
                # Return mock hash for demo
                return f"mock_btc_tx_{data_hash[:16]}"
                
        except Exception as e:
            logger.warning(f"Bitcoin anchoring failed: {e}")
            return None
    
    def _generate_zk_public_key(self, patient_id: str) -> str:
        """Generate ZK public key for patient (simplified)"""
        # In production, this would use proper ZK proof generation
        return f"zk_pub_{patient_id}_{hashlib.sha256(patient_id.encode()).hexdigest()[:16]}"
    
    def _load_patient_data(self):
        """Load patient data from storage"""
        try:
            # In production, this would load from persistent storage
            # For demo purposes, start with empty data
            pass
        except Exception as e:
            logger.warning(f"Failed to load patient data: {e}")
    
    async def start(self):
        """Start the patient agent"""
        try:
            logger.info(f"Starting Patient Agent: {self.config.name}")
            
            # Start the agent
            self.agent.run()
            
        except Exception as e:
            logger.error(f"Failed to start Patient Agent: {e}")
    
    async def stop(self):
        """Stop the patient agent"""
        try:
            logger.info(f"Stopping Patient Agent: {self.config.name}")
            
            # Cleanup and stop
            if self.redis_client:
                await self.redis_client.close()
            
        except Exception as e:
            logger.error(f"Failed to stop Patient Agent: {e}")
    
    def get_patient_count(self) -> int:
        """Get total number of patients"""
        return len(self.patients)
    
    def get_consent_count(self) -> int:
        """Get total number of consents"""
        return len(self.consents)
    
    def get_matching_history_count(self) -> int:
        """Get total number of matching requests"""
        return len(self.matching_history)

# Main execution
if __name__ == "__main__":
    # Configuration
    config = AgentConfig(
        name="PatientAgent",
        seed="patient_agent_seed_12345",
        port=8002,
        endpoint="http://localhost:8002",
        network="testnet",
        enable_funding=True
    )
    
    # Create and run agent
    agent = PatientAgent(config)
    
    try:
        asyncio.run(agent.start())
    except KeyboardInterrupt:
        print("Patient Agent stopped by user")
    except Exception as e:
        print(f"Patient Agent error: {e}")
