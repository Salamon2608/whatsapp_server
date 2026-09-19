"use client"

import React, { useState } from 'react'
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  BookOpen,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AiPlayground() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! How can I assist you with our services today?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [retrievedDocs, setRetrievedDocs] = useState<string[]>([])
  const [lastUsage, setLastUsage] = useState<any>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      const data = await res.json()
      if (data.status && data.data?.reply) {
        setMessages([...nextMessages, { role: 'assistant', content: data.data.reply }])
        setRetrievedDocs(data.data.retrievedKnowledge || [])
        setLastUsage(data.data.usage || null)
      } else {
        setMessages([
          ...nextMessages,
          {
            role: 'assistant',
            content: `⚠️ ${data.message || 'Failed to generate response. Check your API key in AI Setup.'}`,
          },
        ])
      }
    } catch (err: any) {
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: `Error: ${err.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([{ role: 'assistant', content: 'Conversation reset. How can I help you?' }])
    setRetrievedDocs([])
    setLastUsage(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Simulation Window */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">AI Agent Playground</h2>
            <p className="text-xs text-muted-foreground">
              Simulate live customer WhatsApp interactions and test responses against your knowledge base.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-xs gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Chat
          </Button>
        </div>

        {/* WhatsApp-Style Chat Box */}
        <Card className="flex flex-col h-[520px] overflow-hidden border-border/70 shadow-sm bg-muted/10">
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user'
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-card border border-border/60 text-foreground rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>

                  {isUser && (
                    <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              )
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span>Generating response with knowledge base...</span>
              </div>
            )}
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSend} className="p-3 bg-card border-t border-border/40 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message as a customer..."
              className="text-xs h-9"
              disabled={loading}
            />
            <Button type="submit" size="sm" disabled={loading || !input.trim()} className="h-9 gap-1">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </Card>
      </div>

      {/* Side Inspector: Retrieved Knowledge & Token Stats */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Live Inspection</h3>

        <Card>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <CardTitle className="text-xs font-semibold">Retrieved Knowledge Excerpts</CardTitle>
            </div>
            <CardDescription className="text-[11px]">
              Excerpts grounded into the prompt for the latest turn
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {retrievedDocs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No excerpts matched or needed for this turn.
              </p>
            ) : (
              <div className="space-y-2">
                {retrievedDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-muted/40 border border-border/40 text-[11px] text-muted-foreground line-clamp-3"
                  >
                    {doc}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {lastUsage && (
          <Card>
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-semibold">Latest Call Token Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prompt Tokens:</span>
                <span className="font-mono">{lastUsage.promptTokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completion Tokens:</span>
                <span className="font-mono">{lastUsage.completionTokens}</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-1 font-semibold">
                <span>Total Tokens:</span>
                <span className="font-mono text-primary">{lastUsage.totalTokens}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
