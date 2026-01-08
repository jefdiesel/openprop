/**
 * DocuSign to OpenProposal Mapper
 * Maps DocuSign templates and envelopes to OpenProposal block structure
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Block,
  TextBlockData,
  DividerBlockData,
  SpacerBlockData,
  SignatureBlockData,
} from '@/types/blocks';
import type {
  DocuSignTemplate,
  DocuSignEnvelope,
  DocuSignTabs,
  DocuSignSigner,
} from './types';

// OpenProposal Document structure
export interface OpenProposalDocument {
  title: string;
  content: Block[];
  variables: Record<string, unknown>;
  settings: {
    expiresInDays?: number;
    requirePayment?: boolean;
  };
  importedFrom?: {
    provider: 'docusign';
    originalId: string;
    originalName: string;
    importedAt: string;
  };
}

/**
 * Map a DocuSign template to an OpenProposal Document
 */
export function mapDocuSignTemplate(template: DocuSignTemplate): OpenProposalDocument {
  const blocks: Block[] = [];
  const variables: Record<string, unknown> = {};

  // Add a header text block with the template name
  blocks.push(createTextBlock(`<h1>${escapeHtml(template.name)}</h1>`, 'center', '3xl'));

  // Add template description if available
  if (template.description) {
    blocks.push(createSpacerBlock('small'));
    blocks.push(createTextBlock(`<p>${escapeHtml(template.description)}</p>`, 'center', 'base'));
  }

  blocks.push(createSpacerBlock('medium'));

  // Add email subject and blurb if available
  if (template.emailSubject || template.emailBlurb) {
    blocks.push(createTextBlock('<h2>Document Information</h2>', 'left', 'xl'));
    if (template.emailSubject) {
      blocks.push(createTextBlock(`<p><strong>Subject:</strong> ${escapeHtml(template.emailSubject)}</p>`, 'left', 'base'));
    }
    if (template.emailBlurb) {
      blocks.push(createTextBlock(`<p>${escapeHtml(template.emailBlurb)}</p>`, 'left', 'base'));
    }
    blocks.push(createSpacerBlock('medium'));
  }

  // Map custom fields to variables
  if (template.customFields) {
    if (template.customFields.textCustomFields) {
      for (const field of template.customFields.textCustomFields) {
        variables[field.name] = field.value || '';
      }
    }
    if (template.customFields.listCustomFields) {
      for (const field of template.customFields.listCustomFields) {
        variables[field.name] = field.value || '';
      }
    }
  }

  // Map recipients to signature blocks
  if (template.recipients) {
    if (template.recipients.signers && template.recipients.signers.length > 0) {
      blocks.push(createDividerBlock());
      blocks.push(createSpacerBlock('medium'));
      blocks.push(createTextBlock('<h2>Signatures</h2>', 'left', 'xl'));
      blocks.push(createSpacerBlock('small'));

      for (const signer of template.recipients.signers) {
        const signerName = signer.roleName || signer.name || 'Signer';
        blocks.push(createSignatureBlock(signerName));

        // Add tabs (fields) for this signer
        if (signer.tabs) {
          const tabBlocks = mapTabsToBlocks(signer.tabs, signerName);
          blocks.push(...tabBlocks);
        }

        blocks.push(createSpacerBlock('small'));
      }
    }
  }

  // Add placeholder content if no signature blocks were created
  if (blocks.length <= 2) {
    blocks.push(createTextBlock(
      '<p>This template was imported from DocuSign. Customize the content as needed.</p>',
      'left',
      'base'
    ));
    blocks.push(createSpacerBlock('medium'));
    blocks.push(createDividerBlock());
    blocks.push(createSpacerBlock('medium'));
    blocks.push(createSignatureBlock('Signer'));
  }

  return {
    title: template.name,
    content: blocks,
    variables,
    settings: {},
    importedFrom: {
      provider: 'docusign',
      originalId: template.templateId,
      originalName: template.name,
      importedAt: new Date().toISOString(),
    },
  };
}

/**
 * Map a DocuSign envelope to an OpenProposal Document
 */
