"use client"

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Clock, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatRelative } from '@/lib/automations/trigger-meta'

export default function AutomationLogsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/automations/${id}/logs`)
        const json = await res.json()
        if (json.status) {
          setLogs(json.data || [])
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
        <Link href="/dashboard/automations">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Automation Run History</h1>
          <p className="text-xs text-muted-foreground">
            Audit logs of triggered executions, executed steps, and status outcomes
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading logs...</div>
      ) : error ? (
        <div className="p-8 text-center text-sm text-destructive">{error}</div>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground border-dashed">
          No runs recorded for this automation yet. It will show up here once an incoming message triggers it.
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isSuccess = log.status === 'success'
            const steps = Array.isArray(log.stepsExecuted) ? log.stepsExecuted : []

            return (
              <Card key={log.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSuccess ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="text-sm font-semibold capitalize">{log.status}</span>
                    <Badge variant="outline" className="text-xs">
                      {log.triggerEvent}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(log.createdAt)} ({new Date(log.createdAt).toLocaleString()})
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Contact:{' '}
                  <span className="font-mono text-foreground">{log.contactId || 'Unknown'}</span>
                </div>

                {log.errorMessage && (
                  <div className="rounded bg-destructive/10 p-2 text-xs text-destructive">
                    Error: {log.errorMessage}
                  </div>
                )}

                {steps.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-medium text-muted-foreground">Executed Steps:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {steps.map((s: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-[10px]">
                          {idx + 1}. {s.step_type} ({s.status})
                        </Badge>
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
