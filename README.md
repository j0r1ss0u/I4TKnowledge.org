## I4T Knowledge Network

A comprehensive web application for digital governance research and collaboration, featuring AI-powered document management, blockchain for IP tokenization, and semantic search capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Smart Contracts](#smart-contracts)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

I4TK Knowledge Network is a platform designed for digital governance research and collaboration. Researchers can:
- Upload and share research documents with IPFS decentralized storage
- Tokenize contributions on the Ethereum blockchain (ERC-1155) for IP tracking
- Engage with an AI assistant for semantic document search
- Collaborate on policy research projects
- Manage events and track research progress
- Export library metadata to CSV for data analysis

The platform integrates Firebase for authentication/database, OpenAI GPT-4o-mini for AI features, and Ethereum smart contracts for tokenizing research contributions.

---

## Key Features

### 🔐 Authentication & User Management
- **Invitation-based registration** with email verification
- **Role-based access control**: Admin, Validator, Member
- **Firebase Authentication** for secure user management
- Password reset functionality via email

### 📚 Document Management
- **IPFS storage** via Pinata for decentralized file hosting
- **Semantic search** using TensorFlow.js Universal Sentence Encoder
- **AI auto-tagging** with GPT-4o-mini for automatic categorization
- **PDF text extraction** from IPFS-stored documents
- **Citation tree visualization** showing document references and descendants
- **Periodic table element tagging** for categorization
- **CSV export** of library metadata (admin-only)

### 🤖 AI-Powered Features
- **RAG (Retrieval-Augmented Generation) chat** - Conversational AI assistant for document search
- **Auto-tagging system** - GPT-4o-mini suggests relevant tags with confidence scores
- **Bilingual support** - French/English automatic detection and responses
- **Backend-only OpenAI calls** for secure API key management

### ⛓️ Blockchain Integration
- **ERC-1155 token contracts** for document tokenization
- **Peer validation system** (4 validations required for publication)
- **Intelligent token distribution** (40% creator, 60% to referenced documents)
- **Sepolia testnet** deployment with mainnet support
- **Hardhat tooling** for contract development and testing

### 📊 Data Visualization
- **Interactive citation trees** with ReactFlow (references in gray, descendants in green)
- **Leaflet maps** for geographic data visualization
- **Project management** with milestone tracking
- **Event calendar** for research activities

### 📤 Export & Integration
- **CSV export** with 14 metadata columns (Token ID, Title, Authors, Description, etc.)
- **Resend email integration** for invitations and notifications
- **GitHub synchronization** for code versioning

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **React Router** - Client-side routing
- **TensorFlow.js** - Machine learning (embeddings)
- **ReactFlow** - Citation tree visualization
- **Leaflet** - Interactive maps
- **PDF.js** - PDF rendering and text extraction

### Backend
- **Node.js + Express** - API server (port 3000)
- **Firebase Authentication** - User management
- **Cloud Firestore** - NoSQL database
- **Firebase Functions** - Serverless backend logic

### AI & Machine Learning
- **OpenAI GPT-4o-mini** - Conversational AI and auto-tagging
- **TensorFlow.js Universal Sentence Encoder** - Semantic embeddings
- **Franc** - Language detection (French/English)

### Blockchain
- **Hardhat** - Smart contract development
- **Wagmi + Viem** - Ethereum interactions
- **RainbowKit** - Wallet connection UI
- **Sepolia Testnet** - Current deployment
- **ERC-1155** - Multi-token standard

### Storage & Services
- **IPFS (Pinata)** - Decentralized file storage
- **SendGrid** - Transactional email
- **Resend** - Alternative email service

---

## Architecture

### Frontend Architecture
```
src/
├── Components/          # React components
│   ├── Library/         # Document management
│   ├── Tools/           # Regulation pathways, projects
│   ├── Chat/            # RAG chat interface
│   └── Auth/            # Authentication flows
├── services/            # API service layer
│   ├── documentsService.js
│   ├── pdfExtractionService.js
│   └── resolutionPathService.js
├── config/              # Configuration files
│   ├── firebase.js
│   ├── wagmiConfig.js
│   └── contracts/       # Smart contract ABIs
└── constants/           # App constants and enums
```

### Backend Services (server/server.cjs)
- **Port 3000** - Express API server
- `/api/rag-chat` - Secure OpenAI RAG chat endpoint
- `/api/suggest-tags` - AI-powered document tag suggestions
- `/api/extract-pdf-text` - Server-side PDF text extraction
- `/api/send-invitation-email` - SendGrid invitation emails
- `/api/send-reset-password-email` - Password reset emails

### Smart Contracts (contracts/)
- **I4TKdocToken** (0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288) - ERC-1155 token contract
- **I4TKnetwork** (0xa9870f477E6362E0810948fd87c0398c2c0a4F55) - Governance contract

### Data Flow
1. **User uploads document** → Frontend validates → IPFS storage via Pinata
2. **Metadata submission** → Firebase Firestore + Blockchain tokenization
3. **AI auto-tagging** → PDF text extraction → Embedding generation → GPT-4o-mini analysis
4. **Search query** → TensorFlow.js embeddings → Cosine similarity matching → Results
5. **RAG chat** → Language detection → Semantic search → OpenAI API (backend) → Response

---

## Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **Firebase project** with Authentication and Firestore enabled
- **Pinata account** for IPFS storage
- **OpenAI API key** (GPT-4o-mini access)
- **SendGrid API key** for email services
- **Ethereum wallet** (MetaMask) for blockchain features
- **Sepolia testnet ETH** for contract interactions

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/j0r1ss0u/I4TKnowledge.org.git
cd I4TKnowledge.org
```

### 2. Install Dependencies

#### Frontend & Backend
```bash
npm install
```

#### Smart Contracts (optional, for contract development)
```bash
cd contracts
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# IPFS Storage (Pinata)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt

# OpenAI API (Backend-only, DO NOT use VITE_ prefix)
OPENAI_API_KEY=sk-your-openai-api-key

# Email Services
SENDGRID_API_KEY=your_sendgrid_api_key
RESEND_API_KEY=your_resend_api_key

# Blockchain Configuration
VITE_CHAIN_ID=11155111  # Sepolia testnet
VITE_I4TK_NETWORK_ADDRESS=0xa9870f477E6362E0810948fd87c0398c2c0a4F55
VITE_I4TK_TOKEN_ADDRESS=0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288

# GitHub Token (for deployments and CI/CD)
GITHUB_TOKEN=your_github_personal_access_token
```

**⚠️ IMPORTANT SECURITY NOTES:**
- **NEVER** commit `.env` to GitHub (already in `.gitignore`)
- Use `VITE_` prefix ONLY for frontend-exposed variables
- Keep `OPENAI_API_KEY` backend-only (no `VITE_` prefix)
- Use Replit Secrets for production deployment

### 4. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Authentication** → Email/Password provider
3. Enable **Firestore Database** → Start in production mode
4. Create Firestore collections:
   - `users` - User profiles
   - `documents` - Document metadata
   - `projects` - Research projects
   - `resolutionPaths` - Regulation pathways
   - `invitations` - User invitations
   - `validations` - Peer validation records

5. Set up Firestore security rules (see `firestore.rules`)

### 5. Pinata IPFS Setup

1. Create account at https://pinata.cloud
2. Generate API keys: Dashboard → API Keys → New Key
3. Copy JWT token for authentication
4. Add credentials to `.env`

### 6. OpenAI API Setup

1. Create account at https://platform.openai.com
2. Generate API key: API Keys → Create new secret key
3. Add to `.env` (without `VITE_` prefix for security)
4. Ensure billing is enabled (GPT-4o-mini is very cost-effective)

---

## Configuration

### Vite Configuration (vite.config.js)

```javascript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  // Manual code splitting for optimal bundle sizes
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-web3': ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
          'vendor-ai': ['@tensorflow/tfjs', '@tensorflow-models/universal-sentence-encoder']
        }
      }
    }
  }
});
```

### Workflow Configuration

Two workflows run in development:

1. **Server** (port 5000) - Frontend Vite dev server
   ```bash
   npm run dev
   ```

2. **Backend** (port 3000) - Express API server
   ```bash
   node server/server.cjs
   ```

---

## Smart Contracts

### Development Workflow

Located in `contracts/` directory:

```bash
cd contracts

