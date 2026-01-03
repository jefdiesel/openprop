import React from 'react'
import {
  Document as PDFDocument,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer'
import type { Document, Block, Recipient } from '@/types/database'

// Register default fonts
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2',
      fontWeight: 700,
    },
  ],
})

// Styles for PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 1.5,
    color: '#1f2937',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  block: {
    marginBottom: 15,
  },
  // Text blocks
  textBlock: {
    fontSize: 12,
  },
  textLeft: {
    textAlign: 'left',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textJustify: {
    textAlign: 'justify',
  },
  textSmall: {
    fontSize: 10,
  },
  textBase: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
  textXl: {
    fontSize: 18,
  },
  text2xl: {
    fontSize: 22,
  },
  text3xl: {
    fontSize: 28,
  },
  // Heading blocks
  heading1: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 10,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 6,
  },
  heading4: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 5,
  },
  heading5: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  heading6: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  // Image blocks
  image: {
    maxWidth: '100%',
    objectFit: 'contain',
  },
  imageContainer: {
    marginVertical: 10,
  },
  imageCaption: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5,
  },
  // Divider
  divider: {
    borderBottom: '1px solid #e5e7eb',
    marginVertical: 15,
  },
  dividerDashed: {
    borderBottom: '1px dashed #e5e7eb',
    marginVertical: 15,
  },
  dividerDotted: {
    borderBottom: '1px dotted #e5e7eb',
    marginVertical: 15,
  },
  // Spacer
  spacerSmall: {
    height: 10,
  },
  spacerMedium: {
    height: 20,
  },
  spacerLarge: {
    height: 40,
  },
  // Signature block
  signatureBlock: {
    marginVertical: 20,
    padding: 15,
    border: '1px solid #e5e7eb',
    borderRadius: 4,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5,
  },
  signatureImage: {
    maxWidth: 200,
    maxHeight: 80,
    marginVertical: 10,
  },
  signatureLine: {
    borderBottom: '1px solid #000',
    width: 200,
    marginTop: 40,
    marginBottom: 5,
  },
  signatureInfo: {
    fontSize: 9,
    color: '#6b7280',
  },
  // Pricing table
  pricingTable: {
    marginVertical: 15,
  },
  pricingTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: 8,
    marginBottom: 5,
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 700,
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTop: '2px solid #1f2937',
    marginTop: 5,
  },
  totalLabel: {
    flex: 3,
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'right',
  },
  // Table block
  table: {
    marginVertical: 10,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#9ca3af',
  },
})

// Helper to strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

// Format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Get font size style
function getFontSizeStyle(fontSize?: string) {
  switch (fontSize) {
    case 'sm':
      return styles.textSmall
    case 'lg':
      return styles.textLarge
    case 'xl':
      return styles.textXl
    case '2xl':
      return styles.text2xl
    case '3xl':
      return styles.text3xl
    default:
      return styles.textBase
  }
}

// Get alignment style
function getAlignmentStyle(alignment?: string) {
  switch (alignment) {
    case 'center':
      return styles.textCenter
    case 'right':
      return styles.textRight
    case 'justify':
      return styles.textJustify
    default:
      return styles.textLeft
  }
}

// Text Block Component
interface TextBlockProps {
  content: string
  alignment?: string
  fontSize?: string
}

function TextBlockPDF({ content, alignment, fontSize }: TextBlockProps) {
  return React.createElement(
    View,
    { style: styles.block },
    React.createElement(
      Text,
      { style: [styles.textBlock, getAlignmentStyle(alignment), getFontSizeStyle(fontSize)] },
      stripHtml(content)
    )
  )
}

// Heading Block Component
interface HeadingBlockProps {
  content: string
  level?: number
}

