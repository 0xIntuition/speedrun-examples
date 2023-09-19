Speedrun-Examples: TypeScript Example


With this example, you will be guided through authentications, creating identities, attesting to claims, and querying identities & claims. By the end of the tutorial, you will be familiar with the core functionalities and prepared to venture into more complex examples. 

# Summary
This TypeScript example navigates through various essential processes such as, from

Getting Started
Prerequisites
Node.js: Ensure you have Node.js (version 16.14.0 or later) installed. If you're using an older version, it's time to update.
Setup
Clone the repository:
sh
Copy code
git clone [YOUR-FORKED-REPO-URL]
Install the dependencies:
sh
Copy code
npm install
# or
yarn install
# or
pnpm install
Environment Setup
Setup your environment variables in a .env.local file with the structure below. Here, API_KEY is required for all API requests and PRIVATE_KEY is associated with the API key wallet, used for signing messages and enabling writes to the Ceramic Network:

sh
Copy code
API_KEY=REPLACE_ME
PRIVATE_KEY=REPLACE_ME
sh

## Usage
Run the script to perform a series of operations, including fetching a message for DID session creation, creating identities and claims, and querying by display name and creator. Here's a brief overview of what each step does:
```esrun speedrun.ts```
Fetches a message to sign for DID session creation
Signs the message and exchanges it for a DID session
Creates an identity representing an interesting protocol
Creates a claim using the created identity, asserting it as part of an interesting protocol
Queries for an identity by display name
Queries for a claim by its creator
Additional Resources
To delve deeper into Intuition, refer to the resources below:

[Intuition Documentation](https://intuition.gitbook.io/alpha-api/): Explore the core mechanics of Intuition.

[Getting Started Guide](TODO: REPLACE ME): A quick guide to using our API for creating claims, making attestations, and querying knowledge.

[Contact Us](https://discord.gg/0xintuition): Reach out to the Intuition team for support and assistance.
References

Next.js Documentation - Learn about Next.js features and API.
Next-Auth Documentation - Get to know the features and API of Next-Auth.
WalletConnect Documentation - Understand the functionalities offered by WalletConnect.
Alchemy Documentation - Learn about the features and API of Alchemy.
Contributing
We welcome contributions from the community. If you'd like to contribute, please fork the repository and submit your pull requests.