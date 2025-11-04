# Overview

I4T Knowledge Network is a comprehensive web application designed for digital governance research and collaboration. The platform serves as a knowledge management system where researchers can share documents, engage in conversations with an AI assistant, and collaborate on policy research projects. The application includes features for user management, document storage with semantic search capabilities, project management, event organization, AI-powered document auto-tagging, and blockchain integration for tokenizing research contributions.

# Recent Changes (November 2024)

## Production Deployment Architecture (November 4, 2024)
- **Changed deployment from "static" to "autoscale"** - Backend Express server now serves both API endpoints AND frontend static files
- **Express v5 wildcard syntax** - Updated catch-all route from `/{*catchall}` (required by Express v5)
- **Unified production server** - Single Express server on PORT (env variable) serves frontend from `dist/` folder and handles all API routes
- **Build pipeline** - `npm run build` creates production bundle, then `node server/server.cjs` serves both frontend and backend
- **Route ordering fix** - Moved `express.static()` AFTER API routes to prevent conflicts
- **Production URLs** - Deployed on `i4tk.replit.app`, `i4tknowledge.org`, and `www.i4tknowledge.org`
- **✅ RAG and auto-tagging confirmed working in production** (November 4, 2024)

## Security Enhancements
- **Migrated all OpenAI API calls to secure backend** - RAG chat and auto-tagging now route through Express backend (`server.cjs`) instead of exposing API keys to the browser
- **Environment variable migration** - Moved from `VITE_OPENAI_API_KEY` (exposed to client) to `OPENAI_API_KEY` (server-only secret)
- **Removed dangerouslyAllowBrowser flag** - No OpenAI client instantiation in frontend code

## Performance Optimizations
- **Upgraded to GPT-4o-mini** - 60x cost reduction ($0.15/1M tokens vs $10/1M) with 2-3x speed improvement
- **Vite proxy configuration** - All `/api/*` requests automatically proxied to `localhost:3000` backend in development mode

## AI Auto-Tagging System
- **PDF text extraction** - Automatic extraction of document content from IPFS-stored PDFs
- **Semantic candidate selection** - TensorFlow.js embeddings to shortlist 6-8 relevant periodic table elements
- **GPT-4o-mini validation** - AI analyzes document content and suggests tags with confidence scores (≥60% threshold) and explanations
- **UI integration** - DocumentMetadataEditor includes "AI Suggest Tags" button with confidence badges and apply/apply-all functionality

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses React 18 with Vite as the build tool and bundler. The frontend is styled with Tailwind CSS and includes Framer Motion for animations. React Router handles client-side routing, and the application supports both English and French languages through a dynamic translation system.

The build configuration includes manual code splitting to optimize bundle sizes, separating vendor libraries (React ecosystem, Firebase, blockchain tools) from application code. This approach reduces initial load times and improves caching efficiency.

## Backend Services

### Express Backend (server.cjs)
The application includes an Express.js backend server running on port 3000 that handles:
- **OpenAI RAG Chat** (`/api/rag-chat`) - Secure server-side OpenAI API calls for conversational AI
- **Auto-Tagging AI** (`/api/suggest-tags`) - GPT-4o-mini powered document tag suggestions
- **PDF Text Extraction** (`/api/extract-pdf-text`) - Server-side PDF content extraction from IPFS
- **Email Services** - SendGrid integration for invitations and password resets via `/api/send-invitation-email` and `/api/send-reset-password-email`
- **Ollama Proxy** (`/api/chat`) - Local LLM integration endpoint (optional)

All frontend API calls to `/api/*` are automatically proxied through Vite's dev server configuration.

### Firebase Services
Firebase provides the primary cloud infrastructure:
- **Firebase Authentication** handles user registration, login, email verification, and password reset functionality
- **Cloud Firestore** serves as the NoSQL database for storing user profiles, documents, projects, invitations, and governance data
- **Firebase Cloud Functions** provide serverless backend logic for NewsBlur integration and additional server-side operations

The authentication system supports invitation-based user registration with role-based access control (Admin, Validator, Member roles). Email verification is automatically handled for invited users.

