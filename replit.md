# Overview

I4T Knowledge Network is a comprehensive web application designed for digital governance research and collaboration. The platform serves as a knowledge management system where researchers can share documents, engage in conversations with an AI assistant, and collaborate on policy research projects. The application includes features for user management, document storage with semantic search capabilities, project management, event organization, and blockchain integration for tokenizing research contributions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses React 18 with Vite as the build tool and bundler. The frontend is styled with Tailwind CSS and includes Framer Motion for animations. React Router handles client-side routing, and the application supports both English and French languages through a dynamic translation system.

The build configuration includes manual code splitting to optimize bundle sizes, separating vendor libraries (React ecosystem, Firebase, blockchain tools) from application code. This approach reduces initial load times and improves caching efficiency.

## Backend Services
The backend leverages Firebase as the primary infrastructure:
- **Firebase Authentication** handles user registration, login, email verification, and password reset functionality
- **Cloud Firestore** serves as the NoSQL database for storing user profiles, documents, projects, invitations, and governance data
- **Firebase Cloud Functions** provide serverless backend logic for email notifications (SendGrid integration), user management, and authentication workflows

The authentication system supports invitation-based user registration with role-based access control (Admin, Validator, Member roles). Email verification is automatically handled for invited users.

## Document Management and AI Integration
Documents are stored using IPFS through Pinata's pinning service, providing decentralized storage. The system generates semantic embeddings using TensorFlow.js and the Universal Sentence Encoder model for intelligent document search and retrieval.

An OpenAI-powered conversational AI assistant can search through documents using vector similarity matching and provide contextual responses. The chat service includes language detection (using the 'franc' library) and conversation routing to handle different types of user interactions.

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
- **SendGrid** for transactional email delivery (invitations, password resets)
- **OpenAI API** for conversational AI capabilities
- **TensorFlow.js** for client-side machine learning (embeddings)
- **NewsBlur API** for content aggregation (configured in Firebase Functions)
- **Pinata/IPFS** for decentralized file storage

# External Dependencies

## Firebase Services
- Firebase Authentication for user management
- Cloud Firestore for NoSQL database
- Firebase Functions for serverless backend logic
- Firebase Hosting for deployment (configured)

## AI and Machine Learning
- OpenAI API for conversational AI
- TensorFlow.js for universal sentence encoder embeddings
- Franc library for automatic language detection

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