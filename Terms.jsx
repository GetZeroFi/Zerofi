// ── Zerofi Terms of Service & Integrity Agreement ────────────────────────────
import { useState } from 'react';

const T = {
  bg: '#080c14', surface: '#0f172a', card: '#131e35',
  border: '#1e2d47', text: '#e8f0fe', muted: '#5a7094', faint: '#2a3d5a',
  accent: '#3b82f6', green: '#10b981', red: '#ef4444', amber: '#f59e0b',
  nova: '#a78bfa', novaGrad: 'linear-gradient(135deg,#6d28d9,#a78bfa)',
};

const EFFECTIVE_DATE = 'June 9, 2026';
const COMPANY        = 'Zerofi';
const CONTACT_EMAIL  = 'legal@getzerofi.com';

// ── Section component ────────────────────────────────────────────────────────
function Section({ number, title, children, highlight = false }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: T.accent, fontWeight: 700, minWidth: 28 }}>{number}.</span>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: highlight ? T.amber : T.text, fontFamily: "'Fraunces',serif" }}>{title}</h3>
      </div>
      <div style={{ paddingLeft: 38, fontSize: 13, color: '#94a3b8', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

function P({ children }) {
  return <p style={{ marginBottom: 10 }}>{children}</p>;
}

function Highlight({ children }) {
  return (
    <div style={{ background: `${T.amber}11`, border: `1px solid ${T.amber}44`, borderRadius: 8, padding: '12px 14px', marginBottom: 12, fontSize: 13, color: T.amber, lineHeight: 1.65 }}>
      {children}
    </div>
  );
}

function Bold({ children }) {
  return <strong style={{ color: T.text, fontWeight: 600 }}>{children}</strong>;
}

// ── Full Terms page ───────────────────────────────────────────────────────────
export function TermsPage({ onBack }) {
  const [tab, setTab] = useState('terms');

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18, padding: '4px 8px' }}>←</button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text, letterSpacing: '-0.02em' }}>
            Zero<span style={{ color: T.accent }}>fi</span>
            <span style={{ fontSize: 13, fontWeight: 400, color: T.muted, marginLeft: 10, fontFamily: "'DM Mono',monospace" }}>Legal</span>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 20px', display: 'flex', gap: 0 }}>
        {[['terms', 'Terms of Service'], ['privacy', 'Privacy Policy']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '12px 18px', background: 'none', border: 'none', borderBottom: tab === key ? `2px solid ${T.accent}` : '2px solid transparent', color: tab === key ? T.text : T.muted, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>
        {tab === 'terms' ? <TermsContent /> : <PrivacyContent />}
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text, marginBottom: 6 }}>Terms of Service</h1>
        <p style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Mono',monospace" }}>Effective: {EFFECTIVE_DATE} · {COMPANY}</p>
      </div>

      <div style={{ background: `${T.accent}11`, border: `1px solid ${T.accent}44`, borderRadius: 10, padding: '14px 16px', marginBottom: 28, fontSize: 13, color: '#93c5fd', lineHeight: 1.65 }}>
        Please read these Terms carefully before using Zerofi. By creating an account or using any part of the platform, you agree to be bound by these Terms, including the Beta Agreement and Integrity Clause in Sections 3 and 4.
      </div>

      <Section number="1" title="Acceptance of Terms">
        <P>These Terms of Service ("Terms") govern your access to and use of the Zerofi platform, including all related software, services, features, and content (collectively, the "Service"), operated by Zerofi ("we," "us," or "our").</P>
        <P>By accessing or using the Service — including by completing account registration, clicking "I Agree," or using the platform in any way — you represent that you are at least 18 years of age and agree to be bound by these Terms in their entirety.</P>
        <P>If you do not agree to these Terms, do not access or use the Service.</P>
      </Section>

      <Section number="2" title="Description of Service">
        <P>Zerofi is a personal financial management platform powered by Nova, an AI-based financial advisor. The Service provides tools for income tracking, budgeting, debt management, investment tracking, tax estimation, goal setting, and financial coaching for gig workers, individuals, families, and businesses.</P>
        <P><Bold>Important:</Bold> Zerofi is a financial management and coaching tool, not a licensed financial advisor, broker, bank, or investment advisor. Nothing in the Service constitutes financial, legal, tax, or investment advice. All information and recommendations are provided for educational and informational purposes only. You should consult a qualified professional before making any financial decisions.</P>
      </Section>

      <Section number="3" title="Beta Program Agreement" highlight>
        <Highlight>
          ⚠️ BETA SOFTWARE NOTICE — READ CAREFULLY
        </Highlight>
        <P>The Service is currently in <Bold>private beta</Bold>. Access is granted by invitation only. By using the Service, you acknowledge and agree to all of the following:</P>
        <P><Bold>(a) Beta Status.</Bold> The Service is pre-release software. It may contain bugs, errors, incomplete features, and unexpected behavior. Zerofi makes no warranty that the Service will be error-free, uninterrupted, or that data will not be lost.</P>
        <P><Bold>(b) Invitation-Only Access.</Bold> Your beta access is personal, non-transferable, and non-sublicensable. You may not share your login credentials or invite code with any other person or entity. Unauthorized sharing of access is grounds for immediate termination.</P>
        <P><Bold>(c) Feedback.</Bold> You agree that any feedback, suggestions, or ideas you provide regarding the Service may be used by Zerofi without compensation, attribution, or restriction.</P>
        <P><Bold>(d) Changes.</Bold> Zerofi reserves the right to modify, suspend, or terminate the beta program — or any user's access to it — at any time and without notice.</P>
        <P><Bold>(e) Confidentiality.</Bold> The Service, including all features, design, technology, and data structures, is confidential proprietary information. You agree not to disclose details of the Service to any third party without prior written consent from Zerofi.</P>
      </Section>

      <Section number="4" title="Integrity & Proprietary Systems Clause" highlight>
        <Highlight>
          🔒 BINDING INTEGRITY AGREEMENT — BY CREATING AN ACCOUNT YOU EXPRESSLY AGREE TO THIS CLAUSE
        </Highlight>
        <P><Bold>(a) Proprietary System.</Bold> The Zerofi platform — including but not limited to its codebase, database architecture, data models, AI advisor logic, Nova's recommendation engine, user interface design, algorithms, and all associated intellectual property — is the exclusive proprietary property of Zerofi. All rights reserved.</P>
        <P><Bold>(b) Prohibited Conduct.</Bold> You expressly agree that you will NOT, under any circumstances:</P>
        <div style={{ paddingLeft: 16, marginBottom: 10 }}>
          {[
            "Attempt to access, copy, extract, scrape, reverse-engineer, or decompile any part of the Service's source code, database, or underlying systems;",
            "Attempt to gain unauthorized access to any user's data, our servers, databases, or any connected systems;",
            "Use automated tools, bots, crawlers, or scripts to access or interact with the Service;",
            "Share, reproduce, or distribute any proprietary features, designs, or system architecture with any third party;",
            "Attempt to derive trade secrets or confidential information from the Service;",
            "Use data obtained from Zerofi to build, assist in building, or improve any competing product or service;",
            "Attempt to circumvent any security, authentication, or access control mechanism within the Service.",
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              <span style={{ color: T.red, flexShrink: 0, marginTop: 2 }}>✗</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <P><Bold>(c) Honesty & Data Integrity.</Bold> You agree to use the Service honestly and in good faith. You will not input false, misleading, or malicious data with the intent to manipulate, test vulnerabilities, or interfere with the Service's operation or other users' experience.</P>
        <P><Bold>(d) No Competitive Use.</Bold> During your use of the Service and for a period of two (2) years thereafter, you agree not to use any knowledge gained from your access to Zerofi's proprietary systems to build, advise, or contribute to a substantially similar competing product.</P>
        <P><Bold>(e) Acknowledgment.</Bold> You acknowledge that violation of this clause would cause irreparable harm to Zerofi for which monetary damages would be inadequate, and that Zerofi shall be entitled to seek injunctive relief and other equitable remedies in addition to any other rights and remedies available at law.</P>
        <P><Bold>(f) Reporting.</Bold> If you become aware of any security vulnerability, breach, or unauthorized access, you agree to report it promptly to <span style={{ color: T.accent }}>{CONTACT_EMAIL}</span> rather than exploiting or disclosing it publicly.</P>
      </Section>

      <Section number="5" title="Account Registration & Security">
        <P><Bold>Age Requirement.</Bold> You must be at least 18 years of age to create a Zerofi account. By creating an account, you confirm that you are 18 or older. In compliance with the Children's Online Privacy Protection Act (COPPA) and applicable state age verification laws, Zerofi does not knowingly collect personal information from children under 13. If we become aware that a user is under 13, we will immediately terminate their account and delete all associated data. Users between 13 and 17 may only use Zerofi with verified parental consent.</P>
        <P>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at {CONTACT_EMAIL} if you suspect unauthorized access to your account.</P>
        <P>Your financial data is encrypted end-to-end using AES-256-GCM before storage. However, you are responsible for maintaining a strong password and protecting your account access.</P>
        <P>You may not create accounts for others or use another person's account without their explicit permission.</P>
      </Section>

      <Section number="6" title="Financial Data & Privacy">
        <P>You voluntarily provide financial information to Zerofi to enable the Service's features. You represent that you have the right to input all data you provide.</P>
        <P>Zerofi does <Bold>not</Bold> sell your financial data to any third party. See our Privacy Policy for full details on how your data is collected, used, and protected.</P>
      </Section>

      <Section number="7" title="No Financial Advice">
        <P>Nova, Zerofi's AI advisor, provides general financial information and coaching based on data you provide. <Bold>This is not professional financial advice.</Bold> Zerofi is not a registered investment advisor, broker-dealer, financial planner, or tax advisor.</P>
        <P>All content provided through Nova and the Service is for informational and educational purposes only. You should consult qualified financial, tax, and legal professionals before making financial decisions.</P>
        <P>Zerofi accepts no liability for any financial decisions made in reliance on information provided by the Service.</P>
      </Section>

      <Section number="8" title="Intellectual Property">
        <P>All content, features, design, and technology of the Service — including the Zerofi name, Nova AI advisor, source code, database architecture, and all associated materials — are protected by copyright, trademark, and other intellectual property laws.</P>
        <P>You are granted a limited, non-exclusive, non-transferable license to use the Service for your personal financial management purposes only. No rights are transferred to you beyond this limited use license.</P>
      </Section>

      <Section number="9" title="Limitation of Liability">
        <P>To the maximum extent permitted by law, Zerofi shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of income, or financial losses arising from your use of the Service.</P>
        <P>The Service is provided "as is" during beta. Zerofi makes no warranties, express or implied, regarding the accuracy, completeness, or fitness of the Service for any particular purpose.</P>
      </Section>

      <Section number="10" title="Termination">
        <P>Zerofi reserves the right to suspend or terminate your account at any time, with or without cause, and with or without notice. Grounds for immediate termination include but are not limited to: violation of the Integrity Clause, unauthorized access attempts, sharing of beta access, or any conduct that Zerofi determines is harmful to the platform or its users.</P>
      </Section>

      <Section number="11" title="Governing Law">
        <P>These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts of Tarrant County, Texas.</P>
      </Section>

      <Section number="12" title="Contact">
        <P>For questions about these Terms, contact us at: <span style={{ color: T.accent }}>{CONTACT_EMAIL}</span></P>
        <P>For security concerns or vulnerability reports: <span style={{ color: T.accent }}>security@getzerofi.com</span></P>
      </Section>

      <div style={{ marginTop: 32, padding: '16px 18px', background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12, color: T.muted, lineHeight: 1.7 }}>
        By creating a Zerofi account, you confirm that you have read, understood, and agree to these Terms of Service in full — including the Beta Program Agreement (Section 3) and the Integrity & Proprietary Systems Clause (Section 4).
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text, marginBottom: 6 }}>Privacy Policy</h1>
        <p style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Mono',monospace" }}>Effective: {EFFECTIVE_DATE} · {COMPANY}</p>
      </div>

      <Section number="1" title="What We Collect">
        <P><Bold>Account information:</Bold> Name and email address provided during registration.</P>
        <P><Bold>Financial data:</Bold> Account balances, income, debt, expenses, goals, and other financial information you voluntarily enter. This data is encrypted on your device before being stored.</P>
        <P><Bold>Usage data:</Bold> Basic app usage patterns to improve the Service (features used, error logs). We do not track individual financial interactions for advertising purposes.</P>
      </Section>

      <Section number="2" title="How We Use Your Data">
        {[
          "To provide and improve the Zerofi platform and Nova's recommendations",
          "To authenticate your account and maintain session security",
          "To send important service notifications (security alerts, terms updates)",
          "To generate anonymous, aggregated insights for product improvement",
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{ color: T.green, flexShrink: 0 }}>✓</span>
            <span>{item}</span>
          </div>
        ))}
        <Highlight>
          We do NOT sell your data. We do NOT use your financial data for advertising. We do NOT share your personal financial information with third parties except as required by law.
        </Highlight>
      </Section>

      <Section number="3" title="Data Security">
        <P>Your financial data is encrypted using AES-256-GCM encryption on your device before transmission. Your password is hashed and never stored in plain text. Even Zerofi employees cannot read your encrypted financial data.</P>
        <P>Data is stored in Supabase (US-based) with row-level security ensuring each user can only access their own data.</P>
      </Section>

      <Section number="4" title="Data Retention">
        <P>Your data is retained as long as your account is active. You may request deletion of your account and all associated data at any time by contacting {CONTACT_EMAIL}. We will process deletion requests within 30 days.</P>
      </Section>

      <Section number="5" title="Your Rights">
        <P>You have the right to access, correct, export, or delete your personal data at any time. Contact us at {CONTACT_EMAIL} to exercise these rights.</P>
      </Section>

      <Section number="6" title="Contact">
        <P>Privacy questions: <span style={{ color: T.accent }}>{CONTACT_EMAIL}</span></P>
      </Section>
    </div>
  );
}

export default TermsPage;
