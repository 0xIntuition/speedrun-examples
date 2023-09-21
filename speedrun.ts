import fetch from 'node-fetch';
import { config } from 'dotenv'; 
import { SiweMessage } from '@didtools/cacao'
import { privateKeyToAccount } from 'viem/accounts'
config()

// Authentication
// Gets SIWE message to sign
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
    console.log(message)
    const msg = new SiweMessage(message)
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
    const signature = await account.signMessage({
        message: msg.signMessage(),
      })
    console.log(signature)
    return signature;
}

// Exchange a signed message for a DID Session
async function getSession(msg: string, signature: string): Promise<string | null> {
    const response = await fetch('http://api.intuition.cafe/apikey/session?message=' + encodeURIComponent(msg) + '&signature=' + encodeURIComponent(signature), {
      headers: {
        'x-api-key': process.env.API_KEY as string,
      }
    });
    if(!response.ok) {
      const error = await response.json() as any
      throw Error(error.message)
    }
    const res = await response.json() as { session: string };
    return res.session;
}
// Identity Creation
// Creates an identity given a displayName and description
async function createIdentity(session: string, displayName: string, description: string): Promise<string> {
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
  if(!response.ok) {
    const error = await response.json() as any
    throw Error(error.message)
  }
  const res = await response.json() as any
  return res.data.identity_id
}
// Claim Creation
// Creates a claim given identity IDs for a subject, predicate and object.
async function createClaim(session: string, subject_id: string, predicate_id: string, object_id: string): Promise<string> {
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
  if(!response.ok) {
    const error = await response.json() as any
    throw Error(error.message)
  }
  const data = await response.json() as { data: { claim_id: string } };
  console.log(data);
  return data.data.claim_id
}
// Attesting
// Attests to the specified Claim in the direction (true: for, false: against)
async function attestToClaim(session: string, claim_id: string, direction: boolean): Promise<void> {
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
  if(!response.ok) {
    const error = await response.json() as any
    throw Error(error.message)
  } 
  const data = await response.json();
  console.log(data);
}

// Querying Identities
// Attests to the specified Claim in the direction (true: for, false: against)
async function queryIdentitiesByDisplayName(session: string, display_name_in: string, operator: string): Promise<any> {
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
  if(!response.ok) {
    const error = await response.json() as any
    throw Error(error.message)
  } 
  const data = await response.json();
  console.log(data);
  return data as string
}
  
// Querying claims created by a wallet address
async function queryClaimsByCreator(session: string, wallet: string, operator: string): Promise<any> {
  const response = await fetch('http://api.intuition.cafe/query/claims', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + session,
      'x-api-key': process.env.API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { 
        creator: { "value": wallet, op: operator} 
      } 
    }),
  });
  if(!response.ok) {
    const error = await response.json() as any
    throw Error(error.message)
  } 
  const data = await response.json();
  console.log(data);
  return data as string
}

// Querying claims created by a wallet address
async function queryClaimsByPredicate(session: string, predicate: string, operator: string): Promise<any> {
  const response = await fetch('http://api.intuition.cafe/query/claims', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + session,
      'x-api-key': process.env.API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { 
        with_predicate: { display_name: {"value": predicate, op: operator} } 
      }
    }),
  });
  if(!response.ok) {
    const error = await response.json() as any
    throw Error(error.message)
  } 
  const data = await response.json();
  console.log(data);
  return data as string
}
async function main() {
  // Authentication
  // Get Session
  let message = await getMessage(process.env.API_KEY as string)
  // Sign the message enabling writes to ComposeDB
  let signature = await signMessage(message as string)
  // Exchange a signed message for a DID Session string
  let session = await getSession(message as string, signature as string)

  /**
   * Create Identities & Claims
   * Claims are the way to make statements about something, these somethings are represented by the semantic statement {Subject}, {Predicate}, {Object}
   * The subject refers to the entity being described in the statement (e.g., Person, Place, Thing).
   * The predicate indicates a specific characteristic or relation of the Subject to an {Object}. In this claim, we'll be using the Identity ID with the predicate "isInteresting".
   * The object can be any reference of your choice, such as a Protocol, Article, Person, or any other noun.
   * 
   * Task:
   * 1. Replace the subject, object display_name and description with your own values.
   * 2. Create an identity, will be used as the object in the claim {Subject}, {isInteresting}, {Object}
   * What is something you find interesting?
   */
    const subject_display_name = "" // Replace me (e.g.: "Intuition", "Ethereum", "Chocolate Cake" etc.)
    const subject_description = "" // Replace me 
    const object_display_name = "" // Replace me (e.g.: "Protocol", "Startup", "Layer 2", "Pastry")
    const object_description = "" // Replace me 
  
  // Create the subject. This resulting identity ID be used as the subject in the claim
  let subject_id = await createIdentity(session as string, subject_display_name, subject_description)

  // Create the object. This resulting identity ID be used as the object in the claim
  let object_id = await createIdentity(session as string, object_display_name, object_description)

  // Create a Claim using the created Identities {YOUR_SUBJECT}-{isInteresting}-{YOUR_OBJECT}
  let claim_id = await createClaim(session as string, subject_id, "3182bf90ef182429f0f5799b1679936cce5850feec6bbabc9de4936a4324de4c", object_id)
  
  // Attest to a Claim
  // Attesting For a Claim is a way to endorse the Claim 
  await attestToClaim(session as string, claim_id, true)
  
  // Query Identities & Claims
  // Query for identities by displayName
  await queryIdentitiesByDisplayName(session as string, "Intuition", "like")

  // Query for Claims by Predicate
  await queryClaimsByPredicate(session as string, "isInteresting", "ilike")
}

main();