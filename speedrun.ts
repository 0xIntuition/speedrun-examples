import fetch from 'node-fetch';
import { config } from 'dotenv'; 
import { Cacao, SiweMessage, SiwxMessage } from '@didtools/cacao'
import { privateKeyToAccount } from 'viem/accounts'
config()


// Gets DIDSession message to sign
async function getMessage(apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('http://api.intuition.cafe/apikey/message', { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey } });
    const data = await response.json() as { message: string};
    console.log(data)
    return data.message;
  } catch (error) {
    console.error('Error fetching message:', error);
    return null;
  }
}
// Signs message and returns message signature
async function signMessage(message: string) {
    try {
        console.log(message)
        const msg = new SiweMessage(message)
        const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
        const signature = await account.signMessage({
            message: msg.signMessage(),
          })
        console.log(signature)
        return signature;
    } catch (error) {
        console.error('Error signing message:', error);
        return null;
    }
  }
// Exchange a signed message for a DID Session
async function getSession(msg: string, signature: string): Promise<string | null> {
  try {
    const response = await fetch('http://api.intuition.cafe/apikey/session?message=' + encodeURIComponent(msg) + '&signature=' + encodeURIComponent(signature), {
      headers: {
        'x-api-key': process.env.API_KEY as string,
      }
    });
    const data = await response.json() as { session: string };
    console.log(data)
    return data.session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

// Creates an Identity given a DisplayName and Description
async function createIdentity(session: string, displayName: string, description: string): Promise<string> {
  try {
    const response = await fetch('http://api.intuition.cafe/identity', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + session,
        'x-api-key': process.env.API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        display_name: displayName,
        description: description,
      }),
    });
    const data = await response.json() as { data: { identity_id: string } }
    console.log(data)
    return data.data.identity_id
  } catch (error) {
    console.error('Error creating identity:', error);
    throw error
  }
}

// Creates a Claim given a Subject, Predicate and Object (IDs of Identities)
async function createClaim(session: string, subject_id: string, predicate_id: string, object_id: string): Promise<string> {
    try {
      const response = await fetch('http://api.intuition.cafe/claim', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + session,
          'x-api-key': process.env.API_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_id: subject_id,
          predicate_id: predicate_id,
          object_id: object_id
        }),
      });
      const data = await response.json() as { data: { claim_id: string } };
      console.log(data);
      return data.data.claim_id
    } catch (error) {
      console.error('Error creating identity:', error);
      throw error
    }
  }

  // Attests to the specified Claim in the direction (true: for, false: against)
  async function attestToClaim(session: string, claim_id: string, direction: boolean): Promise<void> {
    try {
      const response = await fetch('http://api.intuition.cafe/claim/attest', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + session,
          'x-api-key': process.env.API_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claim_id: claim_id,
          boolean: direction,
        }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error creating identity:', error);
    }
  }

    // Attests to the specified Claim in the direction (true: for, false: against)
    async function queryIdentitiesByDisplayName(session: string, display_name_in: string, operator: string): Promise<any> {
        try {
          const response = await fetch('http://api.intuition.cafe/query/identities', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + session,
              'x-api-key': process.env.API_KEY as string,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: { 
                display_name: { "value": display_name_in, op: operator } 
              } 
            }),
          });
          const data = await response.json();
          console.log(data);
          return data as string
        } catch (error) {
          console.error('Error querying Identities:', error);
        }
      }
    
    // QueryForClaims by Creator
    async function queryClaimsByCreator(session: string, creator: string, operator: string): Promise<any> {
        try {
          const response = await fetch('http://api.intuition.cafe/query/claims', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + session,
              'x-api-key': process.env.API_KEY as string,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: { 
                creator: { "value": creator, op: operator} 
              } 
            }),
          });
          const data = await response.json();
          console.log(data);
          return data as string
        } catch (error) {
          console.error('Error querying Identities:', error);
        }
    }


async function main() {
  const apiKey = process.env.API_KEY
  // Get Session
    let message = await getMessage(process.env.API_KEY as string)
    // Sign the message enabling writes to ComposeDB
    let signature = await signMessage(message as string)
    // Exchange a signed message for a DID Session string
    let session = await getSession(message as string, signature as string)


    // Create an identity, will be used as the object in the claim
    let subject_id = await createIdentity(session as string, "<insert_interesting_protocol>", "<describe___protocol>")
    // Create a Claim using the created Identities
    // Subject: Interesting Protocol
    // Predicate: IsInteresting
    // Object: Protocol
    let claim_id = await createClaim(session as string, subject_id, "3182bf90ef182429f0f5799b1679936cce5850feec6bbabc9de4936a4324de4c", "4715329ffe95cf2d618ab0dc991d6ef3faa1c7f68b7c277036a2b5910ab7f5b6")
    //Attest for the Claim you created
    let attest = await attestToClaim(session as string, claim_id, true)
    // Query for Identities by Display Name
    let identityByDisplayName = await queryIdentitiesByDisplayName(session as string, "Intuition", "like")
    // Query for Claims by Creator
    let claimsByCreators = await queryClaimsByCreator(session as string, "0xf37d1dd67b39fa291da3c67f5ed60fb77b1b92b7", "ilike")

}

main();
