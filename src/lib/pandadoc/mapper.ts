/**
 * PandaDoc to SendProp Mapper
 * Maps PandaDoc templates and documents to SendProp block structure
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Block,
  TextBlockData,
  ImageBlockData,
  DividerBlockData,
  SpacerBlockData,
  SignatureBlockData,
  PricingTableBlockData,
  PricingTableItem,
  VideoBlockData,
} from '@/types/blocks';

// PandaDoc Types
export interface PandaDocTemplate {
  id: string;
  name: string;
  date_created: string;
  date_modified: string;
  version: string;
  content?: PandaDocContent[];
}

export interface PandaDocDocument {
  id: string;
  name: string;
  status: string;
  date_created: string;
  date_modified: string;
  expiration_date?: string;
  version: string;
  content?: PandaDocContent[];
  recipients?: PandaDocRecipient[];
  pricing_tables?: PandaDocPricingTable[];
  fields?: PandaDocField[];
  tokens?: PandaDocToken[];
}

export interface PandaDocContent {
  uuid: string;
  type: string;
  data: Record<string, unknown>;
}

export interface PandaDocRecipient {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  signing_order?: number;
}

export interface PandaDocPricingTable {
  id: string;
  name: string;
  sections: PandaDocPricingSection[];
  summary?: {
    subtotal: number;
    discount?: number;
    tax?: number;
    total: number;
  };
  options?: {
    currency: string;
    tax_rate?: number;
    discount?: {
      type: 'absolute' | 'percent';
      value: number;
    };
  };
}

export interface PandaDocPricingSection {
  title?: string;
  default?: boolean;
  rows: PandaDocPricingRow[];
}

export interface PandaDocPricingRow {
  options: {
    optional?: boolean;
    optional_selected?: boolean;
    qty_editable?: boolean;
  };
  data: {
    name: string;
    description?: string;
    price: number;
    qty: number;
    cost?: number;
  };
}

export interface PandaDocField {
  uuid: string;
  name: string;
  type: string;
  value?: string | boolean | number;
  assigned_to?: {
    role?: string;
  };
}

export interface PandaDocToken {
  name: string;
  value: string;
}

// SendProp Document structure
export interface SendPropDocument {
  title: string;
  content: Block[];
  variables: Record<string, unknown>;
  settings: {
    expiresInDays?: number;
    requirePayment?: boolean;
  };
  importedFrom?: {
    provider: 'pandadoc';
    originalId: string;
    originalName: string;
    importedAt: string;
  };
}

/**
 * Map a PandaDoc template to a SendProp Document
 */
export function mapPandaDocTemplate(template: PandaDocTemplate): SendPropDocument {
  const blocks: Block[] = [];
  const variables: Record<string, unknown> = {};

  // Add a header text block with the template name
  blocks.push(createTextBlock(`<h1>${escapeHtml(template.name)}</h1>`, 'center', '3xl'));

  // Add a spacer
  blocks.push(createSpacerBlock('medium'));

  // Map content if available
  if (template.content && template.content.length > 0) {
    const mappedBlocks = mapPandaDocContent(template.content);
    blocks.push(...mappedBlocks);
  } else {
    // Add placeholder content for templates without parsed content
    blocks.push(createTextBlock(
      '<p>This template was imported from PandaDoc. Add your content blocks to customize it.</p>',
      'left',
      'base'
    ));
  }

  return {
    title: template.name,
    content: blocks,
    variables,
    settings: {},
    importedFrom: {
      provider: 'pandadoc',
      originalId: template.id,
      originalName: template.name,
      importedAt: new Date().toISOString(),
    },
  };
}

/**
 * Map a PandaDoc document to a SendProp Document
 */
