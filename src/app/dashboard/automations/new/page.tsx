"use client"

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AutomationBuilder } from '@/components/automations/automation-builder'
import { getTemplate } from '@/lib/automations/templates'

function NewAutomationContent() {
  const searchParams = useSearchParams()
  const templateSlug = searchParams.get('template')

  let initialData: any = undefined

  if (templateSlug) {
    const tpl = getTemplate(templateSlug)
    if (tpl) {
      initialData = {
        name: tpl.name,
        description: tpl.description,
        triggerType: tpl.trigger_type,
        triggerConfig: tpl.trigger_config,
        isActive: true,
        steps: tpl.steps.map((s, idx) => ({
          stepType: s.step_type,
          stepConfig: s.step_config,
          branch: s.branch,
        })),
      }
    }
  }

  return <AutomationBuilder initialData={initialData} isEditing={false} />
}

export default function NewAutomationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading builder...</div>}>
      <NewAutomationContent />
    </Suspense>
  )
}
