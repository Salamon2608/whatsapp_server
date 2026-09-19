"use client"

import React, { useState } from 'react'
import {
  Bot,
  MessageSquareCode,
  Sparkles,
  Settings2,
  BarChart3,
  BookOpen,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KeywordChatbot } from '@/components/agents/keyword-chatbot'
import { AiConfigForm } from '@/components/agents/ai-config'
import { AiPlayground } from '@/components/agents/ai-playground'
import { AiKnowledge } from '@/components/agents/ai-knowledge'
import { AiUsage } from '@/components/agents/ai-usage'

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState('rules')

  return (
    <div className="space-y-6 pb-20">
      {/* Header matching exact screenshot */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20 shadow-2xs mt-0.5">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            WhatsApp Chatbot & AI Agents
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage automated responses for incoming WhatsApp messages — including keyword/rule-based menus and optional LLM agents.
          </p>
        </div>
      </div>

      {/* Tabs matching screenshot */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted/70 p-1 text-muted-foreground">
          <TabsTrigger value="rules" className="gap-1.5 px-3 py-1 text-xs font-medium">
            <MessageSquareCode className="h-3.5 w-3.5" />
            <span>Keyword Bot (Rule-Based)</span>
          </TabsTrigger>
          <TabsTrigger value="playground" className="gap-1.5 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Playground</span>
          </TabsTrigger>
          <TabsTrigger value="setup" className="gap-1.5 px-3 py-1 text-xs font-medium">
            <Settings2 className="h-3.5 w-3.5" />
            <span>AI Setup</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-1.5 px-3 py-1 text-xs font-medium">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Usage</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1.5 px-3 py-1 text-xs font-medium">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Knowledge Base</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <KeywordChatbot />
        </TabsContent>

        <TabsContent value="playground" className="space-y-4">
          <AiPlayground />
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <AiConfigForm />
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <AiUsage />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <AiKnowledge />
        </TabsContent>
      </Tabs>
    </div>
  )
}
