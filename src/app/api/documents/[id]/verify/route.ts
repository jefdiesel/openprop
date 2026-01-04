import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, recipients, documentEvents, payments } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import {
  isBlockchainConfigured,
  hashDocumentData,
  hashContent,
  hashEmail,
  inscribeHash,
  verifyInscription,
  getBaseScanUrl,
  getChainInfo,
  type DocumentHashData,
} from '@/lib/blockchain';
import type { Hash } from 'viem';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/documents/[id]/verify - Check verification status
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [document] = await db.select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const configured = isBlockchainConfigured();

    if (!document.blockchainTxHash) {
      return NextResponse.json({
        verified: false,
        configured,
        canVerify: configured && document.status === 'completed',
        chainInfo: configured ? getChainInfo() : null,
      });
    }

    // Get signers for hash verification
    const signersList = await db.select()
      .from(recipients)
      .where(and(eq(recipients.documentId, id), eq(recipients.role, 'signer')));

    // Check if payment was collected
    const [payment] = await db.select()
      .from(payments)
      .where(and(eq(payments.documentId, id), eq(payments.status, 'succeeded')))
      .limit(1);

    // Recreate hash
    const hashData: DocumentHashData = {
      documentId: document.id,
      contentHash: hashContent(document.content as unknown[]),
      signers: signersList
        .filter(s => s.signedAt)
        .map(s => ({
          emailHash: hashEmail(s.email),
          signedAt: s.signedAt!.toISOString(),
        })),
      paymentCollected: !!payment,
      completedAt: document.blockchainVerifiedAt?.toISOString() || new Date().toISOString(),
    };

    const documentHash = hashDocumentData(hashData);

    // Verify on chain
    const verification = await verifyInscription(
      document.blockchainTxHash as Hash,
      documentHash
    );

    return NextResponse.json({
      verified: verification.verified,
      configured: true,
      txHash: document.blockchainTxHash,
      documentHash,
      verifiedAt: document.blockchainVerifiedAt?.toISOString(),
      blockNumber: verification.blockNumber?.toString(),
      chainTimestamp: verification.timestamp?.toISOString(),
      baseScanUrl: getBaseScanUrl(document.blockchainTxHash as Hash),
      chainInfo: getChainInfo(),
      error: verification.error,
    });
  } catch (error) {
    console.error('Error in GET /api/documents/[id]/verify:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/documents/[id]/verify - Inscribe document hash
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isBlockchainConfigured()) {
      return NextResponse.json(
        { error: 'Blockchain not configured' },
        { status: 503 }
      );
    }

    const [document] = await db.select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.blockchainTxHash) {
      return NextResponse.json(
        {
          error: 'Already inscribed',
          txHash: document.blockchainTxHash,
          baseScanUrl: getBaseScanUrl(document.blockchainTxHash as Hash),
        },
        { status: 400 }
      );
    }

    if (document.status !== 'completed') {
      return NextResponse.json(
        { error: 'Document must be completed first' },
        { status: 400 }
      );
    }

    // Get signers
    const signersList = await db.select()
      .from(recipients)
      .where(and(eq(recipients.documentId, id), eq(recipients.role, 'signer')));

    const allSigned = signersList.every(s => s.signedAt);
    if (!allSigned) {
      return NextResponse.json(
        { error: 'All parties must sign first' },
        { status: 400 }
      );
    }

    // Check payment
    const [payment] = await db.select()
      .from(payments)
      .where(and(eq(payments.documentId, id), eq(payments.status, 'succeeded')))
      .limit(1);

    const now = new Date();

    // Create hash
    const hashData: DocumentHashData = {
      documentId: document.id,
      contentHash: hashContent(document.content as unknown[]),
      signers: signersList.map(s => ({
        emailHash: hashEmail(s.email),
        signedAt: s.signedAt!.toISOString(),
      })),
      paymentCollected: !!payment,
      completedAt: now.toISOString(),
    };

    const documentHash = hashDocumentData(hashData);

    // Inscribe on Base
    const result = await inscribeHash(documentHash);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Inscription failed', details: result.error },
        { status: 500 }
      );
    }

    // Update document
    await db.update(documents)
      .set({
        blockchainTxHash: result.txHash,
        blockchainVerifiedAt: now,
        updatedAt: now,
      })
      .where(eq(documents.id, id));

    // Log event
    await db.insert(documentEvents).values({
      documentId: id,
      eventType: 'blockchain_verified',
      eventData: {
        txHash: result.txHash,
        documentHash,
        chainId: getChainInfo().chainId,
      },
    });

    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      documentHash,
      verifiedAt: now.toISOString(),
      baseScanUrl: getBaseScanUrl(result.txHash!),
    });
  } catch (error) {
    console.error('Error in POST /api/documents/[id]/verify:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
