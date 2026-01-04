"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileCode2, Check, AlertCircle, Copy, ExternalLink } from "lucide-react";
import type {
  DataURIBlockData,
  BlockComponentProps,
  EthscriptionNetwork,
} from "@/types/blocks";
import { toast } from "sonner";

const NETWORKS: { value: EthscriptionNetwork; label: string; explorer: string }[] = [
  { value: "ethereum", label: "Ethereum", explorer: "https://etherscan.io/tx" },
  { value: "base", label: "Base", explorer: "https://basescan.org/tx" },
  { value: "arbitrum", label: "Arbitrum", explorer: "https://arbiscan.io/tx" },
  { value: "optimism", label: "Optimism", explorer: "https://optimistic.etherscan.io/tx" },
  { value: "polygon", label: "Polygon", explorer: "https://polygonscan.com/tx" },
];

export function DataURIBlock({
  block,
  mode,
  onChange,
}: BlockComponentProps<DataURIBlockData>) {
  const [evmAddress, setEvmAddress] = useState(block.recipientAddress || "");
  const [isValidAddress, setIsValidAddress] = useState(false);

  const validateEvmAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddressChange = (address: string) => {
    setEvmAddress(address);
    const valid = validateEvmAddress(address);
    setIsValidAddress(valid);
    if (valid && onChange) {
      onChange({ ...block, recipientAddress: address });
    }
  };

  const handlePayloadChange = useCallback(
    (payload: string) => {
      if (onChange) {
        onChange({ ...block, payload });
      }
    },
    [block, onChange]
  );

  const handleNetworkChange = useCallback(
    (network: EthscriptionNetwork) => {
      if (onChange) {
        onChange({ ...block, network });
      }
    },
    [block, onChange]
  );

  const handleLabelChange = useCallback(
    (label: string) => {
      if (onChange) {
        onChange({ ...block, label });
      }
    },
    [block, onChange]
  );

  const getNetworkExplorer = () => {
    return NETWORKS.find(n => n.value === block.network)?.explorer || "";
  };

  // Edit mode - show full payload editor (creator only)
  if (mode === "edit") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 dark:bg-purple-950/30 p-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center mb-4">
            <FileCode2 className="h-8 w-8 text-purple-500" />
            <div>
              <p className="font-medium text-purple-700 dark:text-purple-300">
                Ethscription Block
              </p>
              <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
                Data will be inscribed on-chain when recipient signs
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="data-uri-label">Label (for your reference)</Label>
              <Input
                id="data-uri-label"
                type="text"
                placeholder="e.g., Contract Hash, Agreement ID"
                value={block.label || ""}
                onChange={(e) => handleLabelChange(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="data-uri-network">Network</Label>
              <Select
                value={block.network}
                onValueChange={(v) => handleNetworkChange(v as EthscriptionNetwork)}
              >
                <SelectTrigger id="data-uri-network">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((network) => (
                    <SelectItem key={network.value} value={network.value}>
                      {network.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="data-uri-payload">
                Base64 Payload
                <span className="text-xs text-muted-foreground ml-2">
                  (hidden from recipient)
                </span>
              </Label>
              <Textarea
                id="data-uri-payload"
                placeholder="Paste your base64 encoded data here..."
                value={block.payload}
                onChange={(e) => handlePayloadChange(e.target.value)}
                rows={4}
                className="font-mono text-xs"
              />
              {block.payload && (
                <p className="text-xs text-muted-foreground">
                  {block.payload.length} characters
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View mode - show minimal info (data is hidden)
  if (mode === "view") {
    // If inscribed, show the transaction
    if (block.inscriptionTxHash) {
      return (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Check className="h-5 w-5" />
            <span className="font-medium">Data Inscribed</span>
          </div>
          <a
            href={`${getNetworkExplorer()}/${block.inscriptionTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-green-600 hover:underline mt-2"
          >
            View on {NETWORKS.find(n => n.value === block.network)?.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      );
    }

    // Pending inscription
    if (block.recipientAddress) {
      return (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 p-4">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Inscription Pending</span>
          </div>
          <p className="text-sm text-yellow-600/80 mt-1">
            To: {block.recipientAddress.slice(0, 6)}...{block.recipientAddress.slice(-4)}
          </p>
        </div>
      );
    }

    // Not yet signed - show nothing to recipient
    return null;
  }

  // Sign mode - show EVM address input after signature
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileCode2 className="h-5 w-5 text-purple-500" />
          <Label className="text-base font-medium text-purple-700 dark:text-purple-300">
            On-Chain Inscription
          </Label>
        </div>

        <p className="text-sm text-purple-600/80 dark:text-purple-400/80 mb-4">
          This document includes data that will be inscribed to {NETWORKS.find(n => n.value === block.network)?.label}.
          Enter your wallet address to receive the inscription.
        </p>

        {block.recipientAddress && isValidAddress ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-mono text-sm">
              {block.recipientAddress.slice(0, 10)}...{block.recipientAddress.slice(-8)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(block.recipientAddress || "");
                toast.success("Address copied");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="evm-address">Your EVM Wallet Address</Label>
            <Input
              id="evm-address"
              type="text"
              placeholder="0x..."
              value={evmAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={cn(
                "font-mono",
                evmAddress && !isValidAddress && "border-destructive"
              )}
            />
            {evmAddress && !isValidAddress && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Invalid EVM address format
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
