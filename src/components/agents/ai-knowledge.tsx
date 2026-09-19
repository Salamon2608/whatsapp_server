"use client"

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface KnowledgeItem {
  id: string
  title: string
  content: string
  tags?: string | null
  createdAt: string
}

export function AiKnowledge() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ai/knowledge')
      const json = await res.json()
      if (json.status) {
        setItems(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/ai/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      const json = await res.json()
      if (json.status) {
        setDialogOpen(false)
        setNewTitle('')
        setNewContent('')
        setNewTags('')
        fetchItems()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this knowledge document?')) return
    try {
      const res = await fetch(`/api/ai/knowledge?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      (item.tags && item.tags.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Knowledge Base (RAG Context)</h2>
          <p className="text-xs text-muted-foreground">
            Provide business facts, refund policies, FAQs, and price lists for the AI to ground its answers.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 text-xs h-9"
          placeholder="Search knowledge documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Items List */}
      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading knowledge base...</div>
      ) : filteredItems.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground border-dashed">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <BookOpen className="h-5 w-5" />
          </div>
          <h4 className="font-semibold text-foreground">No documents added yet</h4>
          <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
            Upload FAQs or product docs so your AI agent answers customer inquiries with accurate real facts.
          </p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            Add First Document
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="p-4 space-y-3 relative hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>

              {item.tags && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.split(',').map((t, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {t.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Document Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Knowledge Document</DialogTitle>
            <DialogDescription className="text-xs">
              Add business documentation, pricing tables, or FAQs for the AI agent to reference.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Title / Topic</Label>
              <Input
                placeholder="e.g. Return Policy or Enterprise Pricing"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Document Content</Label>
              <Textarea
                rows={6}
                placeholder="Type or paste the reference information here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Keywords / Tags (comma separated)</Label>
              <Input
                placeholder="refund, pricing, hours, warranty"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={submitting || !newTitle.trim() || !newContent.trim()}
            >
              {submitting ? 'Saving...' : 'Save Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
