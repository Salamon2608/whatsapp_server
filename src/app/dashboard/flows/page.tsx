"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  GitFork,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  History,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { listFlowTemplates } from '@/lib/flows/templates'

export default function FlowsPage() {
  const [flows, setFlows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const templates = listFlowTemplates()

  const fetchFlows = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/flows')
      const data = await res.json()
      if (data.status) {
        setFlows(data.data || [])
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
    fetchFlows()
  }, [])

  const handleCreateFromTemplate = async (slug?: string) => {
    try {
      const res = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: slug ? undefined : 'New Conversation Flow',
          templateSlug: slug,
        }),
      })
      const data = await res.json()
      if (data.status && data.data?.id) {
        window.location.href = `/dashboard/flows/${data.data.id}`
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteFlow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flow?')) return
    try {
      const res = await fetch(`/api/flows/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setFlows((prev) => prev.filter((f) => f.id !== id))
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
          <h1 className="text-2xl font-bold tracking-tight">Interactive Flows</h1>
          <p className="text-sm text-muted-foreground">
            Multi-step conversational state machines with interactive buttons, input collection, and visual canvas graphs.
          </p>
        </div>
        <Button onClick={() => handleCreateFromTemplate()} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Flow
        </Button>
      </div>

      {/* Templates Gallery */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-base">Pre-Built Flow Templates</CardTitle>
          </div>
          <CardDescription>
            Launch complete interactive menus, FAQ bots, or lead capture machines in seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((tpl) => (
              <div
                key={tpl.slug}
                className="flex flex-col justify-between p-3.5 rounded-lg border border-border/60 bg-card hover:border-purple-500/50 transition-all cursor-pointer group"
                onClick={() => handleCreateFromTemplate(tpl.slug)}
              >
                <div>
                  <h4 className="text-xs font-semibold group-hover:text-purple-500 transition-colors">
                    {tpl.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-purple-500 font-medium">
                  <span>Deploy template ({tpl.nodes.length} nodes)</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flows List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Your Interactive Flows</h2>

        {loading ? (
          <div className="rounded-lg border border-border/40 p-8 text-center text-sm text-muted-foreground">
            Loading flows...
          </div>
        ) : flows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <GitFork className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base">No flows created yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Design branching decision trees and interactive button menus with a visual node canvas.
              </p>
            </div>
            <Button size="sm" onClick={() => handleCreateFromTemplate()} className="mt-2">
              Create First Flow
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {flows.map((flow) => {
              const nodeCount = flow._count?.nodes || 0
              const runCount = flow._count?.runs || 0

              return (
                <Card
                  key={flow.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 hover:border-border transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-muted text-purple-500">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/flows/${flow.id}`}
                          className="font-semibold text-sm hover:underline"
                        >
                          {flow.name}
                        </Link>
                        <Badge
                          variant={flow.status === 'active' ? 'default' : 'secondary'}
                          className="text-[10px] uppercase"
                        >
                          {flow.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {flow.description || `${nodeCount} graph node(s)`} •{' '}
                        <span>{runCount} conversation session(s)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link href={`/dashboard/flows/${flow.id}/runs`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                        <History className="h-3.5 w-3.5" />
                        Runs
                      </Button>
                    </Link>

                    <Link href={`/dashboard/flows/${flow.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                        <Edit className="h-3.5 w-3.5" />
                        Open Canvas
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteFlow(flow.id)}
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
