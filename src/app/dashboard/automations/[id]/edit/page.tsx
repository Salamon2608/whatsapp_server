"use client"

import React, { useEffect, useState, use } from 'react'
import { AutomationBuilder } from '@/components/automations/automation-builder'

export default function EditAutomationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/automations/${id}`)
        const json = await res.json()
        if (json.status) {
          setData(json.data)
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
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading automation...</div>
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        {error || 'Automation not found'}
      </div>
    )
  }

  return <AutomationBuilder initialData={data} isEditing={true} />
}