export function mapDocuSignEnvelope(envelope: DocuSignEnvelope): OpenProposalDocument {
  const blocks: Block[] = [];
  const variables: Record<string, unknown> = {};

  // Add envelope subject
  const title = envelope.emailSubject || 'Imported Document';
  blocks.push(createTextBlock(`<h1>${escapeHtml(title)}</h1>`, 'center', '3xl'));

  // Add email blurb if available
  if (envelope.emailBlurb) {
    blocks.push(createSpacerBlock('small'));
    blocks.push(createTextBlock(`<p>${escapeHtml(envelope.emailBlurb)}</p>`, 'center', 'base'));
  }

  blocks.push(createSpacerBlock('medium'));

  // Add status information
  blocks.push(createTextBlock('<h2>Document Status</h2>', 'left', 'xl'));
  blocks.push(createTextBlock(`<p><strong>Status:</strong> ${capitalizeFirst(envelope.status)}</p>`, 'left', 'base'));

  if (envelope.sentDateTime) {
    const sentDate = new Date(envelope.sentDateTime).toLocaleDateString();
    blocks.push(createTextBlock(`<p><strong>Sent:</strong> ${sentDate}</p>`, 'left', 'base'));
  }

  if (envelope.completedDateTime) {
    const completedDate = new Date(envelope.completedDateTime).toLocaleDateString();
    blocks.push(createTextBlock(`<p><strong>Completed:</strong> ${completedDate}</p>`, 'left', 'base'));
  }

  blocks.push(createSpacerBlock('medium'));

  // Map custom fields to variables
  if (envelope.customFields) {
    if (envelope.customFields.textCustomFields) {
      for (const field of envelope.customFields.textCustomFields) {
        variables[field.name] = field.value || '';
      }
    }
    if (envelope.customFields.listCustomFields) {
      for (const field of envelope.customFields.listCustomFields) {
        variables[field.name] = field.value || '';
      }
    }
  }

  // Map recipients to signature blocks
  if (envelope.recipients) {
    if (envelope.recipients.signers && envelope.recipients.signers.length > 0) {
      blocks.push(createDividerBlock());
      blocks.push(createSpacerBlock('medium'));
      blocks.push(createTextBlock('<h2>Signatures</h2>', 'left', 'xl'));
      blocks.push(createSpacerBlock('small'));

      for (const signer of envelope.recipients.signers) {
        const signerName = signer.name || 'Signer';
        const signatureBlock = createSignatureBlock(signerName);

        // Mark as signed if completed
        if (signer.status === 'completed' && signer.signedDateTime) {
          signatureBlock.signedAt = signer.signedDateTime;
          signatureBlock.signedBy = signer.email;
        }

        blocks.push(signatureBlock);

        // Add tabs (fields) for this signer
        if (signer.tabs) {
          const tabBlocks = mapTabsToBlocks(signer.tabs, signerName);
          blocks.push(...tabBlocks);
        }

        blocks.push(createSpacerBlock('small'));
      }
    }

    // Add carbon copy recipients info
    if (envelope.recipients.carbonCopies && envelope.recipients.carbonCopies.length > 0) {
      blocks.push(createSpacerBlock('medium'));
      blocks.push(createTextBlock('<h3>Carbon Copies</h3>', 'left', 'lg'));
      const ccList = envelope.recipients.carbonCopies
        .map(cc => `${cc.name} (${cc.email})`)
        .join(', ');
      blocks.push(createTextBlock(`<p>${escapeHtml(ccList)}</p>`, 'left', 'base'));
    }
  }

  // Calculate expiration settings
  const settings: OpenProposalDocument['settings'] = {};
  if (envelope.notification?.expirations?.expireEnabled === 'true') {
    const expireAfter = parseInt(envelope.notification.expirations.expireAfter || '0', 10);
    if (expireAfter > 0) {
      settings.expiresInDays = expireAfter;
    }
  }

  return {
    title,
    content: blocks,
    variables,
    settings,
    importedFrom: {
      provider: 'docusign',
      originalId: envelope.envelopeId,
      originalName: title,
      importedAt: new Date().toISOString(),
    },
  };
}

/**
 * Map DocuSign tabs to OpenProposal blocks
 */
