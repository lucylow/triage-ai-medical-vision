use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller;
use ic_cdk::export::candid;
use ic_cdk_macros::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};

// Types matching our Candid interface
#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct Patient {
    pub id: String,
    pub principal: String,
    pub name: String,
    pub age: u32,
    pub conditions: Vec<String>,
    pub location: String,
    pub preferences: Vec<String>,
    pub created_at: i64,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct ClinicalTrial {
    pub id: String,
    pub title: String,
    pub description: String,
    pub conditions: Vec<String>,
    pub location: String,
    pub requirements: Vec<String>,
    pub compensation: String,
    pub duration: String,
    pub status: String,
    pub created_at: i64,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct Match {
    pub id: String,
    pub patient_id: String,
    pub trial_id: String,
    pub match_score: f64,
    pub status: String,
    pub created_at: i64,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct FetchAgent {
    pub id: String,
    pub name: String,
    pub address: String,
    pub capabilities: Vec<String>,
    pub status: String,
}

// State storage
static mut PATIENTS: Option<HashMap<String, Patient>> = None;
static mut TRIALS: Option<HashMap<String, ClinicalTrial>> = None;
static mut MATCHES: Option<HashMap<String, Match>> = None;
static mut FETCH_AGENTS: Option<HashMap<String, FetchAgent>> = None;

// Initialize canister
#[init]
fn init() {
    unsafe {
        PATIENTS = Some(HashMap::new());
        TRIALS = Some(HashMap::new());
        MATCHES = Some(HashMap::new());
        FETCH_AGENTS = Some(HashMap::new());
        
        // Register default Fetch.ai agents
        let default_agents = vec![
            FetchAgent {
                id: "patient_agent".to_string(),
                name: "Patient Analysis Agent".to_string(),
                address: "fetch1h6u0j6u0j6u0j6u0j6u0j6u0j6u0j6u0".to_string(),
                capabilities: vec!["patient_analysis".to_string(), "condition_matching".to_string()],
                status: "active".to_string(),
            },
            FetchAgent {
                id: "trial_agent".to_string(),
                name: "Trial Matching Agent".to_string(),
                address: "fetch1h6u0j6u0j6u0j6u0j6u0j6u0j6u0j6u1".to_string(),
                capabilities: vec!["trial_analysis".to_string(), "matching_algorithm".to_string()],
                status: "active".to_string(),
            },
        ];
        
        for agent in default_agents {
            FETCH_AGENTS.as_mut().unwrap().insert(agent.id.clone(), agent);
        }
    }
}

// Patient management
#[update]
pub fn register_patient(patient: Patient) -> String {
    let caller_principal = caller().to_string();
    let patient_id = Uuid::new_v4().to_string();
    
    let mut new_patient = patient;
    new_patient.id = patient_id.clone();
    new_patient.principal = caller_principal;
    new_patient.created_at = Utc::now().timestamp();
    
    unsafe {
        PATIENTS.as_mut().unwrap().insert(patient_id.clone(), new_patient);
    }
    
    patient_id
}

#[query]
pub fn get_patient(id: String) -> Option<Patient> {
    unsafe {
        PATIENTS.as_ref().unwrap().get(&id).cloned()
    }
}

// Clinical trial management
#[update]
pub fn create_trial(trial: ClinicalTrial) -> String {
    let trial_id = Uuid::new_v4().to_string();
    
    let mut new_trial = trial;
    new_trial.id = trial_id.clone();
    new_trial.created_at = Utc::now().timestamp();
    
    unsafe {
        TRIALS.as_mut().unwrap().insert(trial_id.clone(), new_trial);
    }
    
    trial_id
}

#[query]
pub fn get_all_trials() -> Vec<ClinicalTrial> {
    unsafe {
        TRIALS.as_ref().unwrap().values().cloned().collect()
    }
}

// Fetch.ai agent integration
#[query]
pub fn get_fetch_agents() -> Vec<FetchAgent> {
    unsafe {
        FETCH_AGENTS.as_ref().unwrap().values().cloned().collect()
    }
}

#[update]
pub fn trigger_agent_analysis(patient_id: String) -> String {
    // This would integrate with Fetch.ai agents
    // For now, return a mock analysis result
    format!("Analysis triggered for patient {} via Fetch.ai agents", patient_id)
}

// ICP-specific features
#[query]
pub fn get_canister_info() -> String {
    "GreyGuard Trials - ICP Canister v1.0.0".to_string()
}

#[query]
pub fn get_cycle_balance() -> u64 {
    // This would return actual cycle balance
    1000000 // Mock value
}
