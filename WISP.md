# Zerofi Written Information Security Program (WISP)
**Version 1.0 | Effective June 9, 2026**  
**Required by: GLBA Safeguards Rule (16 CFR Part 314)**

---

## 1. Program Overview

Zerofi maintains this Written Information Security Program (WISP) to protect the security and confidentiality of customer nonpublic personal financial information (NPI) in compliance with the Gramm-Leach-Bliley Act Safeguards Rule.

**Information Security Officer:** Zerofi Founder/CEO  
**Contact:** security@getzerofi.com  
**Review Frequency:** Annual (or upon material change)  
**Last Updated:** June 9, 2026  
**Next Review:** June 9, 2027  

---

## 2. Scope

This WISP applies to all NPI collected, processed, or stored by Zerofi, including:

- Account balances and financial account information
- Income and expense data
- Debt and credit information
- Tax-related information
- Investment and savings data
- Any other nonpublic personal financial information

---

## 3. Risk Assessment

Zerofi conducts an annual risk assessment covering:

| Risk Area | Current Control | Risk Level |
|-----------|----------------|------------|
| Unauthorized data access | Supabase RLS + JWT auth | Low |
| Data interception in transit | TLS 1.3 (Vercel enforced) | Low |
| Data breach at rest | AES-256-GCM encryption | Low |
| Insider threat | Single operator; limited access | Low |
| Third-party vendor breach | SOC 2 certified vendors only | Low |
| Phishing/credential theft | Strong password policy + MFA available | Medium |
| Application vulnerabilities | Dependency audits; secure coding | Medium |

---

## 4. Technical Safeguards

### 4.1 Encryption
- **At rest:** All NPI encrypted using AES-256-GCM via Web Crypto API before storage
- **Key derivation:** PBKDF2 with 100,000 iterations and unique per-device salt
- **In transit:** TLS 1.3 enforced by Vercel on all connections
- **Implementation:** `src/utils/encrypt.js`

### 4.2 Access Controls
- **Authentication:** Supabase Auth (email/password + Google/Apple OAuth)
- **Session management:** JWT tokens with automatic refresh
- **Data isolation:** Row Level Security in PostgreSQL — users can only access their own rows
- **Implementation:** `supabase-setup.sql`, `src/hooks/useAuth.js`

### 4.3 Beta Access Control
- Invite-only access via validated beta codes
- No public registration during beta phase
- **Implementation:** `src/utils/betaCode.js`, `src/pages/BetaGate.jsx`

### 4.4 Password Security
- Minimum 8 characters enforced
- Passwords hashed by Supabase Auth (bcrypt)
- Plain-text passwords never stored or logged

---

## 5. Administrative Safeguards

### 5.1 Employee/Personnel
- Currently single-operator company
- All personnel with system access must review and acknowledge this WISP
- Background checks required before granting system access to any future employees
- Access revoked immediately upon separation

### 5.2 Vendor Management
Vendors with access to NPI or systems processing NPI:

| Vendor | Role | Certification | DPA |
|--------|------|--------------|-----|
| Supabase | Database + Auth | SOC 2 Type II, ISO 27001 | ✓ |
| Vercel | Hosting + CDN | SOC 2 Type II | ✓ |

New vendors requiring NPI access must complete vendor assessment before onboarding.

### 5.3 Incident Response
See `src/compliance/glba.js` INCIDENT_RESPONSE for full procedure.

**Key contacts:**
- Security incidents: security@getzerofi.com
- User data requests: privacy@getzerofi.com
- Legal/regulatory: legal@getzerofi.com

---

## 6. Physical Safeguards

Zerofi operates as a cloud-native company with no physical servers or on-premises data storage. All physical security is delegated to SOC 2 certified cloud providers (Supabase/AWS, Vercel).

Development work conducted on password-protected devices with full-disk encryption enabled.

---

## 7. User Rights & Data Deletion

Per CCPA requirements, users may:

- **Request their data:** Submit to privacy@getzerofi.com. Response within 45 days.
- **Delete their account:** Settings > Account > Delete Account in-app, or email request. Completed within 30 days.
- **Correct their data:** All financial data is user-editable by design.
- **Opt out of data sale:** Zerofi does not sell data. Right automatically satisfied.

---

## 8. Security Awareness

Until Zerofi has employees, security awareness is maintained through:
- Founder review of this WISP annually
- Subscription to CISA security advisories
- Dependency vulnerability alerts via GitHub Dependabot
- Regular review of Supabase and Vercel security advisories

Upon hiring first employee:
- Security awareness training required within 30 days of hire
- Annual refresher training required
- Training completion documented

---

## 9. Program Review and Updates

This WISP is reviewed:
- Annually (every June)
- After any security incident
- After any material change to systems, personnel, or business operations
- After any change to applicable law or regulation

Updates are version-controlled in GitHub and effective date updated accordingly.

---

## 10. SOC 2 Roadmap

| Milestone | Target | Status |
|-----------|--------|--------|
| SOC 2 Type I assessment | Q4 2026 | Planned |
| SOC 2 Type II audit begins | Q1 2027 | Planned |
| SOC 2 Type II report | Q2 2027 | Planned |
| Recommended auditor | Prescient Assurance / Drata / Vanta | Evaluating |

---

## 11. Full Compliance Framework

Zerofi maintains compliance documentation for the following laws and frameworks. All are implemented in `src/compliance/`:

| File | Framework | Status |
|------|-----------|--------|
| `glba.js` | GLBA Safeguards Rule | Implemented |
| `ccpa.js` | CCPA / CPRA | Implemented |
| `soc2.js` | SOC 2 Type I/II | In progress |
| `canspam.js` | CAN-SPAM Act | Implemented |
| `multiStatePrivacy.js` | 20-state privacy laws | Implemented |
| `ftcCompliance.js` | FTC Section 5 / UDAP | Implemented |
| `accessibilityCompliance.js` | ADA / WCAG 2.1 AA | In progress |
| `consentLogger.js` | Consent records (all laws) | Implemented |
| `WISP.md` | This document | Active |

**Compliance dashboard** available at `/compliance` route (admin only).

**Next attorney review should cover:**
1. Texas TDPSA confirmation
2. DPIA for Nova AI recommendations engine
3. CAN-SPAM physical address (pending LLC formation)
4. App Store compliance when mobile app is submitted

---

*This document is confidential and proprietary to Zerofi. Unauthorized disclosure is prohibited.*
