# Speedrun-Examples: TypeScript Guide

This guide covers authentication, identity creation, claim attestation, and querying identities & claims in TypeScript. By the end, you'll grasp the core functionalities and be ready for advanced examples.

## Prerequisites
- **Node.js**: Ensure Node.js (v16.14.0 or newer) is installed. Update if using an older version.

## Setup
1. **Clone the Repository**:
   ```bash
   git clone [YOUR-FORKED-REPO-URL]
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
   Create a `.env.local` file and set the following:
   ```bash
   API_KEY=YOUR_API_KEY
   PRIVATE_KEY=YOUR_PRIVATE_KEY
   ```
   - `API_KEY`: Essential for all API requests.
   - `PRIVATE_KEY`: Linked to the API key wallet, used for message signing and Ceramic Network writes.

## Usage
Execute the script to perform operations like DID session creation, identity and claim creation, and querying:
```bash
esrun speedrun.ts
```
Steps:
1. Fetch and sign a message for DID session creation.
2. Exchange the signed message for a DID session.
3. Create an identity for a protocol.
4. Attest a claim using the created identity.
5. Search for an identity using its display name.
6. Search for a claim by its creator.

## Resources
- [Intuition Documentation](https://intuition.gitbook.io/alpha-api/): Dive into Intuition's core mechanics.
- [Getting Started Guide](TODO: REPLACE ME): A concise API guide for claim creation, attestation, and querying.
- [Contact Us](https://discord.gg/0xintuition): Connect with the Intuition team for help.
