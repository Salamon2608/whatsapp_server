"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  Clock,
  Split,
  MessageSquare,
  ListOrdered,
  Tag,
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { TRIGGER_META, triggerMeta } from '@/lib/automations/trigger-meta'
import type { AutomationTriggerType, AutomationStepType } from '@/lib/automations/types'

interface StepItem {
  id?: string
  cid: string
  stepType: AutomationStepType
  stepConfig: Record<string, any>
  branch?: 'yes' | 'no' | null
  parentCid?: string | null
}

interface AutomationBuilderProps {
  initialData?: {
    id?: string
    name: string
    description?: string
    triggerType: AutomationTriggerType
    triggerConfig: Record<string, any>
    isActive: boolean
    steps: any[]
  }
  isEditing?: boolean
}

export function AutomationBuilder({ initialData, isEditing = false }: AutomationBuilderProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name || 'Untitled Automation')
  const [description, setDescription] = useState(initialData?.description || '')
  const [triggerType, setTriggerType] = useState<AutomationTriggerType>(
    initialData?.triggerType || 'keyword_match'
  )
  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>(
    initialData?.triggerConfig || { keywords: ['info', 'pricing'], match_type: 'contains' }
  )
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize steps
  const [steps, setSteps] = useState<StepItem[]>(() => {
    if (initialData?.steps && initialData.steps.length > 0) {
      return initialData.steps.map((s, idx) => ({
        id: s.id,
        cid: s.id || `step-${idx}-${Date.now()}`,
        stepType: s.stepType || s.step_type || 'send_message',
        stepConfig: s.stepConfig || s.step_config || { text: '' },
        branch: s.branch || null,
        parentCid: s.parentStepId || null,
      }))
    }
    return [
      {
        cid: `step-0-${Date.now()}`,
        stepType: 'send_message',
        stepConfig: { text: 'Hello! Thanks for reaching out.' },
      },
    ]
  })

  const addStep = (type: AutomationStepType = 'send_message') => {
    const newStep: StepItem = {
      cid: `step-${Date.now()}`,
      stepType: type,
      stepConfig:
        type === 'send_message'
          ? { text: '' }
          : type === 'condition'
          ? { subject: 'message_content', value: '' }
          : type === 'wait'
          ? { amount: 5, unit: 'minutes' }
          : type === 'send_buttons'
          ? { text: 'Choose an option:', buttons: [{ reply_id: 'btn_1', title: 'Option 1' }] }
          : {},
    }
    setSteps((prev) => [...prev, newStep])
  }

  const removeStep = (cid: string) => {
    setSteps((prev) => prev.filter((s) => s.cid !== cid))
  }

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= steps.length) return
    const copy = [...steps]
    const temp = copy[index]
    copy[index] = copy[target]
    copy[target] = temp
    setSteps(copy)
  }

  const updateStepConfig = (cid: string, patch: Record<string, any>) => {
    setSteps((prev) =>
      prev.map((s) => (s.cid === cid ? { ...s, stepConfig: { ...s.stepConfig, ...patch } } : s))
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter an automation name')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name,
      description,
      triggerType,
      triggerConfig,
      isActive,
      steps: steps.map((s) => ({
        stepType: s.stepType,
        stepConfig: s.stepConfig,
        branch: s.branch,
      })),
    }

    try {
      const url = isEditing && initialData?.id ? `/api/automations/${initialData.id}` : '/api/automations'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.status) {
        throw new Error(data.message || 'Failed to save automation')
      }

      router.push('/dashboard/automations')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error saving automation')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/automations')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{name || 'New Automation'}</h1>
              <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Define triggers and sequential steps for instant WhatsApp replies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 mr-2">
            <Label htmlFor="active-toggle" className="text-xs text-muted-foreground">
              Status:
            </Label>
            <Switch id="active-toggle" checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Automation'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Meta Details */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-semibold">General Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Automation Name</Label>
            <Input
              id="name"
              placeholder="e.g., Pricing Inquiry Auto-Reply"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Brief summary of when this fires and what it does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger Configuration Card */}
      <Card className="border-primary/30 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Step 1: When this happens (Trigger)</CardTitle>
              <CardDescription className="text-xs">
                Select the WhatsApp event that activates this workflow
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trigger Event</Label>
              <Select
                value={triggerType}
                onValueChange={(val) => setTriggerType(val as AutomationTriggerType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword_match">Keyword Match</SelectItem>
                  <SelectItem value="new_message_received">Any New Message</SelectItem>
                  <SelectItem value="first_inbound_message">First Message from Contact</SelectItem>
                  <SelectItem value="interactive_reply">Button / List Reply</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {triggerType === 'keyword_match' && (
              <div className="space-y-2">
                <Label>Keywords (comma separated)</Label>
                <Input
                  placeholder="price, pricing, quote, cost"
                  value={
                    Array.isArray(triggerConfig.keywords)
                      ? triggerConfig.keywords.join(', ')
                      : triggerConfig.keywords || ''
                  }
                  onChange={(e) =>
                    setTriggerConfig({
                      ...triggerConfig,
                      keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            )}

            {triggerType === 'interactive_reply' && (
              <div className="space-y-2">
                <Label>Button / Option IDs (comma separated)</Label>
                <Input
                  placeholder="btn_pricing, btn_sales"
                  value={
                    Array.isArray(triggerConfig.reply_ids)
                      ? triggerConfig.reply_ids.join(', ')
                      : triggerConfig.reply_ids || ''
                  }
                  onChange={(e) =>
                    setTriggerConfig({
                      ...triggerConfig,
                      reply_ids: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sequential Action Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <span>Step 2: Do this in order (Actions)</span>
            <Badge variant="outline" className="text-xs">
              {steps.length} {steps.length === 1 ? 'step' : 'steps'}
            </Badge>
          </h2>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <Card key={step.cid} className="relative overflow-hidden border-border/70 hover:border-primary/40 transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/70" />
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/30 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                    {idx + 1}
                  </span>
                  <Select
                    value={step.stepType}
                    onValueChange={(val) => {
                      setSteps((prev) =>
                        prev.map((s) => (s.cid === step.cid ? { ...s, stepType: val as any } : s))
                      )
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs font-medium w-[170px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_message">💬 Send Message</SelectItem>
                      <SelectItem value="send_buttons">🔘 Send Buttons</SelectItem>
                      <SelectItem value="condition">🔀 Condition (If / Else)</SelectItem>
                      <SelectItem value="wait">⏳ Delay (Wait)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === 0}
                    onClick={() => moveStep(idx, -1)}
                  >
                    <MoveUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === steps.length - 1}
                    onClick={() => moveStep(idx, 1)}
                  >
                    <MoveDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeStep(step.cid)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {step.stepType === 'send_message' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Message Text</Label>
                    <Textarea
                      rows={3}
                      placeholder="Type the message to send to the contact..."
                      value={step.stepConfig.text || ''}
                      onChange={(e) => updateStepConfig(step.cid, { text: e.target.value })}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Supports markdown (*bold*, _italics_) and variables like {'{{message.text}}'}.
                    </p>
                  </div>
                )}

                {step.stepType === 'send_buttons' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Header / Body Text</Label>
                      <Textarea
                        rows={2}
                        placeholder="Choose an option below:"
                        value={step.stepConfig.text || ''}
                        onChange={(e) => updateStepConfig(step.cid, { text: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Interactive Buttons</Label>
                      {(step.stepConfig.buttons || []).map((btn: any, bIdx: number) => (
                        <div key={bIdx} className="flex gap-2">
                          <Input
                            placeholder="Title (e.g., Sales)"
                            value={btn.title || ''}
                            onChange={(e) => {
                              const updated = [...(step.stepConfig.buttons || [])]
                              updated[bIdx] = { ...updated[bIdx], title: e.target.value }
                              updateStepConfig(step.cid, { buttons: updated })
                            }}
                          />
                          <Input
                            placeholder="ID (e.g., btn_sales)"
                            value={btn.reply_id || ''}
                            onChange={(e) => {
                              const updated = [...(step.stepConfig.buttons || [])]
                              updated[bIdx] = { ...updated[bIdx], reply_id: e.target.value }
                              updateStepConfig(step.cid, { buttons: updated })
                            }}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updated = [
                            ...(step.stepConfig.buttons || []),
                            {
                              reply_id: `btn_${(step.stepConfig.buttons?.length || 0) + 1}`,
                              title: `Option ${(step.stepConfig.buttons?.length || 0) + 1}`,
                            },
                          ]
                          updateStepConfig(step.cid, { buttons: updated })
                        }}
                      >
                        + Add Button
                      </Button>
                    </div>
                  </div>
                )}

                {step.stepType === 'condition' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Condition Subject</Label>
                      <Select
                        value={step.stepConfig.subject || 'message_content'}
                        onValueChange={(val) => updateStepConfig(step.cid, { subject: val })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="message_content">Message Content Contains</SelectItem>
                          <SelectItem value="time_of_day">Time of Day (e.g. 18:00-09:00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Match Value</Label>
                      <Input
                        className="h-8 text-xs"
                        placeholder={
                          step.stepConfig.subject === 'time_of_day' ? '18:00-09:00' : 'urgent, help'
                        }
                        value={step.stepConfig.value || step.stepConfig.operand || ''}
                        onChange={(e) =>
                          updateStepConfig(step.cid, {
                            value: e.target.value,
                            operand: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {step.stepType === 'wait' && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Wait for</Label>
                    <Input
                      type="number"
                      min={1}
                      className="h-8 w-20 text-xs"
                      value={step.stepConfig.amount || 5}
                      onChange={(e) =>
                        updateStepConfig(step.cid, { amount: parseInt(e.target.value) || 1 })
                      }
                    />
                    <Select
                      value={step.stepConfig.unit || 'minutes'}
                      onValueChange={(val) => updateStepConfig(step.cid, { unit: val })}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addStep('send_message')}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Send Message
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addStep('send_buttons')}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Send Buttons
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addStep('condition')}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Condition
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addStep('wait')}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Delay
          </Button>
        </div>
      </div>
    </div>
  )
}
