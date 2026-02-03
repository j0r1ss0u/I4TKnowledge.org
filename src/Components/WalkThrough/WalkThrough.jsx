import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownContent = `# I4TK Knowledge Network - User Guide

---

## Overview

This guide presents the platform features organized by access level:
1. **Visitor** (not logged in)
2. **Member** (authenticated user)
3. **Validator** (can submit and validate documents)
4. **Administrator** (full platform control)

---

## Visitor (Not Logged In)

### Home Page
- Welcome page with platform introduction
- Key message: "Collaborative platform for digital governance research"
- Available actions:
  - Create an account
  - Log in
  - No access to documents or tools without authentication

> I4TK Knowledge Network is a knowledge management platform for collaborative research. Visitors must create an account or log in to access all features.

---

## Member (Authenticated User)

### Dashboard & Navigation
After logging in as a Member, you gain access to all main sections:
- Library (Document collection)
- AI Assistant
- Tools (Regulation Pathways)
- News

### Document Library
Navigate to **Library** to access:
- List of published documents with metadata
- Category filters (Research Paper, Regulation, Guideline, etc.)
- Semantic search by title/content
- PDF document viewer
- **Citation Tree**: Click on a document to see references (gray, below) and descendants (green, above)

> The library contains all validated documents. Each document displays its metadata, categories, and associated periodic table elements. The citation tree shows referenced documents in gray and citing documents in green.

### RAG AI Assistant
Navigate to **AI Assistant** to access:
- Conversational chat interface
- Automatic French/English language detection
- Ask questions about any topic (e.g., "What are the main AI regulations?")
- Responses include citations from relevant documents
- Clickable links to source documents

> The AI assistant uses GPT-4o-mini and semantic search to answer questions based on the library documents. It automatically detects the language and provides accurate citations.

### Periodic Table of Platform Regulation
Navigate to **Tools** to access:
- **54 regulatory elements** organized in a periodic table layout
- **6 thematic categories** with color coding:
  - Institutional Framework (green) - Governance structures
  - Legislating Platforms (green) - Legal frameworks
  - Human Rights & Rule of Law (red) - Protection mechanisms
  - Content Governance (blue) - Content moderation
  - Systemic Risks + Due Diligence (blue) - Risk assessment
  - Pro-social Design (blue) - Design for positive outcomes
- Click any element to view detailed description and linked documents
- Each document can be tagged with relevant periodic elements

> The Periodic Table of Regulation is a unique tool that categorizes 54 regulatory concepts into 6 families. Clicking an element shows its description and associated library documents.

### Regulation Pathways
Navigate to **Tools** > **Regulation Pathways** to access:
- Create regulatory pathways combining multiple elements
- Visualize connections between concepts

> Regulation Pathways allow you to create pathways combining multiple periodic table elements to visualize complete regulatory approaches.

---

## Validator

Validators have additional capabilities for managing the collaborative validation process.

### Submit a Document
Navigate to **Library** > **Submit Document**:
- **Upload PDF**: Drag and drop a document
- **Metadata**: Fill in title, authors, categories
- **Reference Selection**: Choose existing documents as references
- **AI Auto-Tagging** (links to Periodic Table):
  - Click "Suggest Tags with AI" button
  - **5-step pipeline**:
    1. PDF text extraction from IPFS
    2. Semantic embeddings generation (TensorFlow.js)
    3. Candidate pre-selection by cosine similarity
    4. GPT-4o-mini validation with confidence scores
    5. Display suggestions (threshold: 60%+)
  - Color-coded badges: Green (80%+) | Yellow (60-79%)
  - Accept individually or use "Apply All"
- **IPFS Upload**: Document stored in decentralized storage
- **Blockchain**: ERC1155 token minted on Sepolia

> AI Auto-Tagging analyzes document content and suggests relevant Periodic Table elements. The system combines semantic embeddings and GPT-4o-mini for accurate suggestions with confidence levels. PDFs are stored on IPFS and an ERC1155 token is created on the blockchain.

### Validate a Submitted Document
Navigate to **Library** > **Network Publications**:
- List of documents pending validation
- Validation status (0/4, 1/4, 2/4, 3/4)
- Visual progress bar
- Click "Validate" for a document
- MetaMask confirmation for blockchain transaction
- Status updates (e.g., 0/4 to 1/4)

> The validation system is collaborative: 4 validations are required to publish a document. Each validation is recorded on the blockchain via the I4TKnetwork smart contract. At the 4th validation, tokens are automatically distributed: 40% to the creator, 60% to referenced documents recursively.

### Token Distribution
- Each published document receives 100 million tokens
- If the document references other works, distribution is automatic and recursive
- Tokens represent intellectual contribution across the entire research lineage

> Once published, the document receives 100 million tokens. If the document references other works, distribution is automatic and recursive throughout the reference chain, valuing the entire research lineage.

---

## Administrator

Administrators have full control over the platform: user management, blockchain roles, and data export.

### User Management
Navigate to **Admin Tools** > **User Management**:
- List of all users with Firestore roles
- Filter by role (Admin, Validator, Member)
- Promote a Member to Validator
- Blockchain synchronization option for roles
- Email invitations via SendGrid

> Admins can manage roles in Firestore and synchronize them to the blockchain. The email invitation system makes onboarding new researchers easy.

### Blockchain Role Management
Navigate to **Admin Tools** > **Blockchain Roles**:
- Interface for assigning on-chain roles:
  - CONTRIBUTOR_ROLE (can submit)
  - VALIDATOR_ROLE (can validate)
  - MINTER_ROLE (can create tokens)
  - ADMIN_ROLE (full control)
- Grant roles to wallet addresses
- MetaMask confirmation for transactions

> Blockchain roles are managed via OpenZeppelin's AccessControl system. Admins can grant/revoke permissions directly from the interface without using Etherscan.

### CSV Export & Analytics
Navigate to **Admin Tools** > **Export Library**:
- "Export to CSV" button
- Download CSV file with all metadata
- Format: UTF-8 with BOM, semicolon delimiter (Excel-compatible)
- Automatic cleaning: line breaks removed, semicolons replaced
- Columns: Title, Authors, Categories, IPFS CID, Token ID, validation status, etc.

> CSV export allows analysis in Excel or data analysis tools. The format is optimized for Excel compatibility with UTF-8 encoding and automatic special character cleaning.

### Blockchain Monitoring
- Links to Sepolia Etherscan for smart contracts:
  - I4TKnetwork: 0xa9870f477E6362E0810948fd87c0398c2c0a4F55
  - I4TKdocToken: 0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288
- View all on-chain transactions

> All blockchain events are public and verifiable on Sepolia Etherscan. The platform is ready for future mainnet deployment.

---

## Key Features Summary

1. **Periodic Table**: 54 regulatory elements in 6 categories for research categorization
2. **AI Auto-Tagging**: Automatic periodic table element suggestions with GPT-4o-mini
3. **Collaboration**: Peer-to-peer validation system (4 validations required)
4. **Integrated AI**: RAG assistant for intelligent search with citations
5. **Blockchain**: Tokenized intellectual property (ERC1155) with automatic distribution
6. **Decentralization**: Documents on IPFS, immutable metadata on-chain
7. **Bilingual**: Native French/English support

> I4TK Knowledge Network combines digital governance, artificial intelligence, and blockchain to create a transparent collaborative ecosystem where every contribution is recognized and valued.
`;

const WalkThrough = () => {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
        <div className="prose prose-lg max-w-none
                      prose-headings:text-gray-900
                      prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-4
                      prose-h2:text-3xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                      prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-gray-700 prose-p:leading-relaxed
                      prose-li:text-gray-700
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic prose-blockquote:text-gray-700
                      prose-code:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
                      prose-hr:my-8 prose-hr:border-gray-300
                      prose-ul:list-disc prose-ul:ml-6
                      prose-ol:list-decimal prose-ol:ml-6
                      prose-a:text-blue-600 prose-a:underline">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default WalkThrough;
