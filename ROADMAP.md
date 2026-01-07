# OpenProposal Roadmap

This document outlines the current state and planned features for OpenProposal.

## Current Status (v1.0)

### Core Features - Complete
- [x] Document builder with drag-and-drop editor
- [x] Real-time collaboration (Liveblocks)
- [x] E-signatures (ESIGN/UETA compliant)
- [x] Template library
- [x] Pricing tables and line items
- [x] Document versioning and history
- [x] Edit-in-place (until first signature)
- [x] Activity timeline and audit trail
- [x] Auto-reminders for pending signatures
- [x] Magic link authentication

### Payments - Complete
- [x] Stripe Connect integration
- [x] Payment collection at signing
- [x] Down payment support
- [x] Net 30/60 terms
- [x] x402 USDC payments on Base
- [x] User wallet configuration for receiving USDC

### Teams & Organizations - Complete
- [x] Multi-seat team accounts
- [x] Role-based access (owner, admin, member)
- [x] Team invitations via email
- [x] Shared templates within organization
- [x] Organization-level Stripe Connect
- [x] Organization-level wallet for USDC
- [x] Storage usage tracking

### Integrations - Complete
- [x] Salesforce CRM sync
- [x] HubSpot CRM sync
- [x] PandaDoc template import
- [x] Webhooks (document events)

### Blockchain - Complete
- [x] Document hash verification
- [x] Base L2 attestation (optional)
- [x] Public verification portal

### SEO & Marketing - Complete
- [x] Custom 404 page
- [x] Dynamic sitemap
- [x] OpenGraph images
- [x] Comparison pages (vs DocuSign, PandaDoc)

---

## Planned Features

### Q1 2025

#### Document Enhancements
- [ ] Document comments and annotations
- [ ] Conditional content blocks (show/hide based on variables)
- [ ] Multi-language support
- [ ] Custom fonts

#### Mobile
- [ ] Mobile-optimized signing experience
- [ ] Mobile document preview
- [ ] Push notifications for document events

#### Analytics
- [ ] Document engagement analytics
- [ ] Time-on-page tracking
- [ ] Conversion funnel metrics

### Q2 2025

#### Advanced Workflows
- [ ] Sequential signing with dependencies
- [ ] Approval workflows (internal review before send)
- [ ] Document expiration and auto-reminders
- [ ] Bulk send with CSV import

#### Integrations
- [ ] Zapier integration
- [ ] Slack notifications
- [ ] Google Drive/Dropbox sync
- [ ] QuickBooks invoice sync

#### AI Features
- [ ] AI-assisted document generation
- [ ] Smart variable extraction
- [ ] Contract analysis and risk scoring

### Q3 2025

#### Enterprise
- [ ] SSO/SAML authentication
- [ ] Custom branding per organization
- [ ] White-label option
- [ ] Dedicated infrastructure

#### Compliance
- [ ] SOC 2 Type II certification
- [ ] HIPAA compliance mode
- [ ] GDPR data export tools
- [ ] Retention policies

### Future Considerations

#### Not Planned (Use Existing Tools)
- ❌ AI writing assistant (use Claude/ChatGPT)
- ❌ Notarization (partner integrations instead)
- ❌ CRM features (use Salesforce/HubSpot)

#### Under Consideration
- ⏳ Video signatures
- ⏳ In-person signing mode
- ⏳ Document comparison/redlining
- ⏳ Native mobile apps

---

## Feature Requests

Have a feature request? Open an issue on GitHub or reach out:
- GitHub Issues: [github.com/openproposal/openproposal/issues](https://github.com/openproposal/openproposal/issues)
- Email: feedback@sendprop.com
- Twitter: [@openproposal](https://twitter.com/openproposal)

---

## Changelog

### January 2025
- Added x402 USDC payment support
- Users can configure wallets to receive USDC directly
- Added blockchain verification on Base L2
- Added Salesforce and HubSpot integrations
- Added PandaDoc import tool
- Added teams and organizations
- Added document version history
- Added activity timeline
- Added edit-in-place functionality
- Added auto-reminders via cron

### December 2024
- Initial release
- Document builder
- E-signatures
- Stripe payments
- Template library
