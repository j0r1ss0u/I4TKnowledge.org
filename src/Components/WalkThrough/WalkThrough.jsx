import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import ui from '../../translations/ui';
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

const periodicTableColors = [
  "bg-green-500",
  "bg-green-500",
  "bg-red-500",
  "bg-blue-500",
  "bg-blue-500",
  "bg-blue-500",
];

const footerIcons = [Grid3X3, Sparkles, CheckCircle, Coins];
const footerIconColors = ["text-green-500", "text-purple-500", "text-blue-500", "text-orange-500"];

const WalkThrough = () => {
  const { user, language } = useAuth();
  const g = (ui[language] ?? ui.en).guide;

  const roleToTab = {
    admin: 'admin',
    validator: 'validator',
    member: 'member',
    observer: 'observer'
  };
  const defaultTab = roleToTab[user?.role] || 'member';

  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: 'observer',  label: g.tabs.observer,  icon: Eye },
    { id: 'member',    label: g.tabs.member,    icon: Users },
    { id: 'validator', label: g.tabs.validator, icon: CheckCircle },
    { id: 'admin',     label: g.tabs.admin,     icon: Shield }
  ];

  return (
    <div className="container mx-auto max-w-4xl px-3 sm:px-4 py-6 sm:py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{g.appName}</h1>
          <p className="text-blue-100 text-base sm:text-lg">{g.subtitle}</p>
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
                {g.observer.intro}
              </p>

              <Section icon={BookOpen} title={g.observer.library} defaultOpen={true} color="blue">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FeatureCard icon={FileText} title={g.observer.libBrowseTitle}>
                    {g.observer.libBrowseDesc}
                  </FeatureCard>
                  <FeatureCard icon={Link2} title={g.observer.libCitationTitle} color="blue">
                    {g.observer.libCitationDesc}
                    <span className="block mt-2 space-x-1">
                      <Highlight color="green">{g.observer.libCitationGreen}</Highlight>
                      {' '}
                      <Highlight>{g.observer.libCitationGray}</Highlight>
                    </span>
                  </FeatureCard>
                </div>
              </Section>

              <Section icon={Bot} title={g.observer.ai} color="purple">
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    {g.observer.aiDesc}
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-800 italic">{g.observer.aiExample}</p>
                    <p className="text-xs text-purple-600 mt-2">
                      {g.observer.aiNote}
                    </p>
                  </div>
                </div>
              </Section>

              <Section icon={Grid3X3} title={g.observer.periodicTable} color="green">
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    {g.observer.periodicTableDesc}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {g.periodicTableCats.map((label, i) => (
                      <div key={label} className="flex items-center gap-2 text-xs">
                        <div className={`w-3 h-3 rounded flex-shrink-0 ${periodicTableColors[i]}`}></div>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section icon={Route} title={g.observer.pathways} color="orange">
                <p className="text-gray-700 text-sm">
                  {g.observer.pathwaysDesc}
                </p>
              </Section>

              <Section icon={ArrowUpCircle} title={g.observer.joinTitle} color="green">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-green-800">
                    {g.observer.joinDesc}
                  </p>
                  <a
                    href="mailto:joris.galea@i4tknowledge.net"
                    className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-900 underline"
                  >
                    <MessageCircle className="w-4 h-4" />
                    joris.galea@i4tknowledge.net
                  </a>
                </div>
              </Section>
            </div>
          )}

          {/* ── Member Tab ── */}
          {activeTab === 'member' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                {g.member.intro}
              </p>

              <Section icon={BookOpen} title={g.member.library} defaultOpen={true} color="blue">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FeatureCard icon={FileText} title={g.member.libBrowseTitle}>
                    {g.member.libBrowseDesc}
                  </FeatureCard>
                  <FeatureCard icon={Link2} title={g.member.libCitationTitle}>
                    {g.member.libCitationDesc}
                    <span className="block mt-2 space-x-1">
                      <Highlight color="green">{g.member.libCitationGreen}</Highlight>
                      {' '}
                      <Highlight>{g.member.libCitationGray}</Highlight>
                    </span>
                  </FeatureCard>
                </div>
              </Section>

              <Section icon={Bot} title={g.member.ai} color="purple">
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    {g.member.aiDesc}
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-800 italic">
                      {g.member.aiExample}
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      {g.member.aiNote}
                    </p>
                  </div>
                </div>
              </Section>

              <Section icon={Grid3X3} title={g.member.periodicTable} color="green">
                <p className="text-gray-700 text-sm mb-3">
                  {g.member.periodicTableDesc}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {g.periodicTableCats.map((label, i) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <div className={`w-3 h-3 rounded flex-shrink-0 ${periodicTableColors[i]}`}></div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {g.member.periodicTableClick}
                </p>
              </Section>

              <Section icon={Route} title={g.member.pathways} color="orange">
                <p className="text-gray-700 text-sm">
                  {g.member.pathwaysDesc}
                </p>
              </Section>
            </div>
          )}

          {/* ── Validator Tab ── */}
          {activeTab === 'validator' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                {g.validator.intro}
              </p>

              <Section icon={Upload} title={g.validator.submitDoc} defaultOpen={true} color="blue">
                <p className="text-sm text-gray-600 mb-4">
                  {g.validator.submitChoose}
                </p>

                {/* Path 1 — Admin Validation */}
                <div className="border border-gray-300 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0"></div>
                    <h4 className="font-semibold text-gray-800">{g.validator.pathATitle}</h4>
                    <Highlight color="gray">{g.validator.pathANoWallet}</Highlight>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {g.validator.pathADesc}
                  </p>
                  <div className="space-y-3">
                    <Step number="1" title={g.validator.step1Title} desc={g.validator.step1Desc} />
                    <Step number="2" title={g.validator.step2Title} desc={g.validator.step2Desc} />
                    <Step number="3" title={g.validator.step3Title} desc={g.validator.step3DescA} color="purple" />
                    <Step number="4" title={g.validator.step4ATitle} desc={g.validator.step4ADesc} color="orange" />
                    <Step number="5" title={g.validator.step5ATitle} desc={g.validator.step5ADesc} color="orange" />
                  </div>
                </div>

                {/* Path 2 — Peer Review */}
                <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50/30">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                    <h4 className="font-semibold text-gray-800">{g.validator.pathBTitle}</h4>
                    <Highlight color="blue">{g.validator.pathBRecommended}</Highlight>
                    <Highlight>{g.validator.pathBWallet}</Highlight>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {g.validator.pathBDesc}
                  </p>
                  <div className="space-y-3">
                    <Step number="1" title={g.validator.step1Title} desc={g.validator.step1Desc} />
                    <Step number="2" title={g.validator.step2Title} desc={g.validator.step2Desc} />
                    <Step number="3" title={g.validator.step3Title} desc={g.validator.step3DescB} color="purple" />
                    <Step number="4" title={g.validator.step4BTitle} desc={g.validator.step4BDesc} color="blue" />
                    <Step number="5" title={g.validator.step5BTitle} desc={g.validator.step5BDesc} color="green" />
                  </div>
                  <div className="mt-4 bg-white border border-blue-200 rounded-lg p-3 text-xs">
                    <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" /> {g.validator.aiTagDetails}
                    </p>
                    <ul className="text-gray-600 space-y-0.5 ml-4">
                      <li>• {g.validator.aiTagItem1}</li>
                      <li>• {g.validator.aiTagItem2}</li>
                      <li>• {g.validator.aiTagItem3}</li>
                    </ul>
                    <div className="flex gap-2 mt-2">
                      <Highlight color="green">{g.validator.aiTagHigh}</Highlight>
                      <Highlight color="yellow">{g.validator.aiTagMedium}</Highlight>
                    </div>
                  </div>
                </div>
              </Section>

              <Section icon={ClipboardCheck} title={g.validator.validate} color="green">
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    {g.validator.validateDesc}
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2 text-sm">{g.validator.validationProgress}</h4>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`w-8 h-2 rounded ${i <= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        ))}
                      </div>
                      <span className="text-sm text-green-700">2/4 {g.validator.validationOf}</span>
                    </div>
                    <p className="text-xs text-green-700">
                      {g.validator.validationNote}
                    </p>
                  </div>
                </div>
              </Section>

              <Section icon={Coins} title={g.validator.tokens} color="orange">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-orange-800 text-sm mb-3">
                    {g.validator.tokensDesc}
                  </p>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">40%</div>
                      <div className="text-xs text-orange-700 mt-0.5">{g.validator.tokensCreator}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">60%</div>
                      <div className="text-xs text-orange-700 mt-0.5">{g.validator.tokensRefs}</div>
                    </div>
                  </div>
                  <p className="text-xs text-orange-700 mt-3">
                    {g.validator.tokensNote}
                  </p>
                </div>
              </Section>

              <Section icon={Wallet} title={g.validator.walletTitle} color="gray">
                <div className="space-y-3 text-sm">
                  <p className="text-gray-700">
                    {g.validator.walletDesc}
                  </p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    <Wallet className="w-4 h-4" /> {g.validator.walletDownload}
                  </a>
                  <p className="text-gray-600">
                    {g.validator.walletContact}{' '}
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
                {g.admin.intro}
              </p>

              <Section icon={Users} title={g.admin.userMgmt} defaultOpen={true} color="blue">
                <ul className="space-y-2 text-sm text-gray-700">
                  {g.admin.userMgmtItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section icon={ClipboardCheck} title={g.admin.validationQueue} color="orange">
                <div className="space-y-3 text-sm">
                  <p className="text-gray-700">
                    {g.admin.validationQueueDesc}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { label: g.admin.approve, desc: g.admin.approveDesc, color: "border-green-200 bg-green-50 text-green-800" },
                      { label: g.admin.reject,  desc: g.admin.rejectDesc,  color: "border-red-200 bg-red-50 text-red-800" },
                      { label: g.admin.promote, desc: g.admin.promoteDesc, color: "border-blue-200 bg-blue-50 text-blue-800" },
                    ].map(({ label, desc, color }) => (
                      <div key={label} className={`border rounded-lg p-3 ${color}`}>
                        <p className="font-medium text-xs mb-1">{label}</p>
                        <p className="text-xs opacity-80">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section icon={Shield} title={g.admin.blockchainRoles} color="purple">
                <p className="text-gray-700 text-sm mb-3">{g.admin.blockchainRolesDesc}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { role: "CONTRIBUTOR_ROLE", desc: g.admin.roles.contributor },
                    { role: "VALIDATOR_ROLE",   desc: g.admin.roles.validator },
                    { role: "MINTER_ROLE",      desc: g.admin.roles.minter },
                    { role: "ADMIN_ROLE",        desc: g.admin.roles.admin },
                  ].map(({ role, desc }) => (
                    <div key={role} className="bg-gray-50 rounded p-2">
                      <span className="font-mono text-xs text-purple-600">{role}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon={Download} title={g.admin.csvExport} color="green">
                <ul className="text-sm text-gray-600 space-y-1">
                  {g.admin.csvItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section icon={Eye} title={g.admin.monitoring} color="blue">
                <p className="text-gray-700 text-sm mb-3">{g.admin.monitoringDesc}</p>
                <div className="space-y-2 text-sm overflow-x-auto">
                  <div className="bg-gray-50 rounded p-2 flex flex-wrap items-center gap-2">
                    <span className="font-medium whitespace-nowrap">{g.admin.networkLabel}</span>
                    <code className="text-xs text-gray-600 break-all">0xa987...4F55</code>
                  </div>
                  <div className="bg-gray-50 rounded p-2 flex flex-wrap items-center gap-2">
                    <span className="font-medium whitespace-nowrap">{g.admin.tokenLabel}</span>
                    <code className="text-xs text-gray-600 break-all">0x06Fc...5288</code>
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">{g.footerKeyFeatures}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {g.footerFeatures.map((label, i) => (
              <div key={label} className="flex items-center gap-2 text-gray-600">
                {React.createElement(footerIcons[i], { className: `w-4 h-4 flex-shrink-0 ${footerIconColors[i]}` })}
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