# Compile contracts and generate ABIs
npm run compile

# Run tests
npm run test

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to Ethereum mainnet (⚠️ USE WITH CAUTION)
npm run deploy:mainnet
```

### Contract Addresses (Sepolia Testnet)

- **I4TKnetwork**: `0xa9870f477E6362E0810948fd87c0398c2c0a4F55`
  - Governance contract
  - Member registration with roles
  - Peer validation system (4 validators required)
  - Automatic token distribution

- **I4TKdocToken**: `0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288`
  - ERC-1155 multi-token contract
  - Document ownership representation
  - Contribution tracking
  - 40% creator / 60% referenced documents distribution

### Multi-Network Support

Configure network in `.env`:
```env
VITE_CHAIN_ID=11155111  # Sepolia
# VITE_CHAIN_ID=1       # Mainnet (when ready)
```

ABIs automatically loaded from `src/config/contracts/` (generated from compilation).

---

## Running the Application

### Development Mode

1. **Start both workflows:**
   ```bash
   # Terminal 1: Frontend (port 5000)
   npm run dev

   # Terminal 2: Backend (port 3000)
   node server/server.cjs
   ```

2. **Access the app:**
   - Local: http://localhost:5000
   - Replit: https://your-repl-name.username.repl.co

### Production Build

```bash
# Build frontend
npm run build

