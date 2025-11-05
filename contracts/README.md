# I4TK Knowledge Network - Smart Contracts

This directory contains the Solidity smart contracts for the I4TK Knowledge Network project.

## Contracts

### I4TKdocToken.sol
ERC1155 token contract that represents ownership of research documents published by community members.

**Features:**
- Mint tokens for new documents
- Track document references (genealogy)
- Calculate contribution distribution
- On-chain metadata storage

### I4TKnetwork.sol
Governance contract that manages the I4TK community protocol.

**Features:**
- Member registration with roles (Admin, Contributor, Validator)
- Content proposal system
- Peer validation mechanism (4 validations required)
- Automatic token distribution to contributors

## Deployed Contracts (Sepolia Testnet)

- **I4TKdocToken**: `0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288`
- **I4TKnetwork**: `0xa9870f477E6362E0810948fd87c0398c2c0a4F55`

## Setup

Install dependencies:
```bash
cd contracts
npm install
```

## Compile

```bash
npm run compile
```

This will generate ABIs in the `artifacts/` folder.

## Deploy

**Local network:**
```bash
npm run deploy:local
```

**Sepolia testnet:**
```bash
npm run deploy:sepolia
```

**Mainnet (use with caution!):**
```bash
npm run deploy:mainnet
```

## Environment Variables

Create a `.env` file in the `contracts/` directory:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**⚠️ Never commit your `.env` file to Git!**

## Testing

```bash
npm run test
```

## License

MIT