export function mapPandaDocDocument(doc: PandaDocDocument): SendPropDocument {
  const blocks: Block[] = [];
  const variables: Record<string, unknown> = {};

  // Add document title
  blocks.push(createTextBlock(`<h1>${escapeHtml(doc.name)}</h1>`, 'center', '3xl'));
  blocks.push(createSpacerBlock('medium'));

  // Map tokens to variables
  if (doc.tokens) {
    for (const token of doc.tokens) {
      variables[token.name] = token.value;
    }
  }

  // Map content blocks
  if (doc.content && doc.content.length > 0) {
    const mappedBlocks = mapPandaDocContent(doc.content);
    blocks.push(...mappedBlocks);
  }

  // Map pricing tables
  if (doc.pricing_tables && doc.pricing_tables.length > 0) {
    for (const pricingTable of doc.pricing_tables) {
      blocks.push(mapPandaDocPricingTable(pricingTable));
    }
  }

  // Map signature fields
  if (doc.fields) {
    const signatureFields = doc.fields.filter(f => f.type === 'signature');
    for (const field of signatureFields) {
      blocks.push(createSignatureBlock(field.assigned_to?.role || 'Signer'));
    }
  }

  // If no signature blocks were created but there are recipients, add signature blocks for signers
  if (!doc.fields?.some(f => f.type === 'signature') && doc.recipients) {
    const signers = doc.recipients.filter(r => r.role?.toLowerCase().includes('signer'));
    if (signers.length > 0) {
      blocks.push(createDividerBlock());
      blocks.push(createSpacerBlock('medium'));

      for (const signer of signers) {
        const name = [signer.first_name, signer.last_name].filter(Boolean).join(' ') || signer.role;
        blocks.push(createSignatureBlock(name || 'Signer'));
      }
    }
  }

  // Calculate expiration settings
  const settings: SendPropDocument['settings'] = {};
  if (doc.expiration_date) {
    const expirationDate = new Date(doc.expiration_date);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiration > 0) {
      settings.expiresInDays = daysUntilExpiration;
    }
  }

  return {
    title: doc.name,
    content: blocks,
    variables,
    settings,
    importedFrom: {
      provider: 'pandadoc',
      originalId: doc.id,
      originalName: doc.name,
      importedAt: new Date().toISOString(),
    },
  };
}

/**
 * Map PandaDoc content blocks to SendProp blocks
 */
function mapPandaDocContent(content: PandaDocContent[]): Block[] {
  const blocks: Block[] = [];

  for (const item of content) {
    const block = mapContentItem(item);
    if (block) {
      if (Array.isArray(block)) {
        blocks.push(...block);
      } else {
        blocks.push(block);
      }
    }
  }

  return blocks;
}

/**
 * Map a single PandaDoc content item to SendProp block(s)
 */
function mapContentItem(item: PandaDocContent): Block | Block[] | null {
  switch (item.type) {
    case 'text':
    case 'rich_text':
      return mapTextContent(item.data);

    case 'image':
      return mapImageContent(item.data);

    case 'signature':
      return mapSignatureContent(item.data);

    case 'pricing':
    case 'pricing_table':
      return mapPricingContent(item.data);

    case 'video':
      return mapVideoContent(item.data);

    case 'divider':
    case 'line':
    case 'horizontal_rule':
      return createDividerBlock();

    case 'spacer':
    case 'page_break':
      return createSpacerBlock('large');

    case 'table':
      return mapTableContent(item.data);

    case 'heading':
    case 'header':
      return mapHeadingContent(item.data);

    case 'paragraph':
      return mapParagraphContent(item.data);

    case 'list':
      return mapListContent(item.data);

    case 'checkbox':
    case 'checklist':
      return mapCheckboxContent(item.data);

    case 'date':
    case 'date_field':
      return mapDateFieldContent(item.data);

    case 'text_field':
    case 'input':
      return mapInputFieldContent(item.data);

    default:
      // For unknown types, try to extract any text content
      if (item.data && typeof item.data === 'object') {
        const text = extractTextFromData(item.data);
        if (text) {
          return createTextBlock(`<p>${escapeHtml(text)}</p>`, 'left', 'base');
        }
      }
      return null;
  }
}

/**
 * Map PandaDoc text content to SendProp text block
 */
function mapTextContent(data: Record<string, unknown>): TextBlockData {
  let content = '';
  let alignment: TextBlockData['alignment'] = 'left';
  let fontSize: TextBlockData['fontSize'] = 'base';

  if (typeof data.content === 'string') {
    content = sanitizeHtmlContent(data.content);
  } else if (typeof data.text === 'string') {
    content = `<p>${escapeHtml(data.text)}</p>`;
  } else if (typeof data.html === 'string') {
    content = sanitizeHtmlContent(data.html);
  } else if (typeof data.value === 'string') {
    content = `<p>${escapeHtml(data.value)}</p>`;
  }

  // Map alignment
  if (data.align === 'center' || data.alignment === 'center') {
    alignment = 'center';
  } else if (data.align === 'right' || data.alignment === 'right') {
    alignment = 'right';
  } else if (data.align === 'justify' || data.alignment === 'justify') {
    alignment = 'justify';
  }

  // Map font size
  if (data.fontSize || data.size) {
    const size = data.fontSize || data.size;
    if (typeof size === 'number') {
      if (size >= 24) fontSize = '3xl';
      else if (size >= 20) fontSize = '2xl';
      else if (size >= 18) fontSize = 'xl';
      else if (size >= 16) fontSize = 'lg';
      else if (size <= 12) fontSize = 'sm';
    }
  }

  return createTextBlock(content, alignment, fontSize);
}

