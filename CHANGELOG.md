# Changelog

All notable changes to OpenProposal will be documented in this file.

## [Unreleased]

## [1.2.0] - 2025-01-07

### Added
- **x402 USDC Payments**: Accept stablecoin payments on Base network
  - Users can configure their wallet address to receive payments directly
  - Support for both individual and team wallets
  - Automatic payment verification via x402 facilitator
- **Blockchain Verification**: Optional on-chain document attestation
  - SHA-256 document hashing
  - Base L2 attestation for immutable proof
  - Public verification portal at `/documents/[id]/verify`
- **SEO Improvements**
  - Custom 404 page with navigation
  - Dynamic sitemap generation
  - OpenGraph and Twitter card images
  - JSON-LD structured data
- **Comparison Pages**: Marketing pages comparing to competitors
  - `/compare/docusign`
  - `/compare/pandadoc`

### Changed
- Updated pricing page with accurate plan features
- Improved wallet settings UI in integrations tab

## [1.1.0] - 2025-01-01

### Added
- **Teams & Organizations**
  - Multi-seat team accounts with role-based access
  - Owner, admin, and member roles
  - Team invitations via email with expiration
  - Organization-level Stripe Connect
  - Shared templates within teams
  - Storage usage tracking per organization
- **CRM Integrations**
  - Salesforce integration (contacts, opportunities)
  - HubSpot integration (contacts, deals)
  - OAuth connection flow for both platforms
- **PandaDoc Import**
  - Import templates directly from PandaDoc
  - Preserves content blocks and variables
  - API key-based authentication
- **Document Features**
  - Edit-in-place until first signature
  - Activity timeline showing all events
  - Version history with diff viewer
  - Auto-reminders via cron job

### Changed
- Moved from user-level to organization-level billing
- Updated document editor with better formatting tools

## [1.0.0] - 2024-12-15

### Added
- **Document Builder**
  - Drag-and-drop visual editor
  - Text, image, and table blocks
  - Signature and initial fields
  - Pricing tables with calculations
- **E-Signatures**
  - ESIGN/UETA compliant signatures
  - Multiple signers support
  - Signing order (sequential/parallel)
  - Email notifications
- **Templates**
  - Create templates from documents
  - Variable fields with merge tags
  - Template categories
- **Payments**
  - Stripe Connect integration
  - Payment collection at signing
  - Down payment support
  - Net 30/60 terms
- **Authentication**
  - Magic link authentication via email
  - Session management
- **Real-time Collaboration**
  - Liveblocks integration
  - Multiple users editing simultaneously
  - Presence indicators

### Infrastructure
- Next.js 16 with App Router
- PostgreSQL with Drizzle ORM
- Neon serverless database
- Vercel deployment
- Resend for transactional emails

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 1.2.0 | 2025-01-07 | x402 USDC payments, blockchain verification |
| 1.1.0 | 2025-01-01 | Teams, CRM integrations, PandaDoc import |
| 1.0.0 | 2024-12-15 | Initial release |
