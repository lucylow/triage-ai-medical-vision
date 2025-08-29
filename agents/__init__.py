"""
Clinical Trial Matching System - uAgents Package

This package contains the Fetch.ai uAgents implementation for the clinical trial matching system.
It includes patient management, trial management, and matching engine agents with ASI protocol support.
"""

__version__ = "1.0.0"
__author__ = "GreyGuard Team"
__description__ = "Clinical Trial Matching uAgents with ASI Protocol Support"

from .patient_agent import PatientAgent
from .trial_agent import TrialAgent
from .matching_agent import MatchingAgent
from .base_agent import BaseAgent

__all__ = [
    "PatientAgent",
    "TrialAgent", 
    "MatchingAgent",
    "BaseAgent"
]