function HeadingBlockPDF({ content, level = 1 }: HeadingBlockProps) {
  const headingStyles: Record<number, typeof styles.heading1> = {
    1: styles.heading1,
    2: styles.heading2,
    3: styles.heading3,
    4: styles.heading4,
    5: styles.heading5,
    6: styles.heading6,
  }
  return React.createElement(
    View,
    { style: styles.block },
    React.createElement(Text, { style: headingStyles[level] || styles.heading1 }, content)
  )
}

// Image Block Component
interface ImageBlockProps {
  src: string
  alt?: string
  caption?: string
  width?: number
}

function ImageBlockPDF({ src, caption, width }: ImageBlockProps) {
  const imageStyle = width ? { ...styles.image, width: `${width}%` } : styles.image
  return React.createElement(
    View,
    { style: styles.imageContainer },
    src ? React.createElement(Image, { src, style: imageStyle }) : null,
    caption ? React.createElement(Text, { style: styles.imageCaption }, caption) : null
  )
}

// Divider Block Component
interface DividerBlockProps {
  style?: 'solid' | 'dashed' | 'dotted'
}

function DividerBlockPDF({ style = 'solid' }: DividerBlockProps) {
  const dividerStyles: Record<string, typeof styles.divider> = {
    solid: styles.divider,
    dashed: styles.dividerDashed,
    dotted: styles.dividerDotted,
  }
  return React.createElement(View, { style: dividerStyles[style] || styles.divider })
}

// Spacer Block Component
interface SpacerBlockProps {
  size?: 'small' | 'medium' | 'large'
  height?: number
}

function SpacerBlockPDF({ size = 'medium', height }: SpacerBlockProps) {
  if (height) {
    return React.createElement(View, { style: { height } })
  }
  const spacerStyles: Record<string, typeof styles.spacerMedium> = {
    small: styles.spacerSmall,
    medium: styles.spacerMedium,
    large: styles.spacerLarge,
  }
  return React.createElement(View, { style: spacerStyles[size] || styles.spacerMedium })
}

// Signature Block Component
interface SignatureBlockProps {
  signatureData?: string
  signedAt?: string
  signedBy?: string
  signerRole?: string
  role?: string
}

function SignatureBlockPDF({ signatureData, signedAt, signedBy, signerRole, role }: SignatureBlockProps) {
  const displayRole = signerRole || role || 'Signer'
  return React.createElement(
    View,
    { style: styles.signatureBlock },
    React.createElement(Text, { style: styles.signatureLabel }, displayRole),
    signatureData
      ? React.createElement(Image, { src: signatureData, style: styles.signatureImage })
      : React.createElement(View, { style: styles.signatureLine }),
    signedBy
      ? React.createElement(Text, { style: styles.signatureInfo }, `Signed by: ${signedBy}`)
      : null,
    signedAt
      ? React.createElement(
          Text,
          { style: styles.signatureInfo },
          `Date: ${new Date(signedAt).toLocaleDateString()}`
        )
      : null
  )
}

// Pricing Table Block Component
interface PricingItem {
  id: string
  name?: string
  description?: string
  quantity: number
  unitPrice: number
  isOptional?: boolean
  isSelected?: boolean
}

interface PricingTableBlockProps {
  items: PricingItem[]
  currency?: string
  title?: string
  showDescription?: boolean
  taxRate?: number
  taxLabel?: string
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
}

