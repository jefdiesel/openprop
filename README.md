# OpenProposal

Open-source proposal and document signing platform. A modern PandaDoc/DocuSign alternative.

**Live at [sendprop.com](https://sendprop.com)**

## Why OpenProposal?

PandaDoc charges $35/seat/month. DocuSign starts at $25/user/month. A 10-person team pays $250-350/month just to send proposals.

**OpenProposal: $29/month for 10 users.** Or self-host for free.

## Features

### Document Creation
- **Drag-and-drop builder** - Visual editor with text, images, tables, signatures
- **Real-time collaboration** - Google Docs-style editing with multiple users
- **Template library** - Create and reuse document templates
- **Pricing tables** - Built-in quote and invoice line items
- **Edit until signed** - Make changes until the first signature (no delete/re-upload)

### E-Signatures
- **Legally binding** - ESIGN/UETA compliant electronic signatures
- **Multiple signers** - Sequential or parallel signing workflows
- **Audit trail** - Complete history of all document events
- **Reminders** - Automatic email reminders for pending signatures

### Payments
- **Stripe integration** - Collect credit card payments at signing
- **x402 / USDC payments** - Accept crypto payments on Base network
- **Down payments** - Collect partial payments upfront
- **Net terms** - Net 30/60 payment options

### Blockchain Verification
- **Document hashing** - SHA-256 hash of signed documents
- **On-chain recording** - Optional blockchain attestation on Base L2
- **Verification portal** - Public verification of document authenticity

### Teams & Organizations
- **Multi-seat accounts** - Invite team members with role-based access
- **Shared templates** - Team-wide template library
- **Organization billing** - Single subscription for the whole team
- **Activity tracking** - See who viewed/edited/signed documents

### Integrations
- **Salesforce** - Sync contacts and opportunities
- **HubSpot** - Sync contacts and deals
- **PandaDoc import** - Migrate templates from PandaDoc
- **Webhooks** - Automate workflows with document events
- **API** - Full REST API for custom integrations

## Pricing

| Plan | Price | Users | Storage | Features |
|------|-------|-------|---------|----------|
| **Free (Self-hosted)** | $0 | Unlimited | BYOS | All features |
| **Team** | $29/mo | 10 | 5GB | Payment collection, reminders |
| **Business** | $99/mo | Unlimited | 25GB | API access, priority support |

**Add-ons:**
- Blockchain verification: $19/mo
- Additional storage: $2/GB/mo

**Annual billing:** 2 months free (pay for 10, get 12)

## Quick Start

### Cloud (Recommended)

1. Sign up at [sendprop.com](https://sendprop.com)
2. Create your first document or import a template
3. Add recipients and send for signature

### Self-Hosted

```bash
git clone https://github.com/openproposal/openproposal
cd openproposal
cp .env.example .env.local
# Edit .env.local with your configuration
pnpm install
pnpm db:push
pnpm dev
```

**Requirements:**
- Node.js 18+
- PostgreSQL (or Neon serverless)
- S3-compatible storage (optional, for attachments)

See [Self-Hosting Guide](#self-hosting) for detailed setup.

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (magic link auth)
RESEND_API_KEY="re_..."

# Payments (optional)
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# x402 USDC Payments (optional)
X402_ENABLED="true"
X402_PAY_TO_ADDRESS="0x..."
X402_NETWORK="base"

# Blockchain Verification (optional)
BLOCKCHAIN_ENABLED="true"
BLOCKCHAIN_PRIVATE_KEY="0x..."

# Storage (optional)
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_BUCKET="..."
S3_REGION="..."

# Integrations (optional)
SALESFORCE_CLIENT_ID="..."
SALESFORCE_CLIENT_SECRET="..."
HUBSPOT_CLIENT_ID="..."
HUBSPOT_CLIENT_SECRET="..."
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** NextAuth.js (magic link)
- **Styling:** Tailwind CSS + shadcn/ui
- **Payments:** Stripe Connect + x402
- **Real-time:** Liveblocks
- **Email:** Resend

## API

Full REST API available for Business plan users.

```bash
# Create document from template
curl -X POST https://sendprop.com/api/documents \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "tmpl_abc123",
    "title": "Proposal for Acme Corp",
    "recipients": [
      {"email": "client@acme.com", "role": "signer", "name": "John Doe"}
    ]
  }'
```

## Comparison

| Feature | OpenProposal | PandaDoc | DocuSign |
|---------|--------------|----------|----------|
| 10-user team | $29/mo | $350/mo | $250/mo |
| Self-hosted | ✓ | ✗ | ✗ |
| Real-time editing | ✓ | ✗ | ✗ |
| Edit before signature | ✓ | ✗ | ✗ |
| Crypto payments (USDC) | ✓ | ✗ | ✗ |
| Blockchain verification | ✓ | ✗ | ✗ |
| Open source | ✓ | ✗ | ✗ |
| Bulk send | Included | Paid add-on | Paid add-on |

## Migrating from PandaDoc

1. Go to **Settings → Import**
2. Enter your PandaDoc API key
3. Select templates to import
4. Click Import

**What migrates:**
- Templates (converted to OpenProposal format)
- Content blocks and formatting
- Variables and merge fields

**What doesn't migrate:**
- Active documents (complete in PandaDoc first)
- Workflow automations
- Custom integrations

## Self-Hosting

### Docker (Recommended)

```bash
docker-compose up -d
```

### Manual Setup

1. **Database:** Set up PostgreSQL or use [Neon](https://neon.tech) serverless
2. **Storage:** Configure S3-compatible storage or use local filesystem
3. **Email:** Set up SMTP or use Resend for transactional emails
4. **SSL:** Use a reverse proxy (nginx, Caddy) for HTTPS

### Updating

```bash
git pull origin main
pnpm install
pnpm db:push
pnpm build
```

## Contributing

Contributions welcome! Please read our contributing guidelines first.

```bash
# Development
pnpm dev

# Type checking
pnpm tsc

# Linting
pnpm lint

# Build
pnpm build
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Links:**
- Website: [sendprop.com](https://sendprop.com)
- Documentation: [docs.sendprop.com](https://docs.sendprop.com)
- GitHub: [github.com/openproposal/openproposal](https://github.com/openproposal/openproposal)
- Twitter: [@openproposal](https://twitter.com/openproposal)
