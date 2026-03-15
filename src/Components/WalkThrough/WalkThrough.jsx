import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Users,
  BookOpen,
  Bot,
  Grid3X3,
  Route,
  Upload,
  CheckCircle,
  Coins,
  Settings,
  Shield,
  Download,
  Eye,
  Sparkles,
  FileText,
  Link2,
  MessageCircle,
  Lock,
  ArrowUpCircle,
  Wallet,
  ClipboardCheck
} from 'lucide-react';

const Section = ({ icon: Icon, title, children, defaultOpen = false, color = "blue" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    green: "bg-green-50 border-green-200 hover:bg-green-100",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    orange: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    gray: "bg-gray-50 border-gray-200 hover:bg-gray-100"
  };

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    gray: "text-gray-500"
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${colorClasses[color]}`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[color]}`} />
        <span className="font-semibold text-gray-800 flex-1 text-left">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 flex-shrink-0 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-200 space-y-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, children, color = "blue" }) => {
  const iconColors = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    orange: "text-orange-500",
    gray: "text-gray-400"
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[color]}`} />
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
      </div>
      <div className="text-gray-600 text-sm leading-relaxed">{children}</div>
    </div>
  );
};

const Highlight = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-700"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

const Step = ({ number, title, desc, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600"
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${colors[color]}`}>
        {number}
      </div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-gray-600 text-sm">{desc}</p>
      </div>
    </div>
  );
};

