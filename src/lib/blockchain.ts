import { createPublicClient, createWalletClient, http, keccak256, toHex, type Hash, type Address } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Types
export interface DocumentHashData {
  documentId: string;
  contentHash: string;
  signers: {
    emailHash: string;
    signedAt: string;
  }[];
  paymentCollected: boolean;
  completedAt: string;
}

export interface InscriptionResult {
  success: boolean;
  txHash?: Hash;
  documentHash?: Hash;
  error?: string;
}

// Configuration - Base Mainnet
const BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'https://mainnet.base.org';
const BLOCKCHAIN_PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;

export function isBlockchainConfigured(): boolean {
  return !!BLOCKCHAIN_PRIVATE_KEY;
}

export function getPublicClient() {
  return createPublicClient({
    chain: base,
    transport: http(BLOCKCHAIN_RPC_URL),
  });
}

export function getWalletClient() {
  if (!BLOCKCHAIN_PRIVATE_KEY) {
    throw new Error('BLOCKCHAIN_PRIVATE_KEY environment variable is not set');
  }

  const formattedKey = BLOCKCHAIN_PRIVATE_KEY.startsWith('0x')
    ? BLOCKCHAIN_PRIVATE_KEY as `0x${string}`
    : `0x${BLOCKCHAIN_PRIVATE_KEY}` as `0x${string}`;

  const account = privateKeyToAccount(formattedKey);

  return createWalletClient({
    account,
    chain: base,
    transport: http(BLOCKCHAIN_RPC_URL),
  });
}

/**
 * Hash an email for privacy
 */
export function hashEmail(email: string): string {
  return keccak256(toHex(email.toLowerCase().trim()));
}

/**
 * Hash document content
 */
export function hashContent(content: unknown[]): string {
  return keccak256(toHex(JSON.stringify(content)));
}

/**
 * Create the document verification hash
 */
export function hashDocumentData(data: DocumentHashData): Hash {
  const sortedSigners = [...data.signers].sort((a, b) =>
    a.emailHash.localeCompare(b.emailHash)
  );

  const canonicalData = {
    documentId: data.documentId,
    contentHash: data.contentHash,
    signers: sortedSigners,
    paymentCollected: data.paymentCollected,
    completedAt: data.completedAt,
  };

  return keccak256(toHex(JSON.stringify(canonicalData)));
}

/**
 * Create inscription payload
 */
export function createInscriptionPayload(documentHash: Hash): string {
  const inscription = {
    type: "OpenProposal Inscription",
    note: "Digital proof of signature",
    hash: documentHash,
    timestamp: new Date().toISOString(),
  };
  return Buffer.from(JSON.stringify(inscription)).toString('base64');
}

/**
 * Inscribe document hash on Base
 * Stores base64 encoded inscription with proof note
 */
export async function inscribeHash(documentHash: Hash): Promise<InscriptionResult> {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      error: 'Blockchain not configured',
    };
  }

  try {
    const walletClient = getWalletClient();
    const publicClient = getPublicClient();

    // Create base64 encoded inscription
    const payload = createInscriptionPayload(documentHash);
    const txData = toHex(payload) as `0x${string}`;

    const txHash = await walletClient.sendTransaction({
      to: walletClient.account.address,
      value: BigInt(0),
      data: txData,
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });

    if (receipt.status === 'success') {
      return {
        success: true,
        txHash,
        documentHash,
      };
    } else {
      return {
        success: false,
        error: 'Transaction failed',
      };
    }
  } catch (error) {
    console.error('Error inscribing hash:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Decode inscription from transaction data
 */
export function decodeInscription(txData: string): {
  type?: string;
  note?: string;
  hash?: string;
  timestamp?: string;
} | null {
  try {
    // Remove 0x prefix and decode hex to string
    const hexString = txData.slice(2);
    let decoded = '';
    for (let i = 0; i < hexString.length; i += 2) {
      decoded += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
    }
    // Decode base64
    const json = Buffer.from(decoded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Verify hash on chain
 */
export async function verifyInscription(txHash: Hash, expectedHash: Hash): Promise<{
  verified: boolean;
  inscription?: { type: string; note: string; hash: string; timestamp: string };
  timestamp?: Date;
  blockNumber?: bigint;
  error?: string;
}> {
  try {
    const publicClient = getPublicClient();
    const tx = await publicClient.getTransaction({ hash: txHash });

    if (!tx) {
      return { verified: false, error: 'Transaction not found' };
    }

    const block = await publicClient.getBlock({ blockNumber: tx.blockNumber! });

    // Decode the inscription
    const inscription = decodeInscription(tx.input);

    if (!inscription || !inscription.hash) {
      return { verified: false, error: 'Invalid inscription format' };
    }

    const verified = inscription.hash.toLowerCase() === expectedHash.toLowerCase();

    return {
      verified,
      inscription: inscription as { type: string; note: string; hash: string; timestamp: string },
      timestamp: new Date(Number(block.timestamp) * 1000),
      blockNumber: tx.blockNumber!,
      error: verified ? undefined : 'Hash mismatch',
    };
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get BaseScan URL (Base Mainnet)
 */
export function getBaseScanUrl(txHash: Hash): string {
  return `https://basescan.org/tx/${txHash}`;
}

export function getChainInfo() {
  return {
    chainId: base.id,
    name: 'Base',
    explorerUrl: 'https://basescan.org',
  };
}