## Document Management and AI Integration
Documents are stored using IPFS through Pinata's pinning service, providing decentralized storage. The system generates semantic embeddings using TensorFlow.js and the Universal Sentence Encoder model for intelligent document search and retrieval.

### RAG Chat System (Secure Backend Architecture)
An OpenAI GPT-4o-mini powered conversational AI assistant provides intelligent document search and question answering:
- **Language detection** - Automatic French/English detection using the 'franc' library
- **Semantic search** - TensorFlow.js embeddings with cosine similarity matching to find relevant documents
- **Conversation routing** - Intelligent classification of user intents (greeting, research, chitchat)
- **Backend-only API calls** - All OpenAI interactions routed through `/api/rag-chat` endpoint for security
- **IPFS content retrieval** - Automatic fetching of full document text from IPFS for context
- **Bilingual responses** - Contextual answers in French or English with source citations

### AI Auto-Tagging System
Automatic periodic table element suggestions for uploaded documents:
- **PDF text extraction** - Server-side extraction of PDF content via `/api/extract-pdf-text`
- **Embedding-based candidate selection** - TensorFlow.js Universal Sentence Encoder to shortlist 6-8 relevant elements
- **GPT-4o-mini validation** - AI analysis with confidence scoring (0-1 scale) and detailed rationales
- **Confidence thresholds** - Only suggestions ≥60% confidence displayed to users
- **Interactive UI** - DocumentMetadataEditor with color-coded confidence badges (green ≥80%, yellow 60-79%, orange <60%)
- **Batch operations** - Apply individual tags or all suggestions at once

## Blockchain Integration
The application integrates Web3 functionality through:
- **Wagmi** and **RainbowKit** for wallet connectivity
- **Viem** for Ethereum blockchain interactions
- Support for the Sepolia testnet
- Smart contract integration for tokenizing research contributions and managing governance roles

## Data Storage Strategy
The application uses a hybrid storage approach:
- **Firestore** for structured data (users, projects, metadata)
- **IPFS** for document files and content
- **Blockchain** for immutable records and tokenization
- **Local storage** for user preferences and session data

## External Service Integrations
- **SendGrid** for transactional email delivery (invitations, password resets) via backend endpoints
- **OpenAI API** (GPT-4o-mini) for conversational AI and auto-tagging - **server-side only** via `OPENAI_API_KEY` environment variable
- **TensorFlow.js** for client-side machine learning (Universal Sentence Encoder embeddings)
- **NewsBlur API** for content aggregation (configured in Firebase Functions)
- **Pinata/IPFS** for decentralized file storage and document retrieval

# External Dependencies

## Firebase Services
- Firebase Authentication for user management
- Cloud Firestore for NoSQL database
- Firebase Functions for serverless backend logic
- Firebase Hosting for deployment (configured)

## AI and Machine Learning
- OpenAI GPT-4o-mini API for RAG chat and auto-tagging (backend-only, via Express server)
- TensorFlow.js for Universal Sentence Encoder embeddings (client-side)
- Franc library for automatic language detection (French/English)

## Blockchain and Web3
- Wagmi for React Web3 hooks
- RainbowKit for wallet connection UI
- Viem for Ethereum client functionality
- MetaMask connector for wallet integration

## File Storage and IPFS
- Pinata for IPFS pinning services
- NFT.Storage as alternative IPFS provider
- Axios for HTTP requests to IPFS gateways

## Email and Communication
- SendGrid for transactional email delivery
- CORS middleware for cross-origin requests
- Nodemailer as email service alternative

## PDF and Document Processing
- PDF.js for PDF rendering and text extraction
- React-PDF for PDF viewer components
- React-Dropzone for file upload interface

## UI and Visualization
- Leaflet and React-Leaflet for interactive maps
- React-D3-Tree for hierarchical data visualization
- Lucide React for consistent iconography
- React Icons for additional icon sets

## Development and Build Tools
- Vite for fast development and optimized builds
- Tailwind CSS for utility-first styling
- PostCSS and Autoprefixer for CSS processing
- TypeScript support for type safety