const WalkThrough = () => {
  const [activeTab, setActiveTab] = useState('observer');

  const tabs = [
    { id: 'observer', label: 'Observer', icon: Eye },
    { id: 'member', label: 'Member', icon: Users },
    { id: 'validator', label: 'Validator', icon: CheckCircle },
    { id: 'admin', label: 'Administrator', icon: Shield }
  ];

  return (
    <div className="container mx-auto max-w-4xl px-3 sm:px-4 py-6 sm:py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">I4TK Knowledge Network</h1>
          <p className="text-blue-100 text-base sm:text-lg">User Guide</p>
        </div>

        {/* Tab Navigation — scrollable on mobile */}
        <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
          <div className="flex min-w-max sm:min-w-0 sm:flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 sm:py-4 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">

          {/* ── Observer Tab ── */}
          {activeTab === 'observer' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                As an <strong>Observer</strong>, you can explore the library and research tools in read-only mode.
              </p>

              <Section icon={Eye} title="What you can access" defaultOpen={true} color="blue">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FeatureCard icon={BookOpen} title="Document Library">
                    Browse and search all published documents. View full metadata, descriptions, and citation networks.
                  </FeatureCard>
                  <FeatureCard icon={Bot} title="AI Assistant" color="purple">
                    Ask questions in English or French and get answers based on library documents, with citations.
                  </FeatureCard>
                  <FeatureCard icon={Grid3X3} title="Periodic Table" color="green">
                    Explore the 54 regulatory elements and see which documents cover each one.
                  </FeatureCard>
                  <FeatureCard icon={Route} title="Regulation Pathways" color="orange">
                    View and explore regulatory pathways built by network members.
                  </FeatureCard>
                </div>
              </Section>

              <Section icon={Lock} title="Restricted features" color="gray">
                <div className="space-y-2">
                  {[
                    'Submit documents to the library',
                    'Validate documents (peer review)',
                    'Access the community forum & Signal group',
                    'Create or edit regulation pathways',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-xs">✕</span>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon={ArrowUpCircle} title="Upgrade your access" color="green">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-green-800">
                    To become a full <strong>Member</strong> or <strong>Validator</strong>, contact the I4TK team:
                  </p>
                  <a
                    href="mailto:joris.galea@i4tknowledge.net"
                    className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-900 underline"
                  >
                    <MessageCircle className="w-4 h-4" />
                    joris.galea@i4tknowledge.net
                  </a>
                  <p className="text-xs text-green-700">
                    Members gain full access to the community. Validators can additionally submit documents and participate in peer review.
                  </p>
                </div>
              </Section>
            </div>
          )}

          {/* ── Member Tab ── */}
          {activeTab === 'member' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                As a member, you have access to the document library, AI assistant, community, and research tools.
              </p>

              <Section icon={BookOpen} title="Document Library" defaultOpen={true} color="blue">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FeatureCard icon={FileText} title="Browse Documents">
                    View all published documents with full metadata. Filter by category (Research Paper, Guideline, Policy Brief…) or search by title and content.
                  </FeatureCard>
                  <FeatureCard icon={Link2} title="Citation Tree">
                    Click any document to see its citation network.
                    <span className="block mt-2 space-x-1">
                      <Highlight color="green">Green = citing this document</Highlight>
                      {' '}
                      <Highlight>Gray = referenced by this document</Highlight>
                    </span>
                  </FeatureCard>
                </div>
              </Section>

              <Section icon={Bot} title="RAG AI Assistant" color="purple">
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    Ask questions in <strong>English or French</strong> and get answers based on library documents.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-800 italic">
                      "What are the main AI regulations in Europe?"
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      The assistant searches the library and provides citations to relevant documents.
                    </p>
                  </div>
                </div>
              </Section>

              <Section icon={Grid3X3} title="Periodic Table of Regulation" color="green">
                <p className="text-gray-700 text-sm mb-3">
                  A unique visualization with <strong>54 regulatory elements</strong> in <strong>6 categories</strong>:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {[
                    { color: "bg-green-500", label: "Institutional Framework" },
                    { color: "bg-green-500", label: "Legislating Platforms" },
                    { color: "bg-red-500", label: "Human Rights" },
                    { color: "bg-blue-500", label: "Content Governance" },
                    { color: "bg-blue-500", label: "Systemic Risks" },
                    { color: "bg-blue-500", label: "Pro-social Design" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <div className={`w-3 h-3 rounded flex-shrink-0 ${color}`}></div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Click any element to view its description and linked documents.
                </p>
              </Section>

              <Section icon={Route} title="Regulation Pathways" color="orange">
                <p className="text-gray-700 text-sm">
                  Create custom regulatory pathways by combining multiple periodic table elements.
                  Visualize complete regulatory approaches and share them with collaborators.
                </p>
              </Section>
            </div>
          )}

          {/* ── Validator Tab ── */}
          {activeTab === 'validator' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Validators can submit documents to the library and participate in the peer validation process. Two submission paths are available.
              </p>

              <Section icon={Upload} title="Submit a Document" defaultOpen={true} color="blue">
                <p className="text-sm text-gray-600 mb-4">
                  When you click <strong>"Submit Contribution"</strong>, you choose between two paths:
                </p>

                {/* Path 1 — Admin Validation */}
                <div className="border border-gray-300 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0"></div>
                    <h4 className="font-semibold text-gray-800">Path A — Admin Validation</h4>
                    <Highlight color="gray">No wallet needed</Highlight>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    The document is submitted for review by an I4TK administrator. Once approved, an admin publishes it.
                  </p>
                  <div className="space-y-3">
                    <Step number="1" title="Upload PDF" desc="Drag and drop your document — it is stored on IPFS via Pinata." />
                    <Step number="2" title="Fill Metadata" desc="Title, authors, programme, categories, geographic area, references." />
                    <Step number="3" title="AI Auto-Tagging (optional)" desc='Click "Suggest Tags with AI" to identify periodic table elements.' color="purple" />
                    <Step number="4" title='Submit for Admin Validation' desc="Your document enters the admin review queue with status Pending." color="orange" />
                    <Step number="5" title="Admin Review" desc="An admin approves (publishes) or rejects (with reason) your document." color="orange" />
                  </div>
                </div>

                {/* Path 2 — Peer Review */}
                <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50/30">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                    <h4 className="font-semibold text-gray-800">Path B — Peer Review</h4>
                    <Highlight color="blue">Recommended</Highlight>
                    <Highlight>Requires wallet</Highlight>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    The document is recorded on the blockchain and submitted for review by 4 independent validators.
                  </p>
                  <div className="space-y-3">
                    <Step number="1" title="Upload PDF" desc="Drag and drop your document — stored on IPFS via Pinata." />
                    <Step number="2" title="Fill Metadata" desc="Title, authors, programme, categories, geographic area, references." />
                    <Step number="3" title="AI Auto-Tagging (optional)" desc='Click "Suggest Tags with AI" — GPT-4o-mini analysis with confidence scores.' color="purple" />
                    <Step number="4" title="Connect Wallet & Submit" desc="Confirm the transaction in MetaMask — ERC1155 token minted on Sepolia." color="blue" />
                    <Step number="5" title="Peer Review (4 validations)" desc="4 validators must approve before publication. Each vote is on-chain." color="green" />
                  </div>
                  <div className="mt-4 bg-white border border-blue-200 rounded-lg p-3 text-xs">
                    <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" /> AI Auto-Tagging details:
                    </p>
                    <ul className="text-gray-600 space-y-0.5 ml-4">
                      <li>• PDF text extracted from IPFS server-side</li>
                      <li>• Semantic pre-selection with TensorFlow.js</li>
                      <li>• GPT-4o-mini validation with confidence scores</li>
                    </ul>
                    <div className="flex gap-2 mt-2">
                      <Highlight color="green">80%+ High confidence</Highlight>
                      <Highlight color="yellow">60–79% Medium</Highlight>
                    </div>
                  </div>
                </div>
              </Section>

              <Section icon={ClipboardCheck} title="Validate Documents (Peer Review)" color="green">
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    Go to <strong>Network Publications</strong> to see documents pending peer validation.
                    Connect your wallet and click <strong>Validate</strong> on any document you have reviewed.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2 text-sm">Validation progress</h4>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`w-8 h-2 rounded ${i <= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        ))}
                      </div>
                      <span className="text-sm text-green-700">2/4 validations</span>
                    </div>
                    <p className="text-xs text-green-700">
                      4 validations required. Each validation is recorded immutably on-chain. You cannot validate a document you have already validated.
                    </p>
                  </div>
                </div>
              </Section>

              <Section icon={Coins} title="Token Distribution" color="orange">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-orange-800 text-sm mb-3">
                    When a document is published via peer review, <strong>100 million I4TK tokens</strong> are distributed:
                  </p>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">40%</div>
                      <div className="text-xs text-orange-700 mt-0.5">Creator</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">60%</div>
                      <div className="text-xs text-orange-700 mt-0.5">Referenced documents (recursive)</div>
                    </div>
                  </div>
                  <p className="text-xs text-orange-700 mt-3">
                    This creates a token-based incentive aligned with knowledge production — not speculation.
                  </p>
                </div>
              </Section>

              <Section icon={Wallet} title="Don't have a wallet?" color="gray">
                <div className="space-y-3 text-sm">
                  <p className="text-gray-700">
                    A wallet is only required for the Peer Review path. You can always use Admin Validation without one.
                    To use Peer Review, install <strong>MetaMask</strong> and send your wallet address to the I4TK team to be granted on-chain rights.
                  </p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    <Wallet className="w-4 h-4" /> Download MetaMask →
                  </a>
                  <p className="text-gray-600">
                    Then contact:{' '}
                    <a href="mailto:joris.galea@i4tknowledge.net" className="text-blue-600 hover:text-blue-800 underline">
                      joris.galea@i4tknowledge.net
                    </a>
                  </p>
                </div>
              </Section>
            </div>
          )}

          {/* ── Admin Tab ── */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Administrators have full control over users, document validation, blockchain roles, and data export.
              </p>

              <Section icon={Users} title="User Management" defaultOpen={true} color="blue">
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    'View all users with their roles (Observer, Member, Validator, Admin)',
                    'Promote Members to Validators (or downgrade)',
                    'Synchronize roles with the blockchain',
                    'Send email invitations to new members',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section icon={ClipboardCheck} title="Admin Validation Queue" color="orange">
                <div className="space-y-3 text-sm">
                  <p className="text-gray-700">
                    Documents submitted via <strong>Admin Validation</strong> appear in the <strong>Librarian Space</strong> tab of the Library.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { label: "Approve & Publish", desc: "Document is published immediately.", color: "border-green-200 bg-green-50 text-green-800" },
                      { label: "Reject", desc: "Document returned with optional reason.", color: "border-red-200 bg-red-50 text-red-800" },
                      { label: "Promote to Peer Review", desc: "Transfer to blockchain workflow.", color: "border-blue-200 bg-blue-50 text-blue-800" },
                    ].map(({ label, desc, color }) => (
                      <div key={label} className={`border rounded-lg p-3 ${color}`}>
                        <p className="font-medium text-xs mb-1">{label}</p>
                        <p className="text-xs opacity-80">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section icon={Shield} title="Blockchain Roles" color="purple">
                <p className="text-gray-700 text-sm mb-3">Assign on-chain roles via OpenZeppelin AccessControl:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { role: "CONTRIBUTOR_ROLE", desc: "Can submit documents" },
                    { role: "VALIDATOR_ROLE", desc: "Can validate documents" },
                    { role: "MINTER_ROLE", desc: "Can create tokens" },
                    { role: "ADMIN_ROLE", desc: "Full control" },
                  ].map(({ role, desc }) => (
                    <div key={role} className="bg-gray-50 rounded p-2">
                      <span className="font-mono text-xs text-purple-600">{role}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon={Download} title="CSV Export" color="green">
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Full library export — all metadata (Title, Authors, Categories, IPFS CID, Token ID…)</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Heatmap CSV — document coverage by periodic table element</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> UTF-8 encoding with Excel compatibility</li>
                </ul>
              </Section>

              <Section icon={Eye} title="Blockchain Monitoring" color="blue">
                <p className="text-gray-700 text-sm mb-3">View all transactions on Sepolia Etherscan:</p>
                <div className="space-y-2 text-sm overflow-x-auto">
                  <div className="bg-gray-50 rounded p-2 flex flex-wrap items-center gap-2">
                    <span className="font-medium whitespace-nowrap">I4TKnetwork:</span>
                    <code className="text-xs text-gray-600 break-all">0xa987...4F55</code>
                  </div>
                  <div className="bg-gray-50 rounded p-2 flex flex-wrap items-center gap-2">
                    <span className="font-medium whitespace-nowrap">I4TKdocToken:</span>
                    <code className="text-xs text-gray-600 break-all">0x06Fc...5288</code>
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Key Features</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              { icon: Grid3X3, color: "text-green-500", label: "54 Regulatory Elements" },
              { icon: Sparkles, color: "text-purple-500", label: "AI Auto-Tagging" },
              { icon: CheckCircle, color: "text-blue-500", label: "Peer Validation" },
              { icon: Coins, color: "text-orange-500", label: "Token Distribution" },
            ].map(({ icon: Icon, color, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-600">
                <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                <span className="text-xs sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkThrough;
