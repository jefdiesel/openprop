"use client";

import { useCallback, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PenLine, Type, Trash2, Check, AlertCircle } from "lucide-react";
import type {
  SignatureBlockData,
  BlockComponentProps,
  SignatureType,
} from "@/types/blocks";

const signatureFonts = [
  { name: "Cursive", className: "font-cursive", style: "cursive" },
  { name: "Script", className: "font-serif italic", style: "italic" },
  { name: "Formal", className: "font-serif", style: "serif" },
];

export function SignatureBlock({
  block,
  mode,
  onChange,
}: BlockComponentProps<SignatureBlockData>) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [typedSignature, setTypedSignature] = useState(block.signatureValue || "");
  const [selectedFont, setSelectedFont] = useState(0);

  const handleSignerRoleChange = useCallback(
    (signerRole: string) => {
      if (onChange) {
        onChange({ ...block, signerRole });
      }
    },
    [block, onChange]
  );

  const handleRequiredChange = useCallback(
    (required: boolean) => {
      if (onChange) {
        onChange({ ...block, required });
      }
    },
    [block, onChange]
  );

  const handleSignatureTypeChange = useCallback(
    (signatureType: SignatureType) => {
      if (onChange) {
        onChange({ ...block, signatureType, signatureValue: undefined });
      }
      setTypedSignature("");
      signatureRef.current?.clear();
    },
    [block, onChange]
  );

  const handleClearSignature = useCallback(() => {
    signatureRef.current?.clear();
    setTypedSignature("");
    if (onChange) {
      onChange({
        ...block,
        signatureValue: undefined,
        signedAt: undefined,
        signedBy: undefined,
      });
    }
  }, [block, onChange]);

  const handleSaveDrawnSignature = useCallback(() => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const dataUrl = signatureRef.current.toDataURL("image/png");
      if (onChange) {
        onChange({
          ...block,
          signatureValue: dataUrl,
          signedAt: new Date().toISOString(),
        });
      }
    }
  }, [block, onChange]);

  const handleSaveTypedSignature = useCallback(() => {
    if (typedSignature.trim()) {
      if (onChange) {
        onChange({
          ...block,
          signatureValue: typedSignature,
          signedAt: new Date().toISOString(),
        });
      }
    }
  }, [block, onChange, typedSignature]);

  // Edit mode - show placeholder for builder
  if (mode === "edit") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <PenLine className="h-8 w-8 text-muted-foreground/50" />
            <div>
              <p className="font-medium text-muted-foreground">
                Signature: {block.signerRole}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {block.required ? "Required" : "Optional"} signature field
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="signer-role">Signer Role</Label>
              <Input
                id="signer-role"
                type="text"
                placeholder="e.g., Client, Contractor"
                value={block.signerRole}
                onChange={(e) => handleSignerRoleChange(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signature-type">Signature Type</Label>
              <Select
                value={block.signatureType}
                onValueChange={(v) => handleSignatureTypeChange(v as SignatureType)}
              >
                <SelectTrigger id="signature-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draw">Draw</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="signature-required"
              checked={block.required}
              onCheckedChange={(checked) => handleRequiredChange(!!checked)}
            />
            <Label htmlFor="signature-required" className="text-sm">
              Required signature
            </Label>
          </div>
        </div>
      </div>
    );
  }

  // View mode - show signed signature or empty state
  if (mode === "view") {
    if (block.signatureValue) {
      return (
        <div className="space-y-2">
          <Label className="text-muted-foreground">
            {block.signerRole}
            {block.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="rounded-md border bg-muted/30 p-4">
            {block.signatureType === "draw" ? (
              <img
                src={block.signatureValue}
                alt={`Signature of ${block.signerRole}`}
                className="max-h-24"
              />
            ) : (
              <p
                className="text-2xl"
                style={{ fontFamily: "cursive" }}
              >
                {block.signatureValue}
              </p>
            )}
            {block.signedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Signed on {new Date(block.signedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label className="text-muted-foreground">
          {block.signerRole}
          {block.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="rounded-md border border-dashed bg-muted/30 p-4 text-center text-muted-foreground">
          Awaiting signature
        </div>
      </div>
    );
  }

  // Sign mode - interactive signature pad
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          {block.signerRole}
          {block.required && (
            <span className="text-destructive ml-1" title="Required">
              *
            </span>
          )}
        </Label>
        {block.required && !block.signatureValue && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            Required
          </span>
        )}
      </div>

      {block.signatureValue ? (
        <div className="space-y-2">
          <div className="rounded-md border bg-muted/30 p-4 flex items-center justify-between">
            {block.signatureType === "draw" ? (
              <img
                src={block.signatureValue}
                alt={`Signature of ${block.signerRole}`}
                className="max-h-20"
              />
            ) : (
              <p
                className="text-2xl"
                style={{ fontFamily: signatureFonts[selectedFont].style }}
              >
                {block.signatureValue}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Signed</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearSignature}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Signature
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={block.signatureType === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSignatureTypeChange("draw")}
            >
              <PenLine className="h-4 w-4 mr-2" />
              Draw
            </Button>
            <Button
              type="button"
              variant={block.signatureType === "type" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSignatureTypeChange("type")}
            >
              <Type className="h-4 w-4 mr-2" />
              Type
            </Button>
          </div>

          {block.signatureType === "draw" ? (
            <div className="space-y-2">
              <div className="rounded-md border bg-white">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: "w-full h-40 cursor-crosshair",
                  }}
                  backgroundColor="white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => signatureRef.current?.clear()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveDrawnSignature}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept Signature
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Type your full name"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                className="text-lg"
              />

              {typedSignature && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Select a style:
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {signatureFonts.map((font, index) => (
                      <button
                        key={font.name}
                        type="button"
                        className={cn(
                          "rounded-md border p-3 text-xl transition-colors",
                          font.className,
                          selectedFont === index
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/50"
                        )}
                        onClick={() => setSelectedFont(index)}
                        style={{ fontFamily: font.style }}
                      >
                        {typedSignature}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="button"
                size="sm"
                onClick={handleSaveTypedSignature}
                disabled={!typedSignature.trim()}
              >
                <Check className="h-4 w-4 mr-2" />
                Accept Signature
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
