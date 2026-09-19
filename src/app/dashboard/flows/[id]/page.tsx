"use client"

import React, { useEffect, useState, use } from 'react'
import { FlowEditorShell } from '@/components/flows/flow-editor-shell'

export default function FlowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const [flow, setFlow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/flows/${id}`)
        const json = await res.json()
        if (json.status) {
          setFlow(json.data)
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

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading flow canvas...</div>
  }

  if (error || !flow) {
    return <div className="p-8 text-center text-sm text-destructive">{error || 'Flow not found'}</div>
  }

  return <FlowEditorShell initialFlow={flow} />
}
