// IDL Factory for ICP Canister (simplified for demo)
export const idlFactory = ({ IDL }: any) => {
  const PatientID = IDL.Text;
  const TrialID = IDL.Text;
  const Symptom = IDL.Text;
  const Location = IDL.Text;
  
  const AgeGroup = IDL.Variant({
    'child' : IDL.Null,
    'adult' : IDL.Null,
    'senior' : IDL.Null,
  });
  
  const Gender = IDL.Variant({
    'male' : IDL.Null,
    'female' : IDL.Null,
    'nonbinary' : IDL.Null,
    'unspecified' : IDL.Null,
  });

  const PatientProfile = IDL.Record({
    'id' : PatientID,
    'symptoms' : IDL.Vec(Symptom),
    'location' : Location,
    'ageGroup' : AgeGroup,
    'gender' : Gender,
    'encryptedData' : IDL.Text,
    'dataHash' : IDL.Text,
    'timestamp' : IDL.Int,
  });

  const ClinicalTrial = IDL.Record({
    'id' : TrialID,
    'title' : IDL.Text,
    'description' : IDL.Text,
    'requiredSymptoms' : IDL.Vec(Symptom),
    'locations' : IDL.Vec(Location),
    'ageRange' : IDL.Record({ 'min' : IDL.Nat, 'max' : IDL.Nat }),
    'genderEligibility' : IDL.Vec(Gender),
    'recruitmentStatus' : IDL.Variant({
      'active' : IDL.Null,
      'paused' : IDL.Null,
      'completed' : IDL.Null,
    }),
  });

  const MatchResult = IDL.Record({
    'trialId' : TrialID,
    'matchScore' : IDL.Float64,
    'eligibilityProof' : IDL.Text,
  });

  const AgentAction = IDL.Variant({
    'consentRequested' : IDL.Null,
    'matchNotification' : IDL.Null,
  });

  return IDL.Service({
    'addPatient' : IDL.Func(
      [IDL.Vec(Symptom), Location, AgeGroup, Gender, IDL.Text],
      [PatientID],
      [],
    ),
    'addTrial' : IDL.Func([ClinicalTrial], [TrialID], []),
    'matchTrials' : IDL.Func([PatientID], [IDL.Vec(MatchResult)], ['query']),
    'getAllTrials' : IDL.Func([], [IDL.Vec(ClinicalTrial)], ['query']),
    'getPatient' : IDL.Func([PatientID], [IDL.Opt(PatientProfile)], ['query']),
    'agentCallback' : IDL.Func([PatientID, TrialID, AgentAction], [], []),
    'deletePatientData' : IDL.Func([PatientID], [], []),
    'getAuditLog' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
  });
};