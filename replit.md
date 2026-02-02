# Overview

I4T Knowledge Network is a web application for digital governance research and collaboration. It functions as a knowledge management system enabling researchers to share documents, interact with an AI assistant, and collaborate on policy research. Key features include user management, semantic document search, project management, event organization, AI-powered document auto-tagging, and blockchain integration for tokenizing research contributions. The platform aims to foster collaboration and advance digital governance research.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Features (January 2026)

## Library Heatmap CSV Export
Admin-only feature allowing export of document coverage analysis:
- Document-per-row format with X-marked columns for each periodic table element
- Enables analysis of which regulatory elements are covered across the document collection
- Available via "Export Heatmap CSV" button in the Library admin interface

## Blockchain Document Recovery Tool
`RecoverMissingDocument.jsx` - Admin tool for recovering documents that exist on blockchain but failed to sync to Firebase:
- Search by Token ID on Sepolia network
- Automatic ERC-1155 URI template resolution (`{id}` placeholder handling)
- IPFS metadata fetching via backend proxy (bypasses CORS)
- PDF metadata extraction (title, author) from IPFS documents
- Manual metadata entry with validation
- Duplicate detection to prevent re-adding existing documents

## IPFS Proxy Endpoint
`/api/ipfs-proxy` - Backend endpoint for reliable IPFS content retrieval:
- Tries multiple IPFS gateways (Pinata, ipfs.io, Cloudflare, dweb.link)
- Automatic PDF detection and metadata extraction
- JSON metadata parsing for NFT-style documents
- Bypasses browser CORS restrictions

# System Architecture

## Frontend Architecture
The application utilizes React 18, Vite, Tailwind CSS, and Framer Motion for animations. React Router manages client-side routing, and it supports both English and French languages. The build process includes manual code splitting to optimize bundle sizes and improve load times.

## Backend Services
An Express.js backend (`server.cjs`) handles:
- **OpenAI RAG Chat**: Secure server-side OpenAI API calls for conversational AI.
- **Auto-Tagging AI**: GPT-4o-mini powered document tag suggestions.
- **PDF Text Extraction**: Server-side PDF content extraction from IPFS.
- **Email Services**: Resend integration for invitations and password resets.
- **IPFS Proxy**: Multi-gateway IPFS content retrieval with PDF metadata extraction.
- **Ollama Proxy**: Endpoint for local LLM integration (optional).
All frontend API calls to `/api/*` are proxied through Vite in development.

Firebase provides core cloud infrastructure:
- **Firebase Authentication**: User management, registration, login, and role-based access control (Admin, Validator, Member).
- **Cloud Firestore**: NoSQL database for users, documents, projects, and governance data.
- **Firebase Cloud Functions**: Serverless logic, including NewsBlur integration.

## Document Management and AI Integration
Documents are stored on IPFS via Pinata. Semantic embeddings are generated using TensorFlow.js and Universal Sentence Encoder for intelligent search.

### RAG Chat System
An OpenAI GPT-4o-mini AI assistant provides intelligent document search and Q&A:
- **Language Detection**: Automatic French/English detection.
- **Semantic Search**: TensorFlow.js embeddings for document relevance.
- **Conversation Routing**: Classifies user intents.
- **Secure API Calls**: All OpenAI interactions are routed through a backend endpoint (`/api/rag-chat`).
- **IPFS Content Retrieval**: Fetches document text for context.
- **Bilingual Responses**: Contextual answers in French or English with citations.

### AI Auto-Tagging System
Automatic periodic table element suggestions for documents:
- **PDF Text Extraction**: Server-side extraction of PDF content.
- **Embedding-based Candidate Selection**: TensorFlow.js to shortlist relevant elements.
- **GPT-4o-mini Validation**: AI analysis provides confidence scores and rationales.
- **Confidence Thresholds**: Only suggestions ≥60% confidence are displayed.
- **Interactive UI**: `DocumentMetadataEditor` with color-coded confidence badges and batch apply options.

## Blockchain Integration
The platform uses two smart contracts on the Sepolia testnet (with mainnet plans):
- **I4TKdocToken (ERC1155)**: Manages research document ownership, token minting, and a distribution system (40% to creator, 60% to referenced documents).
- **I4TKnetwork**: Governance contract managing member roles (Admin, Contributor, Validator) and a peer validation system (4 validations for publication) with automatic token distribution.

Web3 integration uses Wagmi and RainbowKit for wallet connectivity, and Viem for blockchain interactions. Hardhat is used for smart contract development. ABIs are dynamically loaded from compiled artifacts, and `VITE_CHAIN_ID` configures network support.

## Data Storage Strategy
A hybrid approach is used:
- **Firestore**: Structured data (users, projects, metadata).
- **IPFS**: Document files and content.
- **Blockchain**: Immutable records and tokenization.
- **Local Storage**: User preferences and session data.

## External Service Integrations
- **SendGrid**: Transactional email.
- **OpenAI API (GPT-4o-mini)**: Conversational AI and auto-tagging (backend only).
- **TensorFlow.js**: Client-side machine learning for embeddings.
- **NewsBlur API**: Content aggregation.
- **Pinata/IPFS**: Decentralized file storage.

# External Dependencies

## Firebase Services
- Firebase Authentication
- Cloud Firestore
- Firebase Functions

## AI and Machine Learning
- OpenAI GPT-4o-mini API
- TensorFlow.js
- Franc library

## Blockchain and Web3
- Wagmi
- RainbowKit
- Viem
- MetaMask connector

## File Storage and IPFS
- Pinata
- NFT.Storage
- Axios

## Email and Communication
- SendGrid
- CORS

## PDF and Document Processing
- PDF.js
- React-PDF
- React-Dropzone

## UI and Visualization
- Leaflet and React-Leaflet
- React-D3-Tree
- Lucide React
- React Icons

## Development and Build Tools
- Vite
- Tailwind CSS
- PostCSS and Autoprefixer
- TypeScript