/**
 * Map PandaDoc image content to SendProp image block
 */
function mapImageContent(data: Record<string, unknown>): ImageBlockData {
  const src = (data.url || data.src || data.source || '') as string;
  const alt = (data.alt || data.name || data.title || 'Imported image') as string;
  const caption = (data.caption || '') as string;

  let width = 100;
  if (typeof data.width === 'number') {
    width = Math.min(100, Math.max(10, data.width));
  } else if (typeof data.width === 'string' && data.width.endsWith('%')) {
    width = parseInt(data.width, 10) || 100;
  }

  return {
    id: uuidv4(),
    type: 'image',
    src,
    alt,
    caption,
    width,
  };
}

/**
 * Map PandaDoc signature content to SendProp signature block
 */
function mapSignatureContent(data: Record<string, unknown>): SignatureBlockData {
  const role = (data.role || data.assigned_to || data.recipient || 'Signer') as string;
  const required = data.required !== false;

  return createSignatureBlock(role, required);
}

/**
 * Map PandaDoc pricing content to SendProp pricing table block
 */
function mapPricingContent(data: Record<string, unknown>): PricingTableBlockData {
  const items: PricingTableItem[] = [];
  const currency = (data.currency || 'USD') as string;

  // Extract rows from various possible structures
  const rows = (data.rows || data.items || data.line_items || []) as Array<Record<string, unknown>>;

  for (const row of rows) {
    const rowData = (row.data || row) as Record<string, unknown>;
    items.push({
      id: uuidv4(),
      name: (rowData.name || rowData.title || 'Item') as string,
      description: (rowData.description || '') as string,
      quantity: (typeof rowData.qty === 'number' ? rowData.qty : (typeof rowData.quantity === 'number' ? rowData.quantity : 1)) as number,
      unitPrice: (typeof rowData.price === 'number' ? rowData.price : (typeof rowData.unit_price === 'number' ? rowData.unit_price : 0)) as number,
      isOptional: Boolean(rowData.optional || (row.options as Record<string, unknown>)?.optional),
      isSelected: Boolean(rowData.optional_selected || (row.options as Record<string, unknown>)?.optional_selected || true),
      allowQuantityChange: Boolean(rowData.qty_editable || (row.options as Record<string, unknown>)?.qty_editable),
    });
  }

  let taxRate = 0;
  if (typeof data.tax_rate === 'number') {
    taxRate = data.tax_rate;
  } else if (data.options && typeof (data.options as Record<string, unknown>).tax_rate === 'number') {
    taxRate = (data.options as Record<string, unknown>).tax_rate as number;
  }

  let discountType: 'percentage' | 'fixed' | undefined;
  let discountValue: number | undefined;

  const discount = (data.discount || (data.options as Record<string, unknown>)?.discount) as Record<string, unknown> | undefined;
  if (discount) {
    discountType = discount.type === 'percent' ? 'percentage' : 'fixed';
    discountValue = typeof discount.value === 'number' ? discount.value : undefined;
  }

  return {
    id: uuidv4(),
    type: 'pricing-table',
    items,
    currency,
    showDescription: true,
    taxRate,
    taxLabel: 'Tax',
    discountType,
    discountValue,
  };
}

/**
 * Map PandaDoc video content to SendProp video block
 */
function mapVideoContent(data: Record<string, unknown>): VideoBlockData {
  const url = (data.url || data.src || data.video_url || '') as string;
  let provider: VideoBlockData['provider'] = 'other';

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    provider = 'youtube';
  } else if (url.includes('loom.com')) {
    provider = 'loom';
  } else if (url.includes('vimeo.com')) {
    provider = 'vimeo';
  }

  return {
    id: uuidv4(),
    type: 'video',
    url,
    provider,
  };
}