function PricingTableBlockPDF({
  items,
  currency = 'USD',
  title,
  showDescription = true,
  taxRate = 0,
  taxLabel = 'Tax',
  discountType,
  discountValue,
}: PricingTableBlockProps) {
  // Filter selected items
  const selectedItems = items.filter((item) => !item.isOptional || item.isSelected)

  // Calculate subtotal
  const subtotal = selectedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  // Calculate discount
  let discount = 0
  if (discountValue && discountType) {
    discount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue
  }

  // Calculate tax
  const taxableAmount = subtotal - discount
  const tax = taxRate ? taxableAmount * (taxRate / 100) : 0

  // Calculate total
  const total = taxableAmount + tax

  return React.createElement(
    View,
    { style: styles.pricingTable },
    title ? React.createElement(Text, { style: styles.pricingTitle }, title) : null,
    // Header
    React.createElement(
      View,
      { style: styles.tableHeader },
      React.createElement(Text, { style: [styles.tableCellHeader, { flex: 2 }] }, 'Item'),
      showDescription
        ? React.createElement(Text, { style: [styles.tableCellHeader, { flex: 2 }] }, 'Description')
        : null,
      React.createElement(Text, { style: styles.tableCellHeader }, 'Qty'),
      React.createElement(Text, { style: [styles.tableCellHeader, { textAlign: 'right' }] }, 'Price'),
      React.createElement(Text, { style: [styles.tableCellHeader, { textAlign: 'right' }] }, 'Total')
    ),
    // Rows
    ...selectedItems.map((item) =>
      React.createElement(
        View,
        { style: styles.tableRow, key: item.id },
        React.createElement(Text, { style: [styles.tableCell, { flex: 2 }] }, item.name || item.description),
        showDescription && item.description && item.name
          ? React.createElement(Text, { style: [styles.tableCell, { flex: 2 }] }, item.description)
          : null,
        React.createElement(Text, { style: styles.tableCell }, String(item.quantity)),
        React.createElement(
          Text,
          { style: styles.tableCellRight },
          formatCurrency(item.unitPrice, currency)
        ),
        React.createElement(
          Text,
          { style: styles.tableCellRight },
          formatCurrency(item.quantity * item.unitPrice, currency)
        )
      )
    ),
    // Subtotal
    React.createElement(
      View,
      { style: styles.tableRow },
      React.createElement(Text, { style: styles.totalLabel }, 'Subtotal'),
      React.createElement(Text, { style: styles.totalValue }, formatCurrency(subtotal, currency))
    ),
    // Discount
    discount > 0
      ? React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: styles.totalLabel }, 'Discount'),
          React.createElement(Text, { style: styles.totalValue }, `-${formatCurrency(discount, currency)}`)
        )
      : null,
    // Tax
    tax > 0
      ? React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: styles.totalLabel }, `${taxLabel} (${taxRate}%)`),
          React.createElement(Text, { style: styles.totalValue }, formatCurrency(tax, currency))
        )
      : null,
    // Total
    React.createElement(
      View,
      { style: styles.totalRow },
      React.createElement(Text, { style: styles.totalLabel }, 'Total'),
      React.createElement(Text, { style: styles.totalValue }, formatCurrency(total, currency))
    )
  )
}

// Table Block Component
interface TableBlockProps {
  headers?: string[]
  rows?: string[][]
  cells?: string[][]
}

function TableBlockPDF({ headers, rows, cells }: TableBlockProps) {
  const dataRows = rows || cells || []
  return React.createElement(
    View,
    { style: styles.table },
    // Header row
    headers
      ? React.createElement(
          View,
          { style: styles.tableHeader },
          ...headers.map((header, i) =>
            React.createElement(Text, { style: styles.tableCellHeader, key: i }, header)
          )
        )
      : null,
    // Data rows
    ...dataRows.map((row, rowIndex) =>
      React.createElement(
        View,
        { style: styles.tableRow, key: rowIndex },
        ...row.map((cell, cellIndex) =>
          React.createElement(Text, { style: styles.tableCell, key: cellIndex }, cell)
        )
      )
    )
  )
}

