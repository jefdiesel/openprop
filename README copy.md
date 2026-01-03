# OpenProposal

Open-source proposal and document signing platform. PandaDoc alternative at 1/10th the cost.

## Why OpenProposal?

PandaDoc charges $35/seat/month. A 10-person sales team pays $350/month just to send proposals.

OpenProposal: **$29/month total**, unlimited users.

## Pricing

| Plan | Price | Users | Storage | Overage |
|------|-------|-------|---------|---------|
| Self-hosted | Free | Unlimited | BYOS | — |
| Team Monthly | $29/mo | 10 | 5GB | $2/GB/mo |
| Team Annual | $290/yr | 10 | 10GB | $2/GB/mo |
| Business Monthly | $99/mo | Unlimited | 25GB | $2/GB/mo |
| Business Annual | $990/yr | Unlimited | 25GB | $2/GB/mo |

## Features

### Core
- Document builder with drag-and-drop
- E-signatures (legally binding)
- Real-time collaboration (Google Docs style, pre-signature)
- Edit documents until first signature (no delete/re-upload dance)
- Template library
- Pricing tables and quotes
- Document tracking (opens, views, time spent)

### Integrations
- CRM integrations (Salesforce, HubSpot)
- Payment collection (Stripe)
- Webhooks for automation

### What we don't have (yet)
- AI writing assistant (you have Claude/ChatGPT, use that)
- Notarization
- 1000+ templates (we have ~50 good ones)

## Self-Hosted

```bash
git clone https://github.com/yourorg/openproposal
cd openproposal
docker-compose up
```

Bring your own:
- PostgreSQL (or use included container)
- S3-compatible storage (MinIO, AWS S3, Cloudflare R2)
- SMTP for emails

See [Self-Hosted Guide](docs/self-hosted.md) for full setup.

## Migrating from PandaDoc

### Cloud users
Migration wizard built into dashboard. Connect your PandaDoc API key, select what to import, done.

### Self-hosted users

```bash
# Export from PandaDoc
./scripts/migrate-from-pandadoc.py \
  --api-key=YOUR_PANDADOC_API_KEY \
  --output=./export/

# Import to OpenProposal
./scripts/import.py --input=./export/
```

**What migrates:**
- Templates (converted to OpenProposal format)
- Content library items
- Contacts
- Folder structure
- Product catalog
- Document archive (PDFs, read-only)

**What doesn't migrate:**
- Active documents awaiting signature (complete these in PandaDoc first)
- Workflow automations (recreate manually)
- Custom integrations

**Requirements:** PandaDoc Enterprise plan (needed for API access)

## API

Full REST API for automation. See [API Docs](docs/api.md).

```bash
# Create document from template
curl -X POST https://api.openproposal.io/v1/documents \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "template_id": "tmpl_abc123",
    "recipients": [{"email": "client@example.com", "role": "signer"}],
    "fields": {"company_name": "Acme Corp", "amount": 15000}
  }'
```

## Comparison

| Feature | OpenProposal | PandaDoc |
|---------|--------------|----------|
| 10-user team | $29/mo | $350/mo |
| 50-user team | $99/mo | $1,750/mo |
| Self-hosted option | ✓ | ✗ |
| Edit before signature | ✓ | ✗ (must delete & re-upload) |
| Real-time collab | ✓ | ✗ |
| Bulk send | Included | Paid add-on |
| Field data export | ✓ | ✗ |
| Open source | ✓ | ✗ |

## Stack

- **Frontend:** React, TypeScript, TailwindCSS
- **Backend:** Node.js / Python (your choice)
- **Database:** PostgreSQL
- **Storage:** S3-compatible
- **E-signatures:** Built-in (ESIGN/UETA compliant)

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT for self-hosted. Cloud version is a managed service.

---

**Links**
- [Documentation](https://docs.openproposal.io)
- [Cloud Dashboard](https://app.openproposal.io)
- [Discord](https://discord.gg/openproposal)
- [Twitter](https://twitter.com/openproposal)
