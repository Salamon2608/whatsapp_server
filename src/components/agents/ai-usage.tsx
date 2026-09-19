"use client"

import React, { useState, useEffect } from 'react'
import {
  Activity,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelative } from '@/lib/automations/trigger-meta'

export function AiUsage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/ai/usage')
        const json = await res.json()
        if (json.status) {
          setData(json.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading AI usage metrics...</div>
  }

  const totals = data?.totals || { promptTokens: 0, completionTokens: 0, totalTokens: 0, callCount: 0 }
  const recent = data?.recentLogs || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">AI Usage & Token Consumption</h2>
        <p className="text-xs text-muted-foreground">
          Track token spend directly on your BYO API key across OpenAI and Anthropic.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-primary" /> Total API Calls
          </span>
          <p className="text-2xl font-bold">{totals.callCount}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-primary" /> Prompt Tokens
          </span>
          <p className="text-2xl font-bold font-mono">{totals.promptTokens.toLocaleString()}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" /> Completion Tokens
          </span>
          <p className="text-2xl font-bold font-mono">{totals.completionTokens.toLocaleString()}</p>
        </Card>

        <Card className="p-4 space-y-1 border-primary/40 bg-primary/5">
          <span className="text-xs text-primary font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Total Tokens
          </span>
          <p className="text-2xl font-bold font-mono text-primary">
            {totals.totalTokens.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Recent Usage Audit Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Recent API Calls</h3>

        {recent.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed">
            No token usage recorded yet. Make a call in the Playground or send an auto-reply.
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((log: any) => (
              <Card key={log.id} className="p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {log.provider}
                  </Badge>
                  <span className="font-semibold">{log.model}</span>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>
                    Prompt: <strong className="text-foreground font-mono">{log.promptTokens}</strong>
                  </span>
                  <span>
                    Output: <strong className="text-foreground font-mono">{log.completionTokens}</strong>
                  </span>
                  <span>
                    Total:{' '}
                    <strong className="text-primary font-mono">{log.totalTokens}</strong>
                  </span>
                  <span className="text-[11px]">{formatRelative(log.createdAt)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