function mapTabsToBlocks(tabs: DocuSignTabs, signerName: string): Block[] {
  const blocks: Block[] = [];

  // Map text tabs
  if (tabs.textTabs) {
    for (const tab of tabs.textTabs) {
      const label = tab.tabLabel || tab.name || 'Text Field';
      const value = tab.value || '__________';
      blocks.push(createTextBlock(
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
        'left',
        'base'
      ));
    }
  }

  // Map date tabs
  if (tabs.dateTabs) {
    for (const tab of tabs.dateTabs) {
      const label = tab.tabLabel || tab.name || 'Date';
      const value = tab.value || '__________';
      blocks.push(createTextBlock(
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
        'left',
        'base'
      ));
    }
  }

  // Map date signed tabs
  if (tabs.dateSignedTabs) {
    for (const tab of tabs.dateSignedTabs) {
      const label = tab.tabLabel || 'Date Signed';
      const value = tab.value || '__________';
      blocks.push(createTextBlock(
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
        'left',
        'base'
      ));
    }
  }

  // Map checkbox tabs
  if (tabs.checkboxTabs) {
    for (const tab of tabs.checkboxTabs) {
      const label = tab.tabLabel || tab.name || 'Checkbox';
      const checked = tab.selected === 'true';
      const checkmark = checked ? '[x]' : '[ ]';
      blocks.push(createTextBlock(
        `<p>${checkmark} ${escapeHtml(label)}</p>`,
        'left',
        'base'
      ));
    }
  }

  // Map full name tabs
  if (tabs.fullNameTabs) {
    for (const tab of tabs.fullNameTabs) {
      const label = tab.tabLabel || 'Full Name';
      const value = tab.value || signerName;
      blocks.push(createTextBlock(
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
        'left',
        'base'
      ));
    }
  }

  // Map title tabs
  if (tabs.titleTabs) {
    for (const tab of tabs.titleTabs) {
      const label = tab.tabLabel || 'Title';
      const value = tab.value || '__________';
      blocks.push(createTextBlock(
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
        'left',
        'base'
      ));
    }
  }

  // Map company tabs
  if (tabs.companyTabs) {
    for (const tab of tabs.companyTabs) {
      const label = tab.tabLabel || 'Company';
      const value = tab.value || '__________';
      blocks.push(createTextBlock(
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
        'left',
        'base'
      ));
    }
  }

  // Map email tabs
  if (tabs.emailTabs) {
    for (const tab of tabs.emailTabs) {
      const label = tab.tabLabel || 'Email';
      const value = tab.value || '__________';
      blocks.push(createTextBlock(
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
        'left',
        'base'
      ));
    }
  }

  // Map number tabs
  if (tabs.numberTabs) {
    for (const tab of tabs.numberTabs) {
      const label = tab.tabLabel || tab.name || 'Number';
      const value = tab.value || '__________';
      blocks.push(createTextBlock(
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
        'left',
        'base'
      ));
    }
  }

  return blocks;
}

// Helper functions

function createTextBlock(
  content: string,
  alignment: TextBlockData['alignment'],
  fontSize: TextBlockData['fontSize']
): TextBlockData {
  return {
    id: uuidv4(),
    type: 'text',
    content,
    alignment,
    fontSize,
  };
}

function createSpacerBlock(size: 'small' | 'medium' | 'large'): SpacerBlockData {
  return {
    id: uuidv4(),
    type: 'spacer',
    size,
  };
}

function createDividerBlock(): DividerBlockData {
  return {
    id: uuidv4(),
    type: 'divider',
    style: 'solid',
  };
}

function createSignatureBlock(role: string, required: boolean = true): SignatureBlockData {
  return {
    id: uuidv4(),
    type: 'signature',
    signerRole: role,
    required,
    signatureType: 'draw',
  };
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Map DocuSign template to OpenProposal blocks
 * This is a simplified version that just returns the blocks
 */
export function mapDocuSignTemplateToBlocks(template: DocuSignTemplate): Block[] {
  const doc = mapDocuSignTemplate(template);
  return doc.content;
}

/**
 * Map DocuSign envelope to OpenProposal blocks
 * This is a simplified version that just returns the blocks
 */
export function mapDocuSignEnvelopeToBlocks(envelope: DocuSignEnvelope): Block[] {
  const doc = mapDocuSignEnvelope(envelope);
  return doc.content;
}
