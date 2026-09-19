"use client"

import React, { useState, useEffect } from 'react'
import {
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  Zap,
  Bot,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AI_PROVIDER_DEFAULT_MODEL } from '@/lib/ai/defaults'

export function AiConfigForm() {
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai')
  const [model, setModel] = useState(AI_PROVIDER_DEFAULT_MODEL.openai)
  const [apiKey, setApiKey] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false)
  const [autoReplyMaxPerConversation, setAutoReplyMaxPerConversation] = useState(10)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingKey, setTestingKey] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/ai/config')
        const json = await res.json()
        if (json.status && json.data) {
          const cfg = json.data
          setProvider(cfg.provider || 'openai')
          setModel(cfg.model || AI_PROVIDER_DEFAULT_MODEL.openai)
          setApiKey(cfg.apiKey || '')
          setSystemPrompt(cfg.systemPrompt || '')
          setIsActive(cfg.isActive ?? true)
          setAutoReplyEnabled(cfg.autoReplyEnabled ?? false)
          setAutoReplyMaxPerConversation(cfg.autoReplyMaxPerConversation || 10)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleProviderChange = (p: 'openai' | 'anthropic') => {
    setProvider(p)
    setModel(AI_PROVIDER_DEFAULT_MODEL[p])
  }

  const handleTestKey = async () => {
    if (!apiKey) {
      setStatusMsg({ text: 'Please enter an API key to test.', ok: false })
      return
    }

    setTestingKey(true)
    setStatusMsg(null)
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
          testKey: true,
        }),
      })
      const json = await res.json()
      if (json.status) {
        setStatusMsg({ text: 'API key is valid and connected successfully!', ok: true })
      } else {
        setStatusMsg({ text: `Key test failed: ${json.message}`, ok: false })
      }
    } catch (err: any) {
      setStatusMsg({ text: `Test error: ${err.message}`, ok: false })
    } finally {
      setTestingKey(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setStatusMsg(null)
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
          systemPrompt,
          isActive,
          autoReplyEnabled,
          autoReplyMaxPerConversation,
        }),
      })
      const json = await res.json()
      if (json.status) {
        setStatusMsg({ text: 'AI configuration saved successfully!', ok: true })
      } else {
        setStatusMsg({ text: `Save failed: ${json.message}`, ok: false })
      }
    } catch (err: any) {
      setStatusMsg({ text: `Save error: ${err.message}`, ok: false })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading AI configuration...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">AI Agent Setup (Bring Your Own Key)</h2>
          <p className="text-xs text-muted-foreground">
            Connect your OpenAI or Anthropic account for generative conversational AI responses.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 h-9">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {statusMsg && (
        <div
          className={`rounded-lg p-3 text-xs border flex items-center gap-2 ${
            statusMsg.ok
              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
              : 'bg-destructive/15 text-destructive border-destructive/20'
          }`}
        >
          {statusMsg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {statusMsg.text}
        </div>
      )}

      {/* Provider & Credentials */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">1. LLM Provider & Credentials</CardTitle>
          <CardDescription className="text-xs">
            Direct API connection with your own key (no proxy, zero third-party markups).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Provider</Label>
              <Select value={provider} onValueChange={(val: any) => handleProviderChange(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (ChatGPT / GPT-4o)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude 3.5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Model Name</Label>
              <Input
                className="h-9 text-xs font-mono"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">API Key</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                className="h-9 text-xs font-mono"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs shrink-0"
                onClick={handleTestKey}
                disabled={testingKey || !apiKey}
              >
                {testingKey ? 'Testing...' : 'Test Key'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Reply Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">2. Autonomous WhatsApp Auto-Reply</CardTitle>
          <CardDescription className="text-xs">
            Allow the AI model to reply directly to customer inbounds when no rule or flow matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <Label className="text-xs font-semibold">Enable Inbound AI Auto-Reply</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Automatically reply to customer messages using your configured model and Knowledge Base.
              </p>
            </div>
            <Switch checked={autoReplyEnabled} onCheckedChange={setAutoReplyEnabled} />
          </div>

          <div className="space-y-1.5 max-w-xs">
            <Label className="text-xs">Max AI Replies per Conversation Thread</Label>
            <Input
              type="number"
              min={1}
              max={50}
              className="h-9 text-xs"
              value={autoReplyMaxPerConversation}
              onChange={(e) => setAutoReplyMaxPerConversation(parseInt(e.target.value) || 10)}
            />
            <p className="text-[10px] text-muted-foreground">
              Prevents looping or run-away token spend with inactive customers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">3. Custom Business Instructions & Persona</CardTitle>
          <CardDescription className="text-xs">
            Teach the model your company details, tone of voice, policies, and boundary instructions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            rows={5}
            className="text-xs font-sans"
            placeholder="e.g. You are Alex, a helpful and friendly sales representative for Acme Corp. You help customers with queries about our software products. Always be courteous, concise, and never make up false product features."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            The system automatically appends safety guidelines, language mirroring, and knowledge base excerpts to this prompt.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
