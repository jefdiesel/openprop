"use client"

import { useState, useCallback, useTransition } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { z } from "zod"
import {
  Send,
  Plus,
  Calendar,
  Lock,
  Users,
  Mail,
  Eye,
  Loader2,
  AlertCircle,
  CreditCard,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { RecipientInput, type Recipient, type RecipientRole } from "./recipient-input"
import { EmailPreview } from "./email-preview"
import { sendDocument, type SendDocumentInput } from "@/lib/send-document"
import {
  PaymentSettingsPanel,
  defaultPaymentSettings,
  type PaymentSettings
} from "@/components/builder/payment-settings"

interface SendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string
  documentTitle: string
  senderName?: string
  senderEmail?: string
  onSuccess?: () => void
  hasPricingTable?: boolean
  pricingTableTotal?: number
  stripeConnected?: boolean
}

const emailSchema = z.string().email()

export function SendDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  senderName = "",
  senderEmail,
  onSuccess,
  hasPricingTable = false,
  pricingTableTotal = 0,
  stripeConnected = false,
}: SendDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Recipients state
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: uuidv4(), email: "", name: "", role: "signer" },
  ])
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({})

  // Signing options
  const [signingOrder, setSigningOrder] = useState<"sequential" | "parallel">("parallel")

  // Email customization
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")

  // Advanced options
  const [expiresAt, setExpiresAt] = useState("")
  const [passwordProtected, setPasswordProtected] = useState(false)

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings)

  // Active tab
  const [activeTab, setActiveTab] = useState("recipients")

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAddRecipient = useCallback(() => {
    const newRecipient: Recipient = {
      id: uuidv4(),
      email: "",
      name: "",
      role: "signer",
    }
    setRecipients((prev) => [...prev, newRecipient])
  }, [])

  const handleUpdateRecipient = useCallback(
    (id: string, updates: Partial<Recipient>) => {
      setRecipients((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      )

      // Clear email error when user updates email
      if (updates.email !== undefined) {
        setEmailErrors((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    },
    []
  )

  const handleRemoveRecipient = useCallback((id: string) => {
    setRecipients((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((r) => r.id !== id)
    })
    setEmailErrors((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setRecipients((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const validateRecipients = useCallback((): boolean => {
    const errors: Record<string, string> = {}
    let isValid = true

    for (const recipient of recipients) {
      if (!recipient.email.trim()) {
        errors[recipient.id] = "Email is required"
        isValid = false
      } else {
        try {
          emailSchema.parse(recipient.email)
        } catch {
          errors[recipient.id] = "Invalid email address"
          isValid = false
        }
      }
    }

    // Check for duplicate emails
    const emails = recipients.map((r) => r.email.toLowerCase().trim())
    const duplicates = emails.filter((e, i) => e && emails.indexOf(e) !== i)

    for (const recipient of recipients) {
      if (duplicates.includes(recipient.email.toLowerCase().trim())) {
        errors[recipient.id] = "Duplicate email address"
        isValid = false
      }
    }

    setEmailErrors(errors)
    return isValid
  }, [recipients])

  const handleSend = useCallback(() => {
    setError(null)

    if (!validateRecipients()) {
      setActiveTab("recipients")
      return
    }

    startTransition(async () => {
      const input: SendDocumentInput = {
        documentId,
        documentTitle,
        recipients: recipients.map((r) => ({
          id: r.id,
          email: r.email.trim(),
          name: r.name.trim(),
          role: r.role,
        })),
        signingOrder,
        emailSubject: emailSubject.trim() || undefined,
        emailMessage: emailMessage.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        passwordProtected,
        senderName,
        senderEmail,
        // Payment settings
        paymentEnabled: paymentSettings.enabled,
        paymentTiming: paymentSettings.enabled ? paymentSettings.timing : undefined,
        paymentAmount: paymentSettings.enabled
          ? paymentSettings.amountType === "fixed"
            ? paymentSettings.fixedAmount
            : pricingTableTotal
          : undefined,
        paymentCurrency: paymentSettings.enabled ? paymentSettings.currency : undefined,
      }

      const result = await sendDocument(input)

      if (result.success) {
        onOpenChange(false)
        onSuccess?.()
        // Reset form
        setRecipients([{ id: uuidv4(), email: "", name: "", role: "signer" }])
        setEmailSubject("")
        setEmailMessage("")
        setExpiresAt("")
        setPasswordProtected(false)
        setPaymentSettings(defaultPaymentSettings)
        setActiveTab("recipients")
      } else {
        setError(result.error || "Failed to send document")
      }
    })
  }, [
    validateRecipients,
    documentId,
    documentTitle,
    recipients,
    signingOrder,
    emailSubject,
    emailMessage,
    expiresAt,
    passwordProtected,
    senderName,
    senderEmail,
    onOpenChange,
    onSuccess,
    paymentSettings,
    pricingTableTotal,
  ])

  const getMinExpirationDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Document
          </DialogTitle>
          <DialogDescription>
            Send "{documentTitle}" to recipients for signing, viewing, or approval.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recipients" className="gap-2">
              <Users className="h-4 w-4" />
              Recipients
            </TabsTrigger>
            <TabsTrigger value="message" className="gap-2">
              <Mail className="h-4 w-4" />
              Message
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent value="recipients" className="m-0 space-y-4">
              {/* Signing Order */}
              <div className="space-y-2">
                <Label>Signing Order</Label>
                <Select
                  value={signingOrder}
                  onValueChange={(v: "sequential" | "parallel") => setSigningOrder(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parallel">
                      <div className="flex flex-col items-start">
                        <span>Parallel</span>
                        <span className="text-xs text-muted-foreground">
                          All recipients can sign at the same time
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sequential">
                      <div className="flex flex-col items-start">
                        <span>Sequential</span>
                        <span className="text-xs text-muted-foreground">
                          Recipients sign in order (drag to reorder)
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Recipients List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Recipients</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRecipient}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Recipient
                  </Button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={recipients.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {recipients.map((recipient, index) => (
                        <div key={recipient.id} className="flex items-start gap-2">
                          {signingOrder === "sequential" && (
                            <div className="flex h-9 w-6 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground">
                              {index + 1}
                            </div>
                          )}
                          <div className="flex-1">
                            <RecipientInput
                              recipient={recipient}
                              onUpdate={handleUpdateRecipient}
                              onRemove={handleRemoveRecipient}
                              showDragHandle={signingOrder === "sequential"}
                              emailError={emailErrors[recipient.id]}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              <Separator />

              {/* Advanced Options */}
              <div className="space-y-4">
                <Label className="text-muted-foreground">Advanced Options</Label>

                <div className="space-y-2">
                  <Label htmlFor="expires-at" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expiration Date
                  </Label>
                  <Input
                    id="expires-at"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={getMinExpirationDate()}
                    className="w-full sm:w-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no expiration
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="password-protected"
                    checked={passwordProtected}
                    onCheckedChange={(checked) =>
                      setPasswordProtected(checked === true)
                    }
                  />
                  <Label
                    htmlFor="password-protected"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="h-4 w-4" />
                    Password protect document
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="message" className="m-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Email Subject (optional)</Label>
                <Input
                  id="email-subject"
                  placeholder={`${senderName || "You"} shared "${documentTitle}" with you`}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message">Custom Message (optional)</Label>
                <Textarea
                  id="email-message"
                  placeholder="Add a personal message to include in the email..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="payment" className="m-0 space-y-4">
              {stripeConnected ? (
                <PaymentSettingsPanel
                  settings={paymentSettings}
                  onChange={setPaymentSettings}
                  hasPricingTable={hasPricingTable}
                  pricingTableTotal={pricingTableTotal}
                />
              ) : (
                <div className="rounded-lg border-2 border-dashed p-6 text-center">
                  <CreditCard className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">Connect Stripe to Collect Payments</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Stripe account in Settings to enable payment collection
                    from recipients when they sign your documents.
                  </p>
                  <a
                    href="/settings/stripe-connect"
                    className="text-sm text-primary hover:underline"
                  >
                    Go to Settings → Integrations → Stripe
                  </a>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="m-0">
              <EmailPreview
                subject={
                  emailSubject ||
                  `${senderName || "You"} shared "${documentTitle}" with you`
                }
                message={emailMessage}
                recipientName={recipients[0]?.name || ""}
                senderName={senderName}
                documentTitle={documentTitle}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
