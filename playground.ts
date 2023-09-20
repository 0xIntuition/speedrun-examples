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


async function main() {
  // Authentication
  // Get Session
  let message = await getMessage(process.env.API_KEY as string)
  // Sign the message enabling writes to ComposeDB
  let signature = await signMessage(message as string)
  // Exchange a signed message for a DID Session string
  let session = await getSession(message as string, signature as string)

//   fetch("http://api.intuition.cafe/apikey/message", {
//     method: "GET",
//     headers: {
//       "x-api-key": process.env.API_KEY,
//     },
//   })

  const SESSION = "eyJzZXNzaW9uS2V5U2VlZCI6IlFLaUhYOHh4TkZwQ3dOdnhJb0M0c0NUNXY5OXM4QVozNGdkUjBoK0F0b3M9IiwiY2FjYW8iOnsiaCI6eyJ0IjoiZWlwNDM2MSJ9LCJwIjp7ImRvbWFpbiI6ImludHVpdGlvbi5zeXN0ZW1zIiwiaWF0IjoiMjAyMy0wOS0xOFQxMDozNTowMi44ODNaIiwiaXNzIjoiZGlkOnBraDplaXAxNTU6NDIxNjEzOjB4ZjM3RDFERDY3QjM5ZkEyOTFEQTNDNjdmNUVkNjBmYjc3YjFiOTJiNyIsImF1ZCI6ImRpZDprZXk6ejZNa3FzaXNlVGZFUmlydDljazZSTjE1UnZZaHlFZjhxTFhhZ1JDR3I5QndGYkczIiwidmVyc2lvbiI6IjEiLCJub25jZSI6InZtd2o5NnNtIiwic3RhdGVtZW50IjoiSSBhdXRob3JpemUgbXkgRElEIHRvIGJlIHVzZWQgYnkgaW50dWl0aW9uLnN5c3RlbXMiLCJyZXNvdXJjZXMiOlsiY2VyYW1pYzovLyo_bW9kZWw9a2p6bDZodmZyYnc2Y2IyOHQxNDc3cHAzdzF3MWxyb2d2aXRra3NxcmE0bWo2dGFrN3dtY2Fsd2lobGsxcnJrIiwiY2VyYW1pYzovLyo_bW9kZWw9a2p6bDZodmZyYnc2YzkxZTBlaGhnNTY2cXA2c2lpdmFqb253cWZ4d3BrNXJ6dDVpcnVnMWRxMHM0ZXU0ZWprIiwiY2VyYW1pYzovLyo_bW9kZWw9a2p6bDZodmZyYnc2YzZ3ZzBhNWFsZTQxc2N2emp3OGUzdDZnZjZ3OGo5YTE5MmVpanA3cjY4cGh1YWlzOWRlIiwiY2VyYW1pYzovLyo_bW9kZWw9a2p6bDZodmZyYnc2Yzg1bzJkOXo2ZzNqMnIxc3dwaXhsMWtqaXhzcXVsc2dlcXdjOXV6aW1oZ2RqazlobjY2Il19LCJzIjp7InQiOiJlaXAxOTEiLCJzIjoiMHgwYzYwNDcyYTc2ZTM2YmE4MThhY2EzOWMxODY5YWUyZTUxZTRmZjQ3ZDI2ZmQ0ZGNmMjcxMzY0NmFmZmNiNGJhMDA0NDIzNWRlYmM1N2QzNTA0N2NjYzQwZjAxNjRiZDkwOTcwMzQ3Mjk2MGIwMjNkMDQyNjI2OGZjZmVhZWUxNzFjIn19fQ"
  const res = await fetch(`http://api.intuition.cafe/apikey/session/verify?session=${encodeURIComponent(SESSION)}`, {
    method: "GET",
    headers: {
      "x-api-key": process.env.API_KEY,
    },
  })
  console.log(await res.json())

  const res2 = await fetch('http://api.intuition.cafe/apikey/1221', {
          headers: {
          'Authorization': 'Bearer ' + SESSION,
     }
    })
    console.log(await res2.json())

    // Create Identity about an interesting Protocol
    const res3 = await fetch('http://api.intuition.cafe/identity', {
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY as string, 
            'Authorization': 'Bearer ' + SESSION, 
        },
        body: JSON.stringify({ 
            display_name: "gn", // Human-readable name
            description: "goodevening", // Gives context to the identity
            }), 
        });
    console.log(await res3.json())

    const res4 = await fetch('http://api.intuition.cafe/query/identities', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY,
            authorization: 'Bearer ' + SESSION,
        },
        body: JSON.stringify({
            "input": {
                "display_name": { "value": "gn", op: "=" }
            },
        }),
    })
    console.log(await res4.json())

    const res5 = await fetch('http://api.intuition.cafe/identity/03bb0931e0952c41637195825a7bef533321b70efa164099a404e4c785a81d77', {
        method: 'GET', 
        headers: { 
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY,
        'Authorization': 'Bearer ' + SESSION, 
        }
    });
    console.log(await res5.json())

    const res6 = await fetch('http://api.intuition.cafe/identity/', {
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY,
                'Authorization': 'Bearer ' + SESSION, 
            }
    });
    console.log(await res6.json())

    // Create a Claim about an interesting Protocol
 const res7 = await fetch('http://api.intuition.cafe/claim', {
    method: 'POST', 
    headers: { 
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY, 
        'Authorization': 'Bearer ' + SESSION,
    },
    body: JSON.stringify({ 
        subject_id: "ac5307aad4aba3225a8d978a245870719923b1403db0630958c43448c0dd7c25", 
        predicate_id: "ac5307aad4aba3225a8d978a245870719923b1403db0630958c43448c0dd7c25",
        object_id: "ac5307aad4aba3225a8d978a245870719923b1403db0630958c43448c0dd7c25",
        }), 
    });
    console.log(await res7.json())

     // Create Identity about an interesting Protocol
     const res8 = await fetch('http://api.intuition.cafe/identity', {
            method: 'POST', 
            headers: { 
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.API_KEY, 
                    'Authorization': 'Bearer ' + SESSION, 
            },
        body: JSON.stringify({ 
            display_name: "123", // Human-readable name,
            description: "test1", // Gives context to the identity
            }), 
        });
    console.log(await res8.json())

    const res9 = await fetch(`http://api.intuition.cafe/claim/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ` + SESSION,
          'x-api-key': process.env.API_KEY,
        },
        body: JSON.stringify({
          claim_id: "1",
        }),
      })
    console.log(await res9.json())
}

main();
