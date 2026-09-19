"use client"

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, History, GitFork, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatRelative } from '@/lib/automations/trigger-meta'

export default function FlowRunsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/flows/${id}/runs`)
        const json = await res.json()
        if (json.status) {
          setRuns(json.data || [])
        } else {
          setError(json.message)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <Link href={`/dashboard/flows/${id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Flow Execution Runs</h1>
          <p className="text-xs text-muted-foreground">
            Live and historical user sessions navigating this flow
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading runs...</div>
      ) : error ? (
        <div className="p-8 text-center text-sm text-destructive">{error}</div>
      ) : runs.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground border-dashed">
          No user sessions recorded for this flow yet. Trigger this flow by sending its keyword on WhatsApp!
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => {
            const events = Array.isArray(run.events) ? run.events : []
            const vars = run.vars || {}

            return (
              <Card key={run.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Session {run.id.slice(-6)}</span>
                    <Badge
                      variant={run.status === 'completed' ? 'secondary' : run.status === 'active' ? 'default' : 'outline'}
                      className="text-xs uppercase"
                    >
                      {run.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Started {formatRelative(run.startedAt)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
                  <div>
                    Contact: <span className="font-mono text-foreground">{run.contactId}</span>
                  </div>
                  <div>
                    Current Node:{' '}
                    <span className="font-mono text-foreground">{run.currentNodeKey || 'Done'}</span>
                  </div>
                </div>

                {Object.keys(vars).length > 0 && (
                  <div className="p-2.5 rounded bg-muted/40 border border-border/40 text-xs">
                    <span className="font-semibold text-muted-foreground block mb-1">
                      Collected Variables:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(vars).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-muted-foreground">{k}:</span>{' '}
                          <span className="font-medium text-foreground">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {events.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Graph Path Traversed:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {events.map((ev: any, idx: number) => (
                        <React.Fragment key={idx}>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {ev.nodeKey}
                          </Badge>
                          {idx < events.length - 1 && <span className="text-muted-foreground">→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