# Preview production build locally
npm run preview

# Serve in production (unified server)
node server/server.cjs
```

The production server serves both:
- Static frontend files from `dist/`
- API endpoints on `/api/*`

---

## Deployment

### Replit Deployment (Autoscale)

The project is configured for **autoscale deployment**:

```javascript
// Deploy configuration
{
  "deployment_target": "autoscale",
  "build": ["npm", "run", "build"],
  "run": ["node", "server/server.cjs"]
}
```

**Deployment steps:**
1. Click **Deploy** button in Replit
2. Configure environment secrets (Secrets tab)
3. Choose autoscale deployment
4. Deploy to production

**Production URLs:**
- https://i4tk.replit.app
- https://i4tknowledge.org
- https://www.i4tknowledge.org

### Environment Variables for Production

Add these secrets in Replit Secrets (🔒 icon):
- `OPENAI_API_KEY`
- `SENDGRID_API_KEY`
- `RESEND_API_KEY`
- `GITHUB_TOKEN` (for CI/CD)
- All `VITE_*` variables from `.env`

---

## Project Structure

```
I4TKnowledge.org/
├── contracts/                  # Smart contracts (Hardhat)
│   ├── contracts/              # Solidity source files
│   │   ├── I4TKdocToken.sol    # ERC-1155 token contract
│   │   └── I4TKnetwork.sol     # Governance contract
│   ├── scripts/                # Deployment scripts
│   ├── test/                   # Contract tests
│   ├── artifacts/              # Compiled contracts (auto-generated)
│   └── hardhat.config.js       # Hardhat configuration
│
├── server/                     # Backend Express server
│   └── server.cjs              # API endpoints (port 3000)
│
├── src/                        # Frontend React application
│   ├── Components/
│   │   ├── Library/            # Document management
│   │   │   ├── components/
│   │   │   │   ├── NetworkPublications.jsx  # CSV export
│   │   │   │   └── DocumentGenealogy.jsx    # Citation tree
│   │   │   └── GenealogyPage.jsx
│   │   ├── Chat/               # RAG chat interface
│   │   ├── Tools/              # Regulation pathways, projects
│   │   └── Auth/               # Authentication
│   │
│   ├── services/               # API service layer
│   │   ├── documentsService.js       # Document CRUD
│   │   ├── pdfExtractionService.js   # PDF text extraction
│   │   └── resolutionPathService.js  # Regulation pathways
│   │
│   ├── config/                 # Configuration
│   │   ├── firebase.js         # Firebase initialization
│   │   ├── wagmiConfig.js      # Web3 configuration
│   │   └── contracts/          # Smart contract ABIs
│   │       ├── I4TKdocToken.json
│   │       └── I4TKnetwork.json
│   │
│   ├── constants/              # App constants
│   │   └── index.js            # Enums, contract addresses
│   │
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # Entry point
│
├── public/                     # Static assets
├── .env                        # Environment variables (not committed)
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── replit.md                   # Project documentation
└── README.md                   # This file
```

---

## API Endpoints

### Backend Express API (port 3000)

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/rag-chat` | POST | RAG conversational AI | Public |
| `/api/suggest-tags` | POST | AI auto-tagging | Public |
| `/api/extract-pdf-text` | POST | PDF text extraction | Public |
| `/api/send-invitation-email` | POST | Send invitation email | Admin |
| `/api/send-reset-password-email` | POST | Password reset email | Public |

### Request/Response Examples

#### RAG Chat
```javascript
// Request
POST /api/rag-chat
Content-Type: application/json

{
  "message": "Quels documents parlent de gouvernance numérique?",
  "conversationHistory": []
}

// Response
{
  "response": "Voici les documents pertinents sur la gouvernance numérique...",
  "sources": [
    { "title": "Digital Governance Report", "ipfsCid": "bafybei..." }
  ]
}
```

#### AI Auto-Tagging
```javascript
// Request
POST /api/suggest-tags
Content-Type: application/json

{
  "documentText": "This document discusses digital rights and privacy...",
  "candidateElements": ["Privacy", "Digital Rights", "Governance"]
}

// Response
{
  "suggestions": [
    { "element": "Privacy", "confidence": 0.92, "reason": "Document extensively covers privacy issues..." },
    { "element": "Digital Rights", "confidence": 0.85, "reason": "Strong focus on digital rights framework..." }
  ]
}
```

---

## CSV Export Feature

**Admin-only** feature to export library metadata.

### Export Columns (14 total)
1. Token ID
2. Title
3. Authors
4. Description
5. Programme
6. Collection
7. Categories
8. Periodic Elements
9. References
10. IPFS CID
11. Creator Address
12. Created At
13. Validation Status
14. Transaction Hash

### Technical Details
- **Delimiter**: Semicolon (`;`) for Excel compatibility
- **Encoding**: UTF-8 with BOM
- **Character handling**: 
  - All newlines/tabs replaced with spaces
  - All semicolons in data converted to commas
  - Values quoted for CSV safety
- **Filename**: `i4tk-library-export-YYYY-MM-DD.csv`

### Access Control
Only users with `isWebAdmin: true` in Firestore can see the export button.

---

## Contributing

### Git Workflow

1. **Clone the repository**
   ```bash
   git clone https://github.com/j0r1ss0u/I4TKnowledge.org.git
   cd I4TKnowledge.org
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request** on GitHub

### Commit Message Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

### Code Style
- **ESLint** for JavaScript linting
- **Prettier** for code formatting (if configured)
- **Tailwind CSS** for styling (utility-first approach)
- **Camel case** for JavaScript variables/functions
- **Pascal case** for React components

---

## Troubleshooting

### Common Issues

**1. Workflows not starting**
- Check that both `npm run dev` and `node server/server.cjs` are running
- Verify port 3000 and 5000 are not in use
- Restart workflows in Replit

**2. IPFS upload failures**
- Verify Pinata API keys in `.env`
- Check file size limits (Pinata free tier: 100MB/file)
- Ensure stable internet connection

**3. OpenAI API errors**
- Verify `OPENAI_API_KEY` is set (without `VITE_` prefix)
- Check OpenAI billing is enabled
- Backend server must be running on port 3000

**4. Blockchain connection issues**
- Ensure MetaMask is installed and unlocked
- Switch to Sepolia testnet in MetaMask
- Request Sepolia ETH from faucet: https://sepoliafaucet.com
- Verify contract addresses in `.env`

**5. Firebase authentication errors**
- Check Firebase config in `.env` (all `VITE_FIREBASE_*` variables)
- Verify Email/Password provider is enabled in Firebase Console
- Check Firestore security rules allow read/write

---

## Performance Optimization

### Bundle Size
- Manual code splitting configured in `vite.config.js`
- Vendor libraries separated into chunks:
  - `vendor-react`: React ecosystem
  - `vendor-firebase`: Firebase services
  - `vendor-web3`: Blockchain libraries
  - `vendor-ai`: TensorFlow.js and ML models

### Caching Strategy
- Production server sets `Cache-Control: no-cache` headers to prevent stale content
- IPFS content cached by gateway (CDN-like behavior)

### AI Model Loading
- TensorFlow.js models loaded on-demand (not on initial page load)
- Universal Sentence Encoder cached after first load

---

## Security Best Practices

✅ **Implemented:**
- All OpenAI API calls routed through backend (no exposed keys)
- Firebase security rules restrict document access by role
- HTTPS enforced in production
- Environment variables not committed to Git
- JWT tokens for Firebase authentication
- CORS configured for trusted origins only

⚠️ **Recommendations:**
- Regularly rotate API keys (OpenAI, Pinata, SendGrid)
- Enable Firebase App Check for production
- Implement rate limiting on API endpoints
- Use multi-signature wallets for smart contract ownership
- Conduct smart contract security audit before mainnet deployment

---

## Roadmap

### Planned Features
- [ ] Ethereum mainnet deployment
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (beyond French/English)
- [ ] Mobile app (React Native)
- [ ] Integration with additional LLM providers
- [ ] Enhanced citation visualization (3D network graphs)
- [ ] Automated testing (Jest + Cypress)
- [ ] CI/CD pipeline with GitHub Actions

---

## License

This project is proprietary software developed for I4T Knowledge Network.

For licensing inquiries, please contact: jorisgalea@gmail.com

---

## Support & Contact

- **GitHub Issues**: https://github.com/j0r1ss0u/I4TKnowledge.org/issues
- **Email**: jorisgalea@gmail.com
- **Documentation**: See `replit.md` for detailed technical architecture

---

## Acknowledgments

- **Firebase** for backend infrastructure
- **OpenAI** for GPT-4o-mini API
- **Pinata** for IPFS pinning services
- **Replit** for development and hosting platform
- **TensorFlow.js** for client-side ML capabilities
- **Hardhat** for smart contract development tools

---

**Built with ❤️ for digital governance research and collaboration**
