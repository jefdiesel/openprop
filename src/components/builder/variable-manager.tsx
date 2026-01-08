"use client"

import { useState, useCallback } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface CustomVariable {
  name: string
  defaultValue: string
  description?: string
}

export interface VariableManagerProps {
  variables: CustomVariable[]
  onChange: (variables: CustomVariable[]) => void
}

interface VariableFormData {
  name: string
  defaultValue: string
  description: string
}

export function VariableManager({ variables, onChange }: VariableManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<VariableFormData>({
    name: "",
    defaultValue: "",
    description: "",
  })
  const [errors, setErrors] = useState<{ name?: string; defaultValue?: string }>({})

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      defaultValue: "",
      description: "",
    })
    setErrors({})
    setEditingIndex(null)
  }, [])

  const openAddDialog = useCallback(() => {
    resetForm()
    setIsDialogOpen(true)
  }, [resetForm])

  const openEditDialog = useCallback(
    (index: number) => {
      const variable = variables[index]
      setFormData({
        name: variable.name,
        defaultValue: variable.defaultValue,
        description: variable.description || "",
      })
      setEditingIndex(index)
      setIsDialogOpen(true)
    },
    [variables]
  )

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    resetForm()
  }, [resetForm])

  const validateForm = useCallback((): boolean => {
    const newErrors: { name?: string; defaultValue?: string } = {}

    // Validate name: alphanumeric + underscore only
    if (!formData.name.trim()) {
      newErrors.name = "Variable name is required"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      newErrors.name = "Name must contain only letters, numbers, and underscores"
    } else {
      // Check for duplicates (excluding current edit)
      const isDuplicate = variables.some((v, i) => {
        if (editingIndex !== null && i === editingIndex) {
          return false
        }
        return v.name.toLowerCase() === formData.name.toLowerCase()
      })

      if (isDuplicate) {
        newErrors.name = "A variable with this name already exists"
      }
    }

    // Validate default value
    if (!formData.defaultValue.trim()) {
      newErrors.defaultValue = "Default value is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, variables, editingIndex])

  const handleSave = useCallback(() => {
    if (!validateForm()) {
      return
    }

    const newVariable: CustomVariable = {
      name: formData.name.trim(),
      defaultValue: formData.defaultValue.trim(),
      description: formData.description.trim() || undefined,
    }

    if (editingIndex !== null) {
      // Edit existing variable
      const updatedVariables = [...variables]
      updatedVariables[editingIndex] = newVariable
      onChange(updatedVariables)
    } else {
      // Add new variable
      onChange([...variables, newVariable])
    }

    closeDialog()
  }, [validateForm, formData, editingIndex, variables, onChange, closeDialog])

  const handleDelete = useCallback(
    (index: number) => {
      const updatedVariables = variables.filter((_, i) => i !== index)
      onChange(updatedVariables)
    },
    [variables, onChange]
  )

  const handleInputChange = useCallback(
    (field: keyof VariableFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error for this field when user starts typing
      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [errors]
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Custom Variables</CardTitle>
          <CardDescription>
            Define custom variables to personalize your documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variables.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                No custom variables defined. Add one to personalize your documents.
              </p>
              <Button onClick={openAddDialog} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Variable
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {variables.map((variable, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-md border p-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-semibold">
                        {"{"}
                        {variable.name}
                        {"}"}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Default: {variable.defaultValue}
                    </p>
                    {variable.description && (
                      <p className="text-xs text-muted-foreground">
                        {variable.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditDialog(index)}
                      title="Edit variable"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(index)}
                      title="Delete variable"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                onClick={openAddDialog}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Variable
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Variable" : "Add Variable"}
            </DialogTitle>
            <DialogDescription>
              {editingIndex !== null
                ? "Update the variable details below."
                : "Create a new custom variable for your documents."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="variable-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="variable-name"
                placeholder="e.g., client_name, project_title"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use only letters, numbers, and underscores
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variable-default">
                Default Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="variable-default"
                placeholder="e.g., John Doe, My Project"
                value={formData.defaultValue}
                onChange={(e) => handleInputChange("defaultValue", e.target.value)}
                className={cn(errors.defaultValue && "border-destructive")}
              />
              {errors.defaultValue && (
                <p className="text-xs text-destructive">{errors.defaultValue}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="variable-description">Description (optional)</Label>
              <Textarea
                id="variable-description"
                placeholder="Describe when to use this variable..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingIndex !== null ? "Save Changes" : "Add Variable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
