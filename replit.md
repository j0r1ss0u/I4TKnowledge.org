# Overview

I4T Knowledge Network is a web application for digital governance research and collaboration. It functions as a knowledge management system enabling researchers to share documents, interact with an AI assistant, and collaborate on policy research. Key features include user management, semantic document search, project management, event organization, AI-powered document auto-tagging, and blockchain integration for tokenizing research contributions. The platform aims to foster collaboration and advance digital governance research.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (March 2026)

## Translation System — EN/FR/ES via ui.js (COMPLETE)
Full EN/FR/ES translation system via `src/translations/ui.js` (single source of truth):
- **729 EN = 729 FR = 729 ES keys, parity 0 missing** across all sections
- All 37 active components wired (V1–V5 migration waves complete)
- 3 components intentionally left on `library.js`: NetworkPublications, LibrarianSpace, RecoverMissingDocument
- `App.jsx`: fully migrated — RegisterComponent and AppContent use `ui[currentLang].register` keys
- Language selector dropdown in Header (EN / FR / ES); language persisted in `localStorage`
- Single source of truth: `language` from `useAuth()` — AuthContext accepts `'en' | 'fr' | 'es'`
- Fixed crash bugs: `Globaltoolkit.jsx` and `WalkThrough.jsx` used `import { ui }` (named import) instead of `import ui` (default) — caused blank page on Tools and Guide routes

## Periodic Table Wired to Translation System
- `ui.js` now has `categories` section (6 category keys, EN + ES) and `resolutionPath` section (45 keys, EN + ES)
- `Globaltoolkit.jsx`: category headers use `cat[categoryKey]` from ui.js; CSV export also uses translated names
- `ResolutionPath.jsx`: inline `translations` object (400 lines, 5 languages) removed; `t` and `cat` now come from `(ui[language] ?? ui.en).resolutionPath/.categories`
- Category name resolution (enrichElement function) uses `cat[element.category]` instead of the old `nameFr` conditional

## Multilingual Support — 5 Languages (EN / FR / ES / PT / ZH)
Legacy 5-language toggle system (pre-ui.js migration):
- Created `src/translations/es.js`, `pt.js`, `zh.js` for AuthContext strings
- `src/translations/index.js`: added `es`, `pt`, `zh` cases; `getAvailableLanguages` returns `['en', 'fr', 'es', 'pt', 'zh']`
- `src/translations/library.js`: ES section was already complete; PT and ZH sections added
- `AuthContext.jsx`: toggle cycle EN→FR→ES→PT→ZH→EN; logout button translated in all 5 languages
- `Header.jsx`: LanguageToggle shows current language code (EN/FR/ES/PT/ZH); aria-label cycles correctly
- `ForgotPassword.jsx`: PT and ZH sections added + 5-way toggle cycle
- `PasswordForm.jsx`: PT and ZH sections added
- `ResolutionPath.jsx`: full PT ("Itinerários de Regulação") and ZH ("监管路径") sections added

## Mobile UX — Tools Page
- Periodic table: horizontal scroll on mobile (`overflow-x-auto`, min-width 660px); scroll hint banner on mobile, zoom/pan hint on desktop only
- ResolutionPath creation: full-screen overlay on mobile (instead of Draggable floating panel); built-in element search picker by tap (replaces HTML5 drag-and-drop which is not supported on touch); desktop behavior unchanged

# Recent Fixes (February 2026)

## Blockchain Role Registration Fix
Fixed critical bug in LibrarianSpace.jsx where wagmi v2's `useWaitForTransactionReceipt` used unsupported `onSuccess`/`onError` callbacks:
- Replaced with `useEffect` watching `isTxSuccess`/`isTxError` (wagmi v2 compatible)
- Firestore save now happens ONLY after blockchain confirmation (was saving before confirmation)
- Added transaction status UI feedback (pending/confirmed/failed) with Etherscan link
- Form disabled during pending transaction to prevent data mismatch

## Role Hierarchy Fix
- LibraryPage.jsx: Submit Contribution tab now accessible to validators and admins (not just contributors)
- AppContext.jsx: Profile hierarchy uses `>=` comparison so validators inherit contributor capabilities
- Role hashes now sourced from shared `contractConfig.roles` instead of duplicated constants
- Smart contract confirms: `registerMember(profile=2)` grants both CONTRIBUTOR and VALIDATOR roles

## IPFS Multi-Gateway Fallback
Unified IPFS gateway fallback across all components (priority: Pinata > ipfs.io > dweb.link > 4everland):
- LargeDocumentViewer, DocumentViewer, NetworkPublications, chatService, pdfExtractionService, server.cjs, I4TDashboard
- Removed dead cloudflare-ipfs.com gateway

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