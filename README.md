# Speedrun-Examples: TypeScript Guide

This guide covers authentication, identity creation, claim attestation, and querying identities & claims in TypeScript. By the end, you'll grasp the core functionalities and be ready for advanced examples.

## Prerequisites

- **Node.js**: Ensure Node.js (v16.14.0 or newer) is installed. Update if using an older version.

## Setup

1. **Clone the Repository**:

   ```bash
   git clone git@github.com:0xIntuition/speedrun-examples.git
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**:
   Create a `.env` file and set the following:

   ```bash
   API_KEY=YOUR_API_KEY
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   API_URL=https://api.intuition.cafe
   ```

   - `API_KEY`: Essential for all API requests.
   - `PRIVATE_KEY`: Linked to the API key wallet, used for message signing and Ceramic Network writes. Append 0x to the start of your private key.
   - `API_URL`: Optional. Set to `https://api.intuition.cafe` by default.

   **Note: This is a private key, not a seed phrase.**

## Usage

First, replace the `subject_display_name` and `subject_description` variables in `src/speedrun.ts` in the main function with your own values. These will be used to create an identity and claim.

Next, replace the `object_display_name` and `object_description` variables in `src/speedrun.ts` in the main function with your own values. These will be used to create an identity and claim.

Execute the script to perform operations like DID session creation, identity and claim creation, and querying:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

Steps:

1. Fetch and sign a message for DID session creation.
2. Exchange the signed message for a DID session.
3. Create identities.
4. Create a claim with the created identities
5. Attest to the created claim.
6. Query for identities.
7. Query for claims by creator wallet address.

## Resources

- [Intuition Documentation](https://intuition.gitbook.io/alpha-api/): Dive into Intuition's core mechanics.
- [Getting Started Guide](https://app.gitbook.com/o/xYyeoT5KBfRZxYH5NYQb/s/cVc9V0gt0E79kdhQIpdk/developer-docs/getting-started): A concise API guide for claim creation, attestation, and querying.
- [Contact Us](https://discord.gg/0xintuition): Connect with the Intuition team for help.
