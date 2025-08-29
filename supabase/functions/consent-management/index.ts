import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConsentRequest {
  patientId: string
  trialId: string
  action: 'grant' | 'withdraw' | 'audit'
  trialTitle?: string
}

interface ConsentRecord {
  id: string
  patientId: string
  trialId: string
  trialTitle: string
  status: 'active' | 'withdrawn'
  consentDate: string
  withdrawDate?: string
  zkProofId: string
  icpBlock: string
  btcAnchor: string
  ipfsHash: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the ASI:One API key for blockchain operations
    const asiApiKey = Deno.env.get('ASI_ONE_API_KEY')
    if (!asiApiKey) {
      throw new Error('ASI:One API key not configured')
    }

    const { patientId, trialId, action, trialTitle }: ConsentRequest = await req.json()

    if (!patientId || !action) {
      return new Response(
        JSON.stringify({ error: 'PatientId and action are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing consent request:', { patientId, trialId, action })

    let result

    switch (action) {
      case 'grant':
        if (!trialId) {
          return new Response(
            JSON.stringify({ error: 'TrialId is required for grant action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await grantConsent(patientId, trialId, trialTitle, asiApiKey)
        break

      case 'withdraw':
        if (!trialId) {
          return new Response(
            JSON.stringify({ error: 'TrialId is required for withdraw action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await withdrawConsent(patientId, trialId, asiApiKey)
        break

      case 'audit':
        result = await getAuditLog(patientId, asiApiKey)
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Must be grant, withdraw, or audit' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in consent management:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process consent request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function grantConsent(patientId: string, trialId: string, trialTitle: string | undefined, apiKey: string) {
  // Simulate blockchain operations
  await new Promise(resolve => setTimeout(resolve, 1500))

  const consentRecord: ConsentRecord = {
    id: `consent_${Date.now()}`,
    patientId,
    trialId,
    trialTitle: trialTitle || `Clinical Trial ${trialId}`,
    status: 'active',
    consentDate: new Date().toISOString(),
    zkProofId: `zk-proof-${Math.random().toString(16).substr(2, 6)}`,
    icpBlock: Math.floor(Math.random() * 999999).toString(),
    btcAnchor: `btc-${Math.random().toString(16).substr(2, 12)}`,
    ipfsHash: `Qm${Math.random().toString(16).substr(2, 44)}`
  }

  // TODO: Integrate with actual ICP canister and Bitcoin anchoring
  /*
  const icpResult = await callICPCanister({
    method: 'record_consent',
    args: {
      patient_id: patientId,
      trial_id: trialId,
      consent_data: encryptedConsentData
    }
  })

  const btcAnchor = await anchorToBitcoin({
    data_hash: icpResult.hash,
    proof_id: consentRecord.zkProofId
  })
  */

  console.log('Consent granted:', consentRecord)

  return {
    success: true,
    message: 'Consent granted and recorded on blockchain',
    consent: consentRecord,
    blockchain: {
      icpTransactionId: consentRecord.icpBlock,
      btcAnchorTx: consentRecord.btcAnchor,
      zkProofId: consentRecord.zkProofId,
      ipfsHash: consentRecord.ipfsHash
    }
  }
}

async function withdrawConsent(patientId: string, trialId: string, apiKey: string) {
  // Simulate blockchain operations
  await new Promise(resolve => setTimeout(resolve, 1000))

  const withdrawalRecord = {
    patientId,
    trialId,
    withdrawDate: new Date().toISOString(),
    zkProofId: `zk-proof-withdraw-${Math.random().toString(16).substr(2, 6)}`,
    icpBlock: Math.floor(Math.random() * 999999).toString(),
    btcAnchor: `btc-${Math.random().toString(16).substr(2, 12)}`
  }

  console.log('Consent withdrawn:', withdrawalRecord)

  return {
    success: true,
    message: 'Consent withdrawn and recorded on blockchain',
    withdrawal: withdrawalRecord,
    blockchain: {
      icpTransactionId: withdrawalRecord.icpBlock,
      btcAnchorTx: withdrawalRecord.btcAnchor,
      zkProofId: withdrawalRecord.zkProofId
    }
  }
}

async function getAuditLog(patientId: string, apiKey: string) {
  // Simulate fetching from blockchain
  await new Promise(resolve => setTimeout(resolve, 800))

  // Mock audit log data
  const mockAuditLog: ConsentRecord[] = [
    {
      id: "consent_1",
      patientId,
      trialId: "NCT04556747",
      trialTitle: "Phase 3 Immunotherapy for Advanced Breast Cancer",
      status: "active",
      consentDate: "2025-08-14T10:30:00Z",
      zkProofId: "zk-proof-xyz789",
      icpBlock: "123456",
      btcAnchor: "btc-abc123def456",
      ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
    },
    {
      id: "consent_2",
      patientId,
      trialId: "NCT03945682",
      trialTitle: "Targeted Therapy for EGFR+ Lung Cancer",
      status: "active",
      consentDate: "2025-08-13T14:15:00Z",
      zkProofId: "zk-proof-abc123",
      icpBlock: "123455",
      btcAnchor: "btc-def456ghi789",
      ipfsHash: "QmYwAPJzv5CZsnA8NZkJbsWnZBuFy8yNmgL1FmJL9HgKMN"
    }
  ]

  console.log('Audit log retrieved for patient:', patientId)

  return {
    success: true,
    patientId,
    consents: mockAuditLog,
    metadata: {
      totalConsents: mockAuditLog.length,
      activeConsents: mockAuditLog.filter(c => c.status === 'active').length,
      retrievedAt: new Date().toISOString()
    }
  }
}

/* 
TODO: Integrate with actual Internet Computer canister:

async function callICPCanister(request: any) {
  // Use @dfinity/agent to call your deployed canister
  const agent = new HttpAgent({ host: "https://ic0.app" })
  const canisterId = "YOUR_CANISTER_ID"
  
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
  
  return await actor[request.method](request.args)
}

async function anchorToBitcoin(data: any) {
  // Use your Bitcoin anchoring service
  // This could be through services like Chainpoint, OpenTimestamps, etc.
  return {
    txHash: "bitcoin_transaction_hash",
    blockHeight: 850000,
    merkleRoot: "merkle_root_hash"
  }
}
*/