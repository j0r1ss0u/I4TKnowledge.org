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
  Link2
} from 'lucide-react';

const Section = ({ icon: Icon, title, children, defaultOpen = false, color = "blue" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    green: "bg-green-50 border-green-200 hover:bg-green-100",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    orange: "bg-orange-50 border-orange-200 hover:bg-orange-100"
  };
  
  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600"
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${colorClasses[color]}`}
      >
        <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        <span className="font-semibold text-gray-800 flex-1 text-left text-lg">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 ml-4 pl-6 border-l-2 border-gray-200 space-y-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-5 h-5 text-blue-500" />
      <h4 className="font-medium text-gray-900">{title}</h4>
    </div>
    <div className="text-gray-600 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

const Highlight = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

const WalkThrough = () => {
  const [activeTab, setActiveTab] = useState('member');

  const tabs = [
    { id: 'member', label: 'Member', icon: Users },
    { id: 'validator', label: 'Validator', icon: CheckCircle },
    { id: 'admin', label: 'Administrator', icon: Shield }
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
          <h1 className="text-3xl font-bold mb-2">I4TK Knowledge Network</h1>
          <p className="text-blue-100 text-lg">User Guide</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Member Tab */}
          {activeTab === 'member' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                As a member, you have access to the document library, AI assistant, and research tools.
              </p>

              <Section icon={BookOpen} title="Document Library" defaultOpen={true} color="blue">
                <div className="grid gap-4 md:grid-cols-2">
                  <FeatureCard icon={FileText} title="Browse Documents">
                    View all published documents with full metadata. Use filters by category 
                    (Research Paper, Guideline, Policy Brief, etc.) or search by title and content.
                  </FeatureCard>
                  <FeatureCard icon={Link2} title="Citation Tree">
                    Click any document to see its citation network. 
                    <span className="block mt-1">
                      <Highlight color="green">Green = citing this document</Highlight>
                      {' '}
                      <Highlight>Gray = referenced by this document</Highlight>
                    </span>
                  </FeatureCard>
                </div>
              </Section>

              <Section icon={Bot} title="RAG AI Assistant" color="purple">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    Ask questions in <strong>English or French</strong> and get answers based on library documents.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-800 italic">
                      "What are the main AI regulations in Europe?"
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      The assistant will search the library and provide citations to relevant documents.
                    </p>
                  </div>
                </div>
              </Section>

              <Section icon={Grid3X3} title="Periodic Table of Regulation" color="green">
                <p className="text-gray-700 mb-4">
                  A unique visualization with <strong>54 regulatory elements</strong> organized in <strong>6 categories</strong>:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span>Institutional Framework</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span>Legislating Platforms</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span>Human Rights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span>Content Governance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span>Systemic Risks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span>Pro-social Design</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Click any element to view its description and linked documents.
                </p>
              </Section>

              <Section icon={Route} title="Regulation Pathways" color="orange">
                <p className="text-gray-700">
                  Create custom regulatory pathways by combining multiple periodic table elements.
                  Visualize complete regulatory approaches and share them with collaborators.
                </p>
              </Section>
            </div>
          )}

          {/* Validator Tab */}
          {activeTab === 'validator' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Validators can submit new documents and participate in the peer validation process.
              </p>

              <Section icon={Upload} title="Submit a Document" defaultOpen={true} color="blue">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-medium">Upload PDF</h4>
                      <p className="text-gray-600 text-sm">Drag and drop your document</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-medium">Fill Metadata</h4>
                      <p className="text-gray-600 text-sm">Title, authors, categories, references</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        AI Auto-Tagging
                        <Sparkles className="w-4 h-4 text-purple-500" />
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">
                        Click "Suggest Tags with AI" to automatically identify relevant periodic table elements.
                      </p>
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <p className="font-medium text-gray-700 mb-1">How it works:</p>
                        <ul className="text-gray-600 space-y-1 text-xs">
                          <li>• PDF text extraction from IPFS</li>
                          <li>• Semantic analysis with TensorFlow.js</li>
                          <li>• GPT-4o-mini validation with confidence scores</li>
                        </ul>
                        <div className="flex gap-2 mt-2">
                          <Highlight color="green">80%+ High confidence</Highlight>
                          <Highlight color="yellow">60-79% Medium</Highlight>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">4</div>
                    <div>
                      <h4 className="font-medium">Blockchain Registration</h4>
                      <p className="text-gray-600 text-sm">Document stored on IPFS, ERC1155 token minted on Sepolia</p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section icon={CheckCircle} title="Validate Documents" color="green">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    Navigate to <strong>Network Publications</strong> to see documents pending validation.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Validation Process</h4>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`w-8 h-2 rounded ${i <= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        ))}
                      </div>
                      <span className="text-sm text-green-700">2/4 validations</span>
                    </div>
                    <p className="text-sm text-green-700">
                      4 validations required to publish. Each validation is recorded on the blockchain.
                    </p>
                  </div>
                </div>
              </Section>

              <Section icon={Coins} title="Token Distribution" color="orange">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-orange-800 mb-3">
                    When a document is published, <strong>100 million tokens</strong> are distributed:
                  </p>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">40%</div>
                      <div className="text-xs text-orange-700">Creator</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">60%</div>
                      <div className="text-xs text-orange-700">Referenced documents (recursive)</div>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Administrators have full control over users, blockchain roles, and data export.
              </p>

              <Section icon={Users} title="User Management" defaultOpen={true} color="blue">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    View all users with their roles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Promote Members to Validators
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Synchronize roles with blockchain
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Send email invitations
                  </li>
                </ul>
              </Section>

              <Section icon={Shield} title="Blockchain Roles" color="purple">
                <p className="text-gray-700 mb-3">Assign on-chain roles via OpenZeppelin AccessControl:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded p-2 text-sm">
                    <span className="font-mono text-purple-600">CONTRIBUTOR_ROLE</span>
                    <p className="text-xs text-gray-500">Can submit documents</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-sm">
                    <span className="font-mono text-purple-600">VALIDATOR_ROLE</span>
                    <p className="text-xs text-gray-500">Can validate documents</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-sm">
                    <span className="font-mono text-purple-600">MINTER_ROLE</span>
                    <p className="text-xs text-gray-500">Can create tokens</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-sm">
                    <span className="font-mono text-purple-600">ADMIN_ROLE</span>
                    <p className="text-xs text-gray-500">Full control</p>
                  </div>
                </div>
              </Section>

              <Section icon={Download} title="CSV Export" color="green">
                <p className="text-gray-700 mb-3">
                  Export the entire library to CSV for analysis in Excel or other tools.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• UTF-8 encoding with Excel compatibility</li>
                  <li>• All metadata columns (Title, Authors, Categories, IPFS CID, Token ID...)</li>
                  <li>• Heatmap export with periodic table element coverage</li>
                </ul>
              </Section>

              <Section icon={Eye} title="Blockchain Monitoring" color="orange">
                <p className="text-gray-700 mb-3">
                  View all transactions on Sepolia Etherscan:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <span className="font-medium">I4TKnetwork:</span>
                    <code className="text-xs ml-2 text-gray-600">0xa987...4F55</code>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <span className="font-medium">I4TKdocToken:</span>
                    <code className="text-xs ml-2 text-gray-600">0x06Fc...5288</code>
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Key Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Grid3X3 className="w-4 h-4 text-green-500" />
              <span>54 Regulatory Elements</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI Auto-Tagging</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span>Peer Validation</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Coins className="w-4 h-4 text-orange-500" />
              <span>Token Distribution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkThrough;