/**
 * Map PandaDoc table content to SendProp text blocks (as formatted HTML table)
 */
function mapTableContent(data: Record<string, unknown>): TextBlockData {
  const rows = (data.rows || []) as Array<Record<string, unknown>>;
  let html = '<table style="width: 100%; border-collapse: collapse;">';

  for (const row of rows) {
    html += '<tr>';
    const cells = (row.cells || row.columns || []) as Array<Record<string, unknown>>;
    for (const cell of cells) {
      const value = (cell.value || cell.content || cell.text || '') as string;
      const isHeader = Boolean(cell.header || row.header);
      const tag = isHeader ? 'th' : 'td';
      html += `<${tag} style="border: 1px solid #e5e7eb; padding: 8px;">${escapeHtml(value)}</${tag}>`;
    }
    html += '</tr>';
  }

  html += '</table>';

  return createTextBlock(html, 'left', 'base');
}

/**
 * Map PandaDoc heading content
 */
function mapHeadingContent(data: Record<string, unknown>): TextBlockData {
  const text = (data.text || data.content || data.value || '') as string;
  const level = (typeof data.level === 'number' ? data.level : 1) as number;

  const tag = `h${Math.min(6, Math.max(1, level))}`;
  const fontSize = level <= 1 ? '3xl' : level === 2 ? '2xl' : level === 3 ? 'xl' : 'lg';

  return createTextBlock(`<${tag}>${escapeHtml(text)}</${tag}>`, 'left', fontSize as TextBlockData['fontSize']);
}

/**
 * Map PandaDoc paragraph content
 */
function mapParagraphContent(data: Record<string, unknown>): TextBlockData {
  const text = (data.text || data.content || data.value || '') as string;
  return createTextBlock(`<p>${escapeHtml(text)}</p>`, 'left', 'base');
}

/**
 * Map PandaDoc list content
 */
function mapListContent(data: Record<string, unknown>): TextBlockData {
  const items = (data.items || data.list || []) as Array<string | Record<string, unknown>>;
  const ordered = Boolean(data.ordered);
  const tag = ordered ? 'ol' : 'ul';

  let html = `<${tag}>`;
  for (const item of items) {
    const text = typeof item === 'string' ? item : ((item.text || item.content || item.value || '') as string);
    html += `<li>${escapeHtml(text)}</li>`;
  }
  html += `</${tag}>`;

  return createTextBlock(html, 'left', 'base');
}

/**
 * Map PandaDoc checkbox/checklist content
 */
function mapCheckboxContent(data: Record<string, unknown>): TextBlockData {
  const items = (data.items || data.options || []) as Array<Record<string, unknown>>;
  let html = '<ul style="list-style: none; padding-left: 0;">';

  for (const item of items) {
    const text = (item.text || item.label || item.value || '') as string;
    const checked = Boolean(item.checked || item.selected);
    const checkmark = checked ? '[x]' : '[ ]';
    html += `<li>${checkmark} ${escapeHtml(text)}</li>`;
  }

  html += '</ul>';
  return createTextBlock(html, 'left', 'base');
}

/**
 * Map PandaDoc date field content
 */
function mapDateFieldContent(data: Record<string, unknown>): TextBlockData {
  const label = (data.label || data.name || 'Date') as string;
  const value = (data.value || data.date || '__________') as string;
  return createTextBlock(`<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`, 'left', 'base');
}

/**
 * Map PandaDoc text input field content
 */
function mapInputFieldContent(data: Record<string, unknown>): TextBlockData {
  const label = (data.label || data.name || 'Field') as string;
  const value = (data.value || data.default_value || '__________') as string;
  return createTextBlock(`<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`, 'left', 'base');
}

/**
 * Map a PandaDoc pricing table to SendProp pricing table block
 */
