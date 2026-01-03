"use client"

import * as React from "react"
import { Check, ChevronDown, Loader2, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface CRMContact {
  id: string
  email: string
  firstName?: string
  lastName?: string
  company?: string
  source: "hubspot" | "salesforce"
}

interface CRMContactPickerProps {
  onSelect: (contact: CRMContact) => void
  selectedEmails?: string[]
  className?: string
}

export function CRMContactPicker({
  onSelect,
  selectedEmails = [],
  className,
}: CRMContactPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [contacts, setContacts] = React.useState<CRMContact[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [connectedCRMs, setConnectedCRMs] = React.useState<{
    hubspot: boolean
    salesforce: boolean
  }>({ hubspot: false, salesforce: false })

  // Check which CRMs are connected
  React.useEffect(() => {
    const checkConnections = async () => {
      try {
        const [hubspotRes, salesforceRes] = await Promise.all([
          fetch("/api/integrations/hubspot/status").catch(() => null),
          fetch("/api/integrations/salesforce/status").catch(() => null),
        ])

        const hubspotData = hubspotRes?.ok ? await hubspotRes.json() : null
        const salesforceData = salesforceRes?.ok ? await salesforceRes.json() : null

        setConnectedCRMs({
          hubspot: hubspotData?.connected || false,
          salesforce: salesforceData?.connected || false,
        })
      } catch {
        // Silently fail - CRMs not connected
      }
    }

    checkConnections()
  }, [])

  // Load contacts when popover opens
  React.useEffect(() => {
    if (!open) return
    if (!connectedCRMs.hubspot && !connectedCRMs.salesforce) return

    const loadContacts = async () => {
      setLoading(true)
      setError(null)

      try {
        const allContacts: CRMContact[] = []

        // Load HubSpot contacts
        if (connectedCRMs.hubspot) {
          try {
            const res = await fetch("/api/integrations/hubspot/contacts?limit=50")
            if (res.ok) {
              const data = await res.json()
              if (data.contacts) {
                allContacts.push(
                  ...data.contacts.map((c: {
                    id: string
                    email: string
                    firstName?: string
                    lastName?: string
                    company?: string
                  }) => ({
                    ...c,
                    source: "hubspot" as const,
                  }))
                )
              }
            }
          } catch {
            console.error("Failed to load HubSpot contacts")
          }
        }

        // Load Salesforce contacts
        if (connectedCRMs.salesforce) {
          try {
            const res = await fetch("/api/integrations/salesforce/contacts?limit=50")
            if (res.ok) {
              const data = await res.json()
              if (data.contacts) {
                allContacts.push(
                  ...data.contacts.map((c: {
                    id: string
                    email: string
                    firstName?: string
                    lastName?: string
                    company?: string
                  }) => ({
                    ...c,
                    source: "salesforce" as const,
                  }))
                )
              }
            }
          } catch {
            console.error("Failed to load Salesforce contacts")
          }
        }

        // Deduplicate by email
        const uniqueContacts = allContacts.reduce((acc, contact) => {
          if (!acc.find((c) => c.email === contact.email)) {
            acc.push(contact)
          }
          return acc
        }, [] as CRMContact[])

        setContacts(uniqueContacts)
      } catch {
        setError("Failed to load contacts")
      } finally {
        setLoading(false)
      }
    }

    loadContacts()
  }, [open, connectedCRMs])

  const hasConnectedCRM = connectedCRMs.hubspot || connectedCRMs.salesforce

  if (!hasConnectedCRM) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
        >
          <Users className="h-4 w-4" />
          Import from CRM
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search contacts..." />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading contacts...
                </span>
              </div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {error}
              </div>
            ) : (
              <>
                <CommandEmpty>No contacts found.</CommandEmpty>
                {connectedCRMs.hubspot && (
                  <CommandGroup heading="HubSpot">
                    {contacts
                      .filter((c) => c.source === "hubspot")
                      .map((contact) => (
                        <CommandItem
                          key={`hubspot-${contact.id}`}
                          value={`${contact.email} ${contact.firstName} ${contact.lastName} ${contact.company}`}
                          onSelect={() => {
                            onSelect(contact)
                            setOpen(false)
                          }}
                          disabled={selectedEmails.includes(contact.email)}
                        >
                          <div className="flex flex-1 items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {contact.firstName} {contact.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {contact.email}
                                {contact.company && ` - ${contact.company}`}
                              </span>
                            </div>
                            {selectedEmails.includes(contact.email) && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                {connectedCRMs.salesforce && (
                  <CommandGroup heading="Salesforce">
                    {contacts
                      .filter((c) => c.source === "salesforce")
                      .map((contact) => (
                        <CommandItem
                          key={`salesforce-${contact.id}`}
                          value={`${contact.email} ${contact.firstName} ${contact.lastName} ${contact.company}`}
                          onSelect={() => {
                            onSelect(contact)
                            setOpen(false)
                          }}
                          disabled={selectedEmails.includes(contact.email)}
                        >
                          <div className="flex flex-1 items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {contact.firstName} {contact.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {contact.email}
                                {contact.company && ` - ${contact.company}`}
                              </span>
                            </div>
                            {selectedEmails.includes(contact.email) && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
        <div className="border-t p-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {connectedCRMs.hubspot && (
              <Badge variant="outline" className="bg-[#FF7A59]/10 text-[#FF7A59]">
                HubSpot
              </Badge>
            )}
            {connectedCRMs.salesforce && (
              <Badge variant="outline" className="bg-[#00A1E0]/10 text-[#00A1E0]">
                Salesforce
              </Badge>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