// Block renderer
function renderBlock(block: Block, index: number, recipients?: Recipient[]) {
  // Handle both old database types and new builder types
  const blockData = (block as { data?: Record<string, unknown> }).data || block

  switch (block.type) {
    case 'text':
      return React.createElement(TextBlockPDF, {
        key: block.id || index,
        content: (blockData as { content?: string }).content || '',
        alignment: (blockData as { alignment?: string }).alignment,
        fontSize: (blockData as { fontSize?: string }).fontSize,
      })

    case 'heading':
      return React.createElement(HeadingBlockPDF, {
        key: block.id || index,
        content: (blockData as { content?: string }).content || '',
        level: (blockData as { level?: number }).level,
      })

    case 'image':
      return React.createElement(ImageBlockPDF, {
        key: block.id || index,
        src: (blockData as { src?: string; url?: string }).src || (blockData as { url?: string }).url || '',
        alt: (blockData as { alt?: string }).alt,
        caption: (blockData as { caption?: string }).caption,
        width: (blockData as { width?: number }).width,
      })

    case 'divider':
      return React.createElement(DividerBlockPDF, {
        key: block.id || index,
        style: (blockData as { style?: 'solid' | 'dashed' | 'dotted' }).style,
      })

    case 'spacer':
      return React.createElement(SpacerBlockPDF, {
        key: block.id || index,
        size: (blockData as { size?: 'small' | 'medium' | 'large' }).size,
        height: (blockData as { height?: number }).height,
      })

    case 'signature': {
      // Find recipient signature data if available
      const recipientId = (block as { recipientId?: string }).recipientId
      const recipient = recipients?.find((r) => r.id === recipientId)
      return React.createElement(SignatureBlockPDF, {
        key: block.id || index,
        signatureData:
          recipient?.signatureData?.data ||
          (blockData as { signedData?: string; signatureData?: string; signatureValue?: string }).signedData ||
          (blockData as { signatureData?: string }).signatureData ||
          (blockData as { signatureValue?: string }).signatureValue,
        signedAt:
          (recipient?.signedAt ? recipient.signedAt.toISOString() : undefined) ||
          (blockData as { signedAt?: string }).signedAt,
        signedBy: recipient?.name || (blockData as { signedBy?: string }).signedBy,
        signerRole: (blockData as { signerRole?: string }).signerRole,
        role: (blockData as { role?: string }).role,
      })
    }

    case 'pricing-table':
      return React.createElement(PricingTableBlockPDF, {
        key: block.id || index,
        items: (blockData as { items?: PricingItem[] }).items || [],
        currency: (blockData as { currency?: string }).currency,
        title: (blockData as { title?: string }).title,
        showDescription: (blockData as { showDescription?: boolean }).showDescription,
        taxRate: (blockData as { taxRate?: number }).taxRate,
        taxLabel: (blockData as { taxLabel?: string }).taxLabel,
        discountType: (blockData as { discountType?: 'percentage' | 'fixed' }).discountType,
        discountValue: (blockData as { discountValue?: number }).discountValue,
      })

    case 'table':
      return React.createElement(TableBlockPDF, {
        key: block.id || index,
        headers: (blockData as { headers?: string[] }).headers,
        rows: (blockData as { rows?: string[][] }).rows,
        cells: (blockData as { cells?: string[][] }).cells,
      })

    default:
      // Skip unsupported blocks (like video)
      return null
  }
}

// Document Component
interface DocumentComponentProps {
  document: Document
  recipients?: Recipient[]
}

function DocumentComponent({ document, recipients }: DocumentComponentProps) {
  const blocks = document.content || []

  return React.createElement(
    PDFDocument,
    {},
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, document.title),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `Created: ${document.createdAt ? new Date(document.createdAt).toLocaleDateString() : ''}`
        )
      ),
      // Content
      ...blocks.map((block, index) => renderBlock(block as Block, index, recipients)).filter(Boolean),
      // Footer
      React.createElement(
        Text,
        {
          style: styles.footer,
          render: ({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`,
          fixed: true,
        }
      )
    )
  )
}

// Generate PDF buffer from document
export async function generatePdfBuffer(
  document: Document,
  recipients?: Recipient[]
): Promise<Buffer> {
  const element = React.createElement(DocumentComponent, { document, recipients })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any)
  return Buffer.from(buffer)
}

// Export types for use in other files
export type { DocumentComponentProps, PricingItem }
