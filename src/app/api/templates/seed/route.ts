import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

const starterTemplates = [
  {
    title: "Basic Proposal",
    templateCategory: "Proposals",
    content: [
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "PROPOSAL",
          fontSize: 32,
          alignment: "center",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 24 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Prepared for: [Client Name]\nPrepared by: [Your Company]\nDate: [Date]",
          fontSize: 16,
          alignment: "left",
          color: "#666666",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "divider",
        data: { style: "solid", thickness: 1, color: "#e5e5e5" },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Executive Summary",
          fontSize: 24,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Thank you for considering our services. This proposal outlines our approach to helping you achieve your goals. We're excited about the opportunity to work together and deliver exceptional results.",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 16 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Scope of Work",
          fontSize: 24,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "• Discovery and requirements gathering\n• Design and planning phase\n• Development and implementation\n• Testing and quality assurance\n• Launch and deployment\n• Post-launch support",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 16 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Investment",
          fontSize: 24,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "pricing-table",
        data: {
          title: "Project Pricing",
          items: [
            { id: uuidv4(), description: "Discovery & Planning", quantity: 1, unitPrice: 2500 },
            { id: uuidv4(), description: "Design & Development", quantity: 1, unitPrice: 7500 },
            { id: uuidv4(), description: "Testing & Launch", quantity: 1, unitPrice: 2000 },
          ],
          showTotal: true,
          currency: "USD",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 24 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Agreement",
          fontSize: 24,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "By signing below, you agree to the terms outlined in this proposal.",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "signature",
        data: { role: "Client", required: true },
      },
    ],
  },
  {
    title: "Service Agreement",
    templateCategory: "Contracts",
    content: [
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "SERVICE AGREEMENT",
          fontSize: 32,
          alignment: "center",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 16 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "This Service Agreement (\"Agreement\") is entered into as of [Date] by and between:",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "[Your Company Name] (\"Service Provider\")\nand\n[Client Name] (\"Client\")",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "divider",
        data: { style: "solid", thickness: 1, color: "#e5e5e5" },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "1. Services",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "The Service Provider agrees to provide the following services to the Client:\n\n[Describe services in detail]",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "2. Compensation",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "pricing-table",
        data: {
          title: "Service Fees",
          items: [
            { id: uuidv4(), description: "Monthly Retainer", quantity: 1, unitPrice: 3000 },
          ],
          showTotal: true,
          currency: "USD",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "3. Term",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "This Agreement shall commence on [Start Date] and continue for a period of [Duration], unless terminated earlier in accordance with the terms herein.",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "4. Termination",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Either party may terminate this Agreement with 30 days written notice. Upon termination, the Client shall pay for all services rendered up to the termination date.",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 24 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Signatures",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "signature",
        data: { role: "Service Provider", required: true },
      },
      {
        id: uuidv4(),
        type: "signature",
        data: { role: "Client", required: true },
      },
    ],
  },
  {
    title: "Project Quote",
    templateCategory: "Quotes",
    content: [
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "PROJECT QUOTE",
          fontSize: 32,
          alignment: "center",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Quote #: [Quote Number]\nDate: [Date]\nValid Until: [Expiry Date]",
          fontSize: 14,
          alignment: "right",
          color: "#666666",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "divider",
        data: { style: "solid", thickness: 2, color: "#000000" },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Prepared For:",
          fontSize: 14,
          alignment: "left",
          color: "#666666",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "[Client Name]\n[Client Company]\n[Client Email]",
          fontSize: 16,
          alignment: "left",
          color: "#000000",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 24 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Project Description",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "[Describe the project scope, deliverables, and timeline here]",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 16 },
      },
      {
        id: uuidv4(),
        type: "pricing-table",
        data: {
          title: "Quote Details",
          items: [
            { id: uuidv4(), description: "Item 1 - Description", quantity: 1, unitPrice: 1000 },
            { id: uuidv4(), description: "Item 2 - Description", quantity: 2, unitPrice: 500 },
            { id: uuidv4(), description: "Item 3 - Description", quantity: 1, unitPrice: 750 },
          ],
          showTotal: true,
          currency: "USD",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 16 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Terms & Conditions",
          fontSize: 18,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "• 50% deposit required to begin work\n• Balance due upon completion\n• Quote valid for 30 days\n• Prices subject to change after expiry",
          fontSize: 14,
          alignment: "left",
          color: "#666666",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 24 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "To accept this quote, please sign below:",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "signature",
        data: { role: "Client Approval", required: true },
      },
    ],
  },
  {
    title: "Freelance Contract",
    templateCategory: "Contracts",
    content: [
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "FREELANCE SERVICE CONTRACT",
          fontSize: 28,
          alignment: "center",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "divider",
        data: { style: "solid", thickness: 2, color: "#333333" },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "This Contract is entered into between:\n\nFreelancer: [Your Name]\nClient: [Client Name]\nEffective Date: [Date]",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 16 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Project Scope",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "[Detailed description of the work to be performed, deliverables, and milestones]",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Timeline",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Start Date: [Start Date]\nEnd Date: [End Date]\n\nMilestones:\n• Milestone 1: [Date]\n• Milestone 2: [Date]\n• Final Delivery: [Date]",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Payment Terms",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "pricing-table",
        data: {
          title: "Project Fee",
          items: [
            { id: uuidv4(), description: "Deposit (50%)", quantity: 1, unitPrice: 2500 },
            { id: uuidv4(), description: "Final Payment (50%)", quantity: 1, unitPrice: 2500 },
          ],
          showTotal: true,
          currency: "USD",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Intellectual Property",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Upon full payment, all intellectual property rights for the deliverables shall transfer to the Client. Until payment is received, the Freelancer retains all rights.",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Revisions",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "This contract includes [X] rounds of revisions. Additional revisions will be billed at $[Rate]/hour.",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "spacer",
        data: { height: 24 },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "Agreement",
          fontSize: 20,
          alignment: "left",
          color: "#000000",
          fontWeight: "bold",
        },
      },
      {
        id: uuidv4(),
        type: "text",
        data: {
          content: "By signing below, both parties agree to the terms outlined in this contract.",
          fontSize: 16,
          alignment: "left",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      {
        id: uuidv4(),
        type: "signature",
        data: { role: "Freelancer", required: true },
      },
      {
        id: uuidv4(),
        type: "signature",
        data: { role: "Client", required: true },
      },
    ],
  },
]

export async function POST() {
  try {
    const session = await auth()

    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has templates
    const existingTemplates = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(eq(documents.userId, userId), eq(documents.isTemplate, true)))
      .limit(1)

    if (existingTemplates.length > 0) {
      return NextResponse.json({ message: "Templates already exist", count: 0 })
    }

    // Insert starter templates - available to ALL users regardless of plan
    const insertedTemplates = await db
      .insert(documents)
      .values(
        starterTemplates.map((template) => ({
          userId,
          title: template.title,
          templateCategory: template.templateCategory,
          content: template.content,
          status: "draft" as const,
          isTemplate: true,
          variables: {},
          settings: {},
        }))
      )
      .returning()

    return NextResponse.json({
      message: "Templates created successfully",
      count: insertedTemplates.length,
    })
  } catch (error) {
    console.error("Error seeding templates:", error)
    return NextResponse.json({ error: "Failed to seed templates" }, { status: 500 })
  }
}
