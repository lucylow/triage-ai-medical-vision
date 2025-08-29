import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Debug "mo:base/Debug";
import Error "mo:base/Error";

actor ClinicalTrialCanister {
    // ========== TYPE DEFINITIONS ==========
    public type PatientID = Text;  // ZK-anonymized identifier
    public type TrialID = Text;
    public type Symptom = Text;
    public type Location = Text;
    public type AgeGroup = { #child; #adult; #senior };
    public type Gender = { #male; #female; #nonbinary; #unspecified };
    public type ConsentStatus = { #granted; #revoked; #pending };
    public type AuditAction = {
        #patientCreated;
        #trialAdded;
        #matchRequested;
        #dataDeleted;
        #consentUpdated;
        #keyRotated;
        #systemInit;
        #systemError;
    };

    public type PatientProfile = {
        id : PatientID;
        symptoms : [Symptom];
        location : Location;
        ageGroup : AgeGroup;
        gender : Gender;
        encryptedData : Text;  // Simplified for demo
        dataHash : Text;
        consent : ConsentStatus;
        timestamp : Int;
        btcAnchor : ?Text;  // Bitcoin transaction hash
        zkPublicKey : Text; // For ZK proofs (simplified)
    };

    public type ClinicalTrial = {
        id : TrialID;
        title : Text;
        description : Text;
        requiredSymptoms : [Symptom];
        locations : [Location];
        ageRange : { min : Nat; max : Nat };
        genderEligibility : [Gender];
        recruitmentStatus : { #active; #paused; #completed };
        sponsor : Principal;  // Trial owner
        zkCircuit : Text;    // ZK circuit for eligibility
        dataSchema : Text;   // JSON schema for patient data
    };

    public type MatchResult = {
        trialId : TrialID;
        matchScore : Float;
        eligibilityProof : Text;
        consentRequired : Bool;
        dataRequirements : [Text]; // Required data fields
    };

    public type AgentCallback = {
        #consentRequest : { patientId : PatientID; trialId : TrialID; callbackEndpoint : Text };
        #matchNotification : { patientId : PatientID; trialIds : [TrialID] };
    };

    // ========== STATE MANAGEMENT ==========
    private stable var patientStoreStable : [(PatientID, PatientProfile)] = [];
    private stable var trialStoreStable : [(TrialID, ClinicalTrial)] = [];
    private stable var auditLogStable : [(Int, Principal, AuditAction, Text)] = [];
    private stable var keyRotationTime : Int = 0;
    private stable var rateLimitsStable : [(Principal, (Int, Nat))] = []; // (timestamp, count)

    private let patients = HashMap.fromIter<PatientID, PatientProfile>(
        patientStoreStable.vals(), 10, Text.equal, Text.hash
    );
    
    private let trials = HashMap.fromIter<TrialID, ClinicalTrial>(
        trialStoreStable.vals(), 10, Text.equal, Text.hash
    );

    private let rateLimitMap = HashMap.fromIter<Principal, (Int, Nat)>(
        rateLimitsStable.vals(), 10, Principal.equal, Principal.hash
    );

    private var auditLog : [(Int, Principal, AuditAction, Text)] = auditLogStable;

    // ========== CONSTANTS ==========
    private let KEY_ROTATION_INTERVAL : Int = 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days in nanoseconds
    private let MAX_REQUESTS_PER_MINUTE : Nat = 100;

    // ========== INITIALIZATION ==========
    system func init() {
        keyRotationTime := Time.now();
        _logAction(null, #systemInit, "Canister initialized");
    };

    // ========== CRYPTO UTILITIES ==========
    private func _encryptData(data : Text) : (Text, Text) {
        // Simplified encryption for demo - in production use proper AES-256
        let encrypted = "encrypted_" # data # "_" # Int.toText(Time.now());
        let hash = "hash_" # Int.toText(Text.hash(data));
        (encrypted, hash)
    };

    private func _decryptData(encrypted : Text) : ?Text {
        // Simplified decryption for demo
        if (Text.startsWith(encrypted, #text "encrypted_")) {
            let parts = Text.split(encrypted, #char '_');
            switch (Iter.toArray(parts)) {
                case ([_, data, _]) { ?data };
                case _ { null };
            }
        } else { null }
    };

    private func _generateZKProof(
        patient : PatientProfile,
        trial : ClinicalTrial
    ) : Text {
        // Placeholder for real ZK proof generation
        "ZK_PROOF:" # patient.id # "|" # trial.id # "|" # Int.toText(Time.now())
    };

    private func _anchorPatientToBTC(patientId : PatientID, hash : Text) : async Text {
        // Simulated Bitcoin anchoring
        "btc_" # Int.toText(Time.now()) # "_" # patientId # "_" # hash
    };

    // ========== RATE LIMITING ==========
    private func _checkRateLimit(caller : Principal) : Bool {
        let now = Time.now();
        switch (rateLimitMap.get(caller)) {
            case (?(lastTime, count)) {
                if (now - lastTime < 60_000_000_000) { // 1 minute
                    if (count >= MAX_REQUESTS_PER_MINUTE) { return false };
                    rateLimitMap.put(caller, (lastTime, count + 1));
                } else {
                    rateLimitMap.put(caller, (now, 1));
                };
            };
            case null { rateLimitMap.put(caller, (now, 1)) };
        };
        true
    };

    // ========== CORE FUNCTIONALITY ==========
    /// Creates new patient profile with encrypted data
    public shared(msg) func createPatient(
        symptoms : [Symptom],
        location : Location,
        ageGroup : AgeGroup,
        gender : Gender,
        sensitiveData : Text,
        zkPublicKey : Text
    ) : async PatientID {
        // Input validation
        if (symptoms.size() == 0) {
            throw Error.reject("At least one symptom required");
        };
        if (Text.size(location) == 0) {
            throw Error.reject("Location cannot be empty");
        };

        // Generate anonymized ID
        let pid = "patient_" # Int.toText(Time.now()) # "_" # Int.toText(Text.hash(sensitiveData));

        // Encrypt sensitive data
        let (encrypted, hash) = _encryptData(sensitiveData);

        // Create profile
        let profile : PatientProfile = {
            id = pid;
            symptoms = symptoms;
            location = location;
            ageGroup = ageGroup;
            gender = gender;
            encryptedData = encrypted;
            dataHash = hash;
            consent = #pending;
            timestamp = Time.now();
            btcAnchor = null;
            zkPublicKey = zkPublicKey;
        };

        // Store data
        patients.put(pid, profile);
        _logAction(?msg.caller, #patientCreated, "Patient " # pid # " created");

        // Anchor to Bitcoin
        try {
            let txHash = await _anchorPatientToBTC(pid, hash);
            let updated = { profile with btcAnchor = ?txHash };
            patients.put(pid, updated);
        } catch e {
            // Fail gracefully
            _logAction(?msg.caller, #systemError, "BTC anchoring failed for " # pid);
        };

        pid
    };

    /// Adds new clinical trial (research orgs only)
    public shared(msg) func addClinicalTrial(
        title : Text,
        description : Text,
        requiredSymptoms : [Symptom],
        locations : [Location],
        ageRange : { min : Nat; max : Nat },
        genderEligibility : [Gender],
        zkCircuit : Text,
        dataSchema : Text
    ) : async Result.Result<TrialID, Text> {
        // Validate inputs
        if (ageRange.min > ageRange.max) {
            return #err("Invalid age range");
        };
        if (requiredSymptoms.size() == 0) {
            return #err("At least one required symptom needed");
        };

        // Verify caller is research org
        if (not _isResearchOrg(msg.caller)) {
            return #err("Unauthorized: Only approved research organizations");
        };

        // Generate trial ID
        let tid = "trial_" # Int.toText(Time.now()) # "_" # Int.toText(Text.hash(title));

        // Create trial
        let trial : ClinicalTrial = {
            id = tid;
            title = title;
            description = description;
            requiredSymptoms = requiredSymptoms;
            locations = locations;
            ageRange = ageRange;
            genderEligibility = genderEligibility;
            recruitmentStatus = #active;
            sponsor = msg.caller;
            zkCircuit = zkCircuit;
            dataSchema = dataSchema;
        };

        // Store data
        trials.put(tid, trial);
        _logAction(?msg.caller, #trialAdded, "Trial " # tid # " added");

        #ok(tid)
    };

    /// Finds matching trials for patient with privacy-preserving techniques
    public shared(msg) func findTrials(
        patientId : PatientID
    ) : async Result.Result<[MatchResult], Text> {
        if (not _checkRateLimit(msg.caller)) {
            return #err("Rate limit exceeded");
        };

        let patient = switch (patients.get(patientId)) {
            case null { return #err("Patient not found") };
            case (?p) { 
                // Verify patient ownership (simplified)
                p 
            };
        };

        // Filter active trials
        let activeTrials = Buffer.Buffer<ClinicalTrial>(10);
        for ((_, trial) in trials.entries()) {
            if (trial.recruitmentStatus == #active) {
                activeTrials.add(trial);
            }
        };

        // Find matches with privacy
        let matches = Buffer.Buffer<MatchResult>(5);
        for (trial in activeTrials.vals()) {
            if (_isEligible(patient, trial)) {
                let proof = _generateZKProof(patient, trial);
                matches.add({
                    trialId = trial.id;
                    matchScore = _calculateMatchScore(patient, trial);
                    eligibilityProof = proof;
                    consentRequired = true;
                    dataRequirements = _extractDataRequirements(trial.dataSchema);
                });
            }
        };

        _logAction(?msg.caller, #matchRequested, "Match search for " # patientId);
        #ok(Buffer.toArray(matches))
    };

    // ========== INTEGRATION ENDPOINTS ==========
    /// Endpoint for Fetch.ai agents with enhanced security
    public shared(msg) func agentCallback(
        callback : AgentCallback,
        signature : Text  // Digital signature (simplified)
    ) : async Result.Result<(), Text> {
        // Verify agent signature (simplified)
        if (not _verifyAgentSignature(msg.caller, signature)) {
            return #err("Invalid agent signature");
        };

        switch (callback) {
            case (#consentRequest req) {
                // Secure consent request workflow
                _initiateConsentFlow(req.patientId, req.trialId, req.callbackEndpoint);
                _logAction(?msg.caller, #consentUpdated, "Consent requested: " # req.patientId # " for " # req.trialId);
                #ok(())
            };
            case (#matchNotification notif) {
                // Record notification
                for (trialId in notif.trialIds.vals()) {
                    _logAction(?msg.caller, #matchRequested, 
                        "Match notified: " # notif.patientId # " trial " # trialId);
                };
                #ok(())
            }
        }
    };

    /// HTTP outcalls to clinical APIs with certification
    public func fetchTrialData(trialId : Text) : async ?ClinicalTrial {
        // Implement actual HTTP outcall with certification
        trials.get(trialId)
    };

    // ========== KEY MANAGEMENT ==========
    public shared(msg) func rotateEncryptionKey() : async () {
        if (not _isAdmin(msg.caller)) {
            throw Error.reject("Unauthorized key rotation");
        };

        // Re-encrypt all patient data (simplified)
        for ((id, patient) in patients.entries()) {
            switch (_decryptData(patient.encryptedData)) {
                case (?data) {
                    let (newEncrypted, newHash) = _encryptData(data);
                    let updated = { 
                        patient with 
                        encryptedData = newEncrypted;
                        dataHash = newHash;
                    };
                    patients.put(id, updated);
                };
                case null { 
                    _logAction(?msg.caller, #systemError, "Re-encryption failed for " # id);
                }
            };
        };

        keyRotationTime := Time.now();
        _logAction(?msg.caller, #keyRotated, "Encryption key rotated");
    };

    // ========== PRIVATE HELPERS ==========
    private func _isEligible(
        patient : PatientProfile,
        trial : ClinicalTrial
    ) : Bool {
        // Location check
        if (not Array.contains<Location>(trial.locations, patient.location, Text.equal)) {
            return false;
        };

        // Symptom matching
        var symptomMatch = false;
        for (symptom in patient.symptoms.vals()) {
            if (Array.contains<Symptom>(trial.requiredSymptoms, symptom, Text.equal)) {
                symptomMatch := true;
                break;
            }
        };
        if (not symptomMatch) return false;

        // Age eligibility
        let ageOK = switch (patient.ageGroup) {
            case (#child) { trial.ageRange.min <= 18 };
            case (#adult) { trial.ageRange.min <= 65 and trial.ageRange.max >= 18 };
            case (#senior) { trial.ageRange.max >= 65 };
        };
        if (not ageOK) return false;

        // Gender eligibility
        if (not Array.contains<Gender>(trial.genderEligibility, patient.gender, func(a, b) { a == b })) {
            return false;
        };

        // Consent check
        patient.consent == #granted
    };

    private func _calculateMatchScore(
        patient : PatientProfile,
        trial : ClinicalTrial
    ) : Float {
        // Weighted scoring algorithm
        var score : Float = 0.0;
        
        // Symptom similarity (40%)
        let matchedSymptoms = Array.filter(patient.symptoms, func(s) {
            Array.contains(trial.requiredSymptoms, s, Text.equal)
        });
        let symptomScore = Float.min(
            1.0, 
            Float.fromInt(matchedSymptoms.size()) / Float.fromInt(trial.requiredSymptoms.size())
        ) * 0.4;

        // Location proximity (30%)
        let locationScore = if (patient.location == trial.locations[0]) { 0.3 } 
            else if (Array.contains(trial.locations, patient.location, Text.equal)) { 0.25 }
            else { 0.1 };

        // Demographic match (30%)
        let demoScore = if (Array.contains(trial.genderEligibility, patient.gender, func(a,b) {a==b})) { 
            switch (patient.ageGroup) {
                case (#child) { if (trial.ageRange.min <= 12) { 0.3 } else { 0.2 } };
                case (#adult) { 0.3 };
                case (#senior) { if (trial.ageRange.max >= 65) { 0.3 } else { 0.2 } };
            }
        } else { 0.0 };

        symptomScore + locationScore + demoScore
    };

    private func _extractDataRequirements(schema : Text) : [Text] {
        // Simple schema parsing - in production use proper JSON parser
        ["diagnosis_date", "treatment_history"]
    };

    private func _initiateConsentFlow(patientId : PatientID, trialId : TrialID, endpoint : Text) {
        // Initiate consent workflow
        _logAction(null, #consentUpdated, "Consent flow initiated for " # patientId # " trial " # trialId);
    };

    private func _isResearchOrg(principal : Principal) : Bool {
        // In production: implement proper ACL with approved principals
        true // Simplified for demo
    };

    private func _isAdmin(principal : Principal) : Bool {
        // In production: implement proper admin verification
        true // Simplified for demo
    };

    private func _verifyAgentSignature(caller : Principal, signature : Text) : Bool {
        // In production: implement proper signature verification
        Text.size(signature) > 0 // Simplified for demo
    };

    // ========== AUDIT LOGGING ==========
    private func _logAction(
        caller : ?Principal,
        action : AuditAction,
        details : Text
    ) {
        let principal = switch (caller) {
            case (?p) { p };
            case null { Principal.fromText("aaaaa-aa") }; // Anonymous
        };
        let entry = (Time.now(), principal, action, details);
        auditLog := Array.append(auditLog, [entry]);
    };

    public query func getAuditLog() : async [(Int, Principal, AuditAction, Text)] {
        auditLog
    };

    // ========== QUERY FUNCTIONS ==========
    public query func getAllTrials() : async [ClinicalTrial] {
        Iter.toArray(trials.vals())
    };

    public query func getPatient(patientId : PatientID) : async ?PatientProfile {
        patients.get(patientId)
    };

    // ========== ADMIN FUNCTIONS ==========
    public shared(msg) func deletePatientData(patientId : PatientID) : async Result.Result<(), Text> {
        ignore patients.remove(patientId);
        _logAction(?msg.caller, #dataDeleted, "Patient " # patientId # " data deleted");
        #ok(())
    };

    public shared(msg) func updateTrialStatus(
        trialId : TrialID,
        status : { #active; #paused; #completed }
    ) : async Result.Result<(), Text> {
        switch (trials.get(trialId)) {
            case null { #err("Trial not found") };
            case (?trial) {
                let updated = { trial with recruitmentStatus = status };
                trials.put(trialId, updated);
                _logAction(?msg.caller, #trialAdded, "Trial " # trialId # " status updated");
                #ok(())
            }
        }
    };

    public shared(msg) func updateConsent(
        patientId : PatientID,
        trialId : TrialID,
        status : ConsentStatus
    ) : async Result.Result<(), Text> {
        switch (patients.get(patientId)) {
            case null { return #err("Patient not found") };
            case (?patient) {
                let updated = { patient with consent = status };
                patients.put(patientId, updated);
                _logAction(?msg.caller, #consentUpdated, 
                    "Consent updated to " # debug_show(status) # " for trial " # trialId);

                #ok(())
            };
        }
    };

    // ========== UPGRADE MANAGEMENT ==========
    system func preupgrade() {
        patientStoreStable := Iter.toArray(patients.entries());
        trialStoreStable := Iter.toArray(trials.entries());
        auditLogStable := auditLog;
        rateLimitsStable := Iter.toArray(rateLimitMap.entries());
    };

    system func postupgrade() {
        patientStoreStable := [];
        trialStoreStable := [];
        auditLogStable := [];
        rateLimitsStable := [];
    };
}