function mapPandaDocPricingTable(table: PandaDocPricingTable): PricingTableBlockData {
  const items: PricingTableItem[] = [];

  for (const section of table.sections) {
    for (const row of section.rows) {
      items.push({
        id: uuidv4(),
        name: row.data.name,
        description: row.data.description,
        quantity: row.data.qty,
        unitPrice: row.data.price,
        isOptional: Boolean(row.options.optional),
        isSelected: Boolean(row.options.optional_selected ?? true),
        allowQuantityChange: Boolean(row.options.qty_editable),
      });
    }
  }

  const currency = table.options?.currency || 'USD';
  const taxRate = table.options?.tax_rate || 0;

  let discountType: 'percentage' | 'fixed' | undefined;
  let discountValue: number | undefined;

  if (table.options?.discount) {
    discountType = table.options.discount.type === 'percent' ? 'percentage' : 'fixed';
    discountValue = table.options.discount.value;
  }

  return {
    id: uuidv4(),
    type: 'pricing-table',
    items,
    currency,
    showDescription: true,
    taxRate,
    taxLabel: 'Tax',
    discountType,
    discountValue,
  };
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

function sanitizeHtmlContent(html: string): string {
  // Allow safe HTML tags, strip potentially dangerous ones
  const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'span', 'div', 'table', 'tr', 'td', 'th', 'thead', 'tbody'];

  // Simple sanitization - in production, use a proper HTML sanitizer like DOMPurify
  let sanitized = html;

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
}

function extractTextFromData(data: Record<string, unknown>): string | null {
  const textFields = ['text', 'content', 'value', 'html', 'title', 'name', 'description'];

  for (const field of textFields) {
    if (typeof data[field] === 'string' && data[field]) {
      return data[field] as string;
    }
  }

  return null;
}

// Export helper function for use with PandaDoc client types
import type { PandaDocTemplate as ClientPandaDocTemplate } from './types';

/**
 * Map PandaDoc template from client to SendProp blocks
 * This is an adapter for the PandaDocClient template type
 */
export function mapPandaDocTemplateToBlocks(template: ClientPandaDocTemplate): Block[] {
  const blocks: Block[] = [];

  // Add header text block with the template name
  blocks.push(createTextBlock(`<h1>${escapeHtml(template.name)}</h1>`, 'center', '3xl'));
  blocks.push(createSpacerBlock('medium'));

  // Map roles to signature blocks
  if (template.roles && template.roles.length > 0) {
    for (const role of template.roles) {
      if (role.name.toLowerCase().includes('signer') || role.name.toLowerCase().includes('sign')) {
        blocks.push(createSignatureBlock(role.name));
      }
    }
  }

  // Map fields
  if (template.fields && template.fields.length > 0) {
    for (const field of template.fields) {
      if (field.type === 'signature') {
        blocks.push(createSignatureBlock(field.role || field.name || 'Signer'));
      } else if (field.type === 'date') {
        blocks.push(createTextBlock(`<p><strong>${escapeHtml(field.name)}:</strong> __________</p>`, 'left', 'base'));
      } else if (field.type === 'text') {
        blocks.push(createTextBlock(`<p><strong>${escapeHtml(field.name)}:</strong> ${escapeHtml(String(field.value || '__________'))}</p>`, 'left', 'base'));
      }
    }
  }

  // Map pricing tables
  if (template.pricing && template.pricing.length > 0) {
    for (const pricingTable of template.pricing) {
      const items: PricingTableItem[] = [];

      for (const row of pricingTable.rows) {
        const rowData = row.data as Record<string, string | number>;
        items.push({
          id: uuidv4(),
          name: String(rowData.name || rowData.Name || 'Item'),
          description: String(rowData.description || rowData.Description || ''),
          quantity: Number(rowData.qty || rowData.Qty || 1),
          unitPrice: Number(rowData.price || rowData.Price || 0),
          isOptional: Boolean(row.options?.optional),
          isSelected: Boolean(row.options?.optional_selected ?? true),
          allowQuantityChange: Boolean(row.options?.qty_editable),
        });
      }

      blocks.push({
        id: uuidv4(),
        type: 'pricing-table',
        items,
        currency: pricingTable.options?.currency || 'USD',
        showDescription: true,
        taxRate: 0,
        taxLabel: 'Tax',
      } as PricingTableBlockData);
    }
  }

  // Add placeholder if no content blocks were created
  if (blocks.length <= 2) {
    blocks.push(createTextBlock(
      '<p>This template was imported from PandaDoc. Add your content blocks to customize it.</p>',
      'left',
      'base'
    ));
  }

  // Add a signature block if none exist
  const hasSignature = blocks.some(b => b.type === 'signature');
  if (!hasSignature) {
    blocks.push(createDividerBlock());
    blocks.push(createSpacerBlock('medium'));
    blocks.push(createSignatureBlock('Signer'));
  }

  return blocks;
}
