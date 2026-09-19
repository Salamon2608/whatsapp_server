"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  History,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { triggerMeta, formatRelative } from '@/lib/automations/trigger-meta'
import { AUTOMATION_TEMPLATES } from '@/lib/automations/templates'

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAutomations = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/automations')
      const data = await res.json()
      if (data.status) {
        setAutomations(data.data || [])
      } else {
        setError(data.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAutomations()
  }, [])

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/automations/${id}/toggle`, { method: 'PATCH' })
      if (res.ok) {
        setAutomations((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isActive: !current } : a))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteAutomation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return
    try {
      const res = await fetch(`/api/automations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAutomations((prev) => prev.filter((a) => a.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <p className="text-sm text-muted-foreground">
            Trigger-action workflows for instant automated replies, branching, and customer routing.
          </p>
        </div>
        <Link href="/dashboard/automations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Automation
          </Button>
        </Link>
      </div>

      {/* Starter Templates Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Quick Start with Templates</CardTitle>
          </div>
          <CardDescription>
            Deploy pre-built automation workflows in one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.values(AUTOMATION_TEMPLATES).map((tpl) => (
              <div
                key={tpl.slug}
                className="flex flex-col justify-between p-3.5 rounded-lg border border-border/60 bg-card hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => (window.location.href = `/dashboard/automations/new?template=${tpl.slug}`)}
              >
                <div>
                  <h4 className="text-xs font-semibold group-hover:text-primary transition-colors">
                    {tpl.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-primary font-medium">
                  <span>Use template</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automations List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Your Automations</h2>

        {loading ? (
          <div className="rounded-lg border border-border/40 p-8 text-center text-sm text-muted-foreground">
            Loading automations...
          </div>
        ) : automations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base">No automations configured yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Create your first trigger-action rule or pick a pre-built template above to automate your WhatsApp responses.
              </p>
            </div>
            <Link href="/dashboard/automations/new">
              <Button size="sm" className="mt-2">
                Create First Automation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {automations.map((auto) => {
              const meta = triggerMeta(auto.triggerType)
              const stepCount = auto.steps?.length || 0
              const logCount = auto._count?.logs || 0

              return (
                <Card
                  key={auto.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 hover:border-border transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-muted text-primary">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/automations/${auto.id}/edit`}
                          className="font-semibold text-sm hover:underline"
                        >
                          {auto.name}
                        </Link>
                        <Badge variant="outline" className={`text-[10px] ${meta.pillClass}`}>
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {auto.description || `${stepCount} sequential step(s)`} •{' '}
                        <span className="inline-flex items-center gap-1">
                          <History className="h-3 w-3 inline" /> {logCount} runs
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={auto.isActive}
                        onCheckedChange={() => toggleStatus(auto.id, auto.isActive)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {auto.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <Link href={`/dashboard/automations/${auto.id}/logs`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                        <History className="h-3.5 w-3.5" />
                        Logs
                      </Button>
                    </Link>

                    <Link href={`/dashboard/automations/${auto.id}/edit`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteAutomation(auto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
