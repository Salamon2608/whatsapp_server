"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  History,
  Layout,
  List,
  Zap,
  CheckCircle2,
  Trash2,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FlowCanvas } from './flow-canvas'
import type { BuilderNode } from '@/lib/flows/types'

interface FlowEditorShellProps {
  initialFlow: {
    id?: string
    name: string
    description?: string
    status: 'draft' | 'active' | 'archived'
    triggerType: string
    triggerConfig: Record<string, any>
    entryNodeId?: string
    nodes: any[]
  }
}

export function FlowEditorShell({ initialFlow }: FlowEditorShellProps) {
  const router = useRouter()
  const [name, setName] = useState(initialFlow.name || 'Untitled Flow')
  const [description, setDescription] = useState(initialFlow.description || '')
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>(initialFlow.status || 'draft')
  const [triggerType, setTriggerType] = useState(initialFlow.triggerType || 'keyword')
  const [keywords, setKeywords] = useState(
    Array.isArray(initialFlow.triggerConfig?.keywords)
      ? initialFlow.triggerConfig.keywords.join(', ')
      : 'hi, hello, menu, start'
  )
  const [entryNodeId, setEntryNodeId] = useState(initialFlow.entryNodeId || 'start')
  const [nodes, setNodes] = useState<BuilderNode[]>(() => {
    return (initialFlow.nodes || []).map((n) => ({
      id: n.id,
      node_key: n.nodeKey || n.node_key,
      node_type: n.nodeType || n.node_type,
      config: n.config || {},
      position_x: n.positionX ?? n.position_x ?? 0,
      position_y: n.positionY ?? n.position_y ?? 0,
    }))
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSavedSuccess(false)

    const payload = {
      name,
      description,
      status,
      triggerType,
      triggerConfig: {
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        match_type: 'contains',
      },
      entryNodeId,
      nodes,
    }

    try {
      const url = initialFlow.id ? `/api/flows/${initialFlow.id}` : '/api/flows'
      const method = initialFlow.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.status) {
        throw new Error(data.message || 'Failed to save flow')
      }

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)

      if (!initialFlow.id && data.data?.id) {
        router.push(`/dashboard/flows/${data.data.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save flow')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/flows">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
              />
              <Badge
                variant={status === 'active' ? 'default' : 'secondary'}
                className="text-xs uppercase"
              >
                {status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              WhatsApp Interactive State Machine • {nodes.length} Nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {initialFlow.id && (
            <Link href={`/dashboard/flows/${initialFlow.id}/runs`}>
              <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                <History className="h-3.5 w-3.5" />
                Runs History
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-muted-foreground">Active:</span>
            <Switch
              checked={status === 'active'}
              onCheckedChange={(checked) => setStatus(checked ? 'active' : 'draft')}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="h-9 gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Flow'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/15 p-3 text-xs text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {savedSuccess && (
        <div className="rounded-lg bg-emerald-500/15 p-3 text-xs text-emerald-500 border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Flow saved successfully!
        </div>
      )}

      {/* Trigger Settings Strip */}
      <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-card border border-border/60">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Entry Trigger:</span>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Trigger Type:</Label>
          <Select
            value={triggerType}
            onValueChange={(val) => setTriggerType(val)}
          >
            <SelectTrigger className="h-8 text-xs w-[190px]">
              <SelectValue placeholder="Select Trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_messages">Any Message (All Words)</SelectItem>
              <SelectItem value="keyword">Keyword Match</SelectItem>
              <SelectItem value="first_inbound_message">First Message Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {triggerType === 'keyword' && (
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Keywords:</Label>
            <Input
              className="h-8 text-xs"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="hi, hello, menu (or * for all)"
            />
          </div>
        )}

        {triggerType === 'all_messages' && (
          <div className="text-xs text-primary font-medium flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-md">
            <span>✨ Triggers whenever anyone sends any message or words</span>
          </div>
        )}

        {triggerType === 'first_inbound_message' && (
          <div className="text-xs text-muted-foreground italic bg-muted/50 px-2.5 py-1 rounded-md">
            Triggers once when a contact sends their very first message
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Entry Node:</Label>
          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{entryNodeId}</span>
        </div>
      </div>

      {/* Canvas View */}
      <FlowCanvas
        nodes={nodes}
        onUpdateNodes={setNodes}
        entryNodeId={entryNodeId}
        onSetEntryNodeId={setEntryNodeId}
      />
    </div>
  )
}
