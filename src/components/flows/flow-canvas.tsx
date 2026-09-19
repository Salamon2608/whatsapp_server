"use client"

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Plus,
  Play,
  MessageSquare,
  ListFilter,
  Layers,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Trash2,
  Sparkles,
  LayoutGrid,
  SlidersHorizontal,
  Smartphone,
  ArrowRight,
  CornerDownRight,
  Eye,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { autoLayout, shouldAutoLayout } from '@/lib/flows/layout'
import type { BuilderNode, FlowNodeType } from '@/lib/flows/types'

const NODE_COLORS: Record<FlowNodeType, { bg: string; text: string; border: string }> = {
  start: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  send_message: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  send_buttons: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  send_list: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/30' },
  send_media: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/30' },
  collect_input: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  condition: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  set_tag: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/30' },
  handoff: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/30' },
  end: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
}

function CustomFlowNode({ data, id }: { data: any; id: string }) {
  const node: BuilderNode = data.node
  const colors = NODE_COLORS[node.node_type] || NODE_COLORS.send_message
  const isSelected = data.isSelected

  return (
    <div
      onClick={() => data.onSelectNode(node.node_key)}
      className={`relative w-[260px] rounded-xl border-2 bg-card p-3 shadow-md transition-all cursor-pointer ${colors.border} ${
        isSelected ? 'ring-2 ring-primary shadow-primary/20' : 'hover:border-primary/50'
      }`}
    >
      {/* Incoming target handle (except start node) */}
      {node.node_type !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !bg-muted-foreground !border-2 !border-background"
        />
      )}

      {/* Node Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${colors.bg} ${colors.text}`}>
            {node.node_type === 'start' && <Play className="h-3.5 w-3.5" />}
            {node.node_type === 'send_message' && <MessageSquare className="h-3.5 w-3.5" />}
            {node.node_type === 'send_buttons' && <Layers className="h-3.5 w-3.5" />}
            {node.node_type === 'send_list' && <ListFilter className="h-3.5 w-3.5" />}
            {node.node_type === 'collect_input' && <HelpCircle className="h-3.5 w-3.5" />}
            {node.node_type === 'condition' && <LayoutGrid className="h-3.5 w-3.5" />}
            {node.node_type === 'handoff' && <PhoneCall className="h-3.5 w-3.5" />}
            {node.node_type === 'end' && <CheckCircle2 className="h-3.5 w-3.5" />}
          </div>
          <div>
            <p className="text-xs font-semibold leading-none">{node.node_key}</p>
            <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
              {node.node_type.replace('_', ' ')}
            </p>
          </div>
        </div>
        {data.isEntry && (
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-none">
            Entry
          </Badge>
        )}
      </div>

      {/* Node Content Preview */}
      <div className="text-xs text-muted-foreground line-clamp-2 min-h-[28px]">
        {node.node_type === 'send_message' && (node.config.text as string || '(Empty message)')}
        {node.node_type === 'send_buttons' && (
          <div>
            <p className="line-clamp-1">{node.config.text as string || 'Buttons'}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {((node.config.buttons as any[]) || []).map((b, i) => (
                <span key={i} className="text-[9px] bg-muted px-1 rounded">
                  {b.title}
                </span>
              ))}
            </div>
          </div>
        )}
        {node.node_type === 'collect_input' && (
          <span>Prompt: {node.config.prompt_text as string || 'Waiting for user input'}</span>
        )}
        {node.node_type === 'condition' && (
          <span>Check if: {node.config.subject_key as string || 'var'}</span>
        )}
        {node.node_type === 'handoff' && <span>Transfer conversation to human agent</span>}
        {node.node_type === 'end' && <span>End flow conversation</span>}
      </div>

      {/* Outgoing handles */}
      {node.node_type === 'condition' ? (
        <div className="mt-2 flex justify-between text-[10px] font-semibold pt-1 border-t border-border/30">
          <div className="relative flex items-center text-emerald-500">
            <span>True</span>
            <Handle
              type="source"
              id="true"
              position={Position.Bottom}
              className="!left-4 !h-2.5 !w-2.5 !bg-emerald-500 !border-2 !border-background"
            />
          </div>
          <div className="relative flex items-center text-rose-500">
            <span>False</span>
            <Handle
              type="source"
              id="false"
              position={Position.Bottom}
              className="!right-4 !left-auto !h-2.5 !w-2.5 !bg-rose-500 !border-2 !border-background"
            />
          </div>
        </div>
      ) : node.node_type !== 'handoff' && node.node_type !== 'end' ? (
        <Handle
          type="source"
          id="next"
          position={Position.Bottom}
          className="!h-3 !w-3 !bg-primary !border-2 !border-background"
        />
      ) : null}
    </div>
  )
}

const nodeTypes = {
  flowNode: CustomFlowNode,
}

interface FlowCanvasProps {
  nodes: BuilderNode[]
  onUpdateNodes: (nodes: BuilderNode[]) => void
  entryNodeId: string
  onSetEntryNodeId: (id: string) => void
}

export function FlowCanvas({
  nodes,
  onUpdateNodes,
  entryNodeId,
  onSetEntryNodeId,
}: FlowCanvasProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<BuilderNode | null>(null)

  // Map BuilderNode[] to ReactFlow nodes
  const rfNodes: Node[] = useMemo(() => {
    return nodes.map((n) => ({
      id: n.node_key,
      type: 'flowNode',
      position: { x: n.position_x || 0, y: n.position_y || 0 },
      data: {
        node: n,
        isEntry: n.node_key === entryNodeId,
        isSelected: n.node_key === selectedKey,
        onSelectNode: (key: string) => {
          setSelectedKey(key)
          const found = nodes.find((item) => item.node_key === key) || null
          setSelectedNode(found)
        },
      },
    }))
  }, [nodes, entryNodeId, selectedKey])

  // Derive Edges from node configs
  const rfEdges: Edge[] = useMemo(() => {
    const list: Edge[] = []
    for (const n of nodes) {
      if (n.node_type === 'condition') {
        const c = n.config as any
        if (c.true_next) {
          list.push({
            id: `edge-${n.node_key}-true-${c.true_next}`,
            source: n.node_key,
            sourceHandle: 'true',
            target: c.true_next,
            label: 'true',
            style: { stroke: '#10b981', strokeWidth: 2 },
          })
        }
        if (c.false_next) {
          list.push({
            id: `edge-${n.node_key}-false-${c.false_next}`,
            source: n.node_key,
            sourceHandle: 'false',
            target: c.false_next,
            label: 'false',
            style: { stroke: '#f43f5e', strokeWidth: 2 },
          })
        }
      } else if (n.node_type === 'send_buttons') {
        const btns = ((n.config.buttons as any[]) || [])
        for (const b of btns) {
          if (b.next_node_key) {
            list.push({
              id: `edge-${n.node_key}-${b.reply_id}-${b.next_node_key}`,
              source: n.node_key,
              sourceHandle: 'next',
              target: b.next_node_key,
              label: b.title,
              style: { strokeWidth: 2 },
            })
          }
        }
      } else {
        const next = (n.config as any)?.next_node_key
        if (next) {
          list.push({
            id: `edge-${n.node_key}-${next}`,
            source: n.node_key,
            sourceHandle: 'next',
            target: next,
            style: { strokeWidth: 2 },
          })
        }
      }
    }
    return list
  }, [nodes])

  // Dagre auto layout trigger on start if zero-positioned
  useEffect(() => {
    if (shouldAutoLayout(nodes)) {
      handleAutoLayout()
    }
  }, [])

  const handleAutoLayout = () => {
    const layoutNodes = nodes.map((n) => ({ id: n.node_key, width: 260, height: 110 }))
    const layoutEdges = rfEdges.map((e) => ({ source: e.source, target: e.target }))
    const positions = autoLayout(layoutNodes, layoutEdges)

    const updated = nodes.map((n) => {
      const pos = positions.get(n.node_key)
      if (pos) {
        return { ...n, position_x: pos.x, position_y: pos.y }
      }
      return n
    })
    onUpdateNodes(updated)
  }

  const onNodeDragStop = (_: any, node: Node) => {
    const updated = nodes.map((n) =>
      n.node_key === node.id ? { ...n, position_x: node.position.x, position_y: node.position.y } : n
    )
    onUpdateNodes(updated)
  }

  const onConnect = (params: Connection) => {
    if (!params.source || !params.target) return
    const sourceNode = nodes.find((n) => n.node_key === params.source)
    if (!sourceNode) return

    let updatedConfig = { ...sourceNode.config }
    if (sourceNode.node_type === 'condition') {
      if (params.sourceHandle === 'true') {
        updatedConfig.true_next = params.target
      } else {
        updatedConfig.false_next = params.target
      }
    } else {
      updatedConfig.next_node_key = params.target
    }

    const updated = nodes.map((n) =>
      n.node_key === params.source ? { ...n, config: updatedConfig } : n
    )
    onUpdateNodes(updated)
  }

  const addNode = (type: FlowNodeType) => {
    const newKey = `node_${type}_${Date.now().toString().slice(-4)}`
    const newNode: BuilderNode = {
      node_key: newKey,
      node_type: type,
      config:
        type === 'send_message'
          ? { text: 'Hello! Welcome.' }
          : type === 'send_buttons'
          ? { text: 'Choose an option:', buttons: [{ reply_id: 'btn_1', title: 'Option 1' }] }
          : type === 'collect_input'
          ? { prompt_text: 'Please enter your response:', var_key: 'input' }
          : type === 'condition'
          ? { subject_key: 'input', operator: 'equals', value: '' }
          : {},
      position_x: 200 + Math.floor(Math.random() * 80),
      position_y: 200 + Math.floor(Math.random() * 80),
    }

    onUpdateNodes([...nodes, newNode])
    setSelectedKey(newKey)
    setSelectedNode(newNode)
  }

  const deleteNode = (key: string) => {
    const filtered = nodes.filter((n) => n.node_key !== key)
    onUpdateNodes(filtered)
    setSelectedKey(null)
    setSelectedNode(null)
  }

  const updateSelectedNodeConfig = (patch: Record<string, any>) => {
    if (!selectedNode) return
    const updatedConfig = { ...selectedNode.config, ...patch }
    const updated = nodes.map((n) =>
      n.node_key === selectedNode.node_key ? { ...n, config: updatedConfig } : n
    )
    onUpdateNodes(updated)
    setSelectedNode({ ...selectedNode, config: updatedConfig })
  }

  return (
    <div className="relative h-[680px] w-full rounded-xl border border-border/60 bg-muted/10 overflow-hidden shadow-inner">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        fitView
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as any
            const colors = NODE_COLORS[data?.node?.node_type as FlowNodeType]
            return colors ? '#3b82f6' : '#94a3b8'
          }}
          className="!bottom-4 !right-4 !bg-card !border !border-border/60 !rounded-lg"
        />

        {/* Toolbar Panel */}
        <Panel position="top-left" className="flex flex-wrap gap-1.5 p-2 bg-card/90 backdrop-blur border border-border/60 rounded-xl shadow-md">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => addNode('send_message')}>
            <Plus className="h-3 w-3" /> Message
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => addNode('send_buttons')}>
            <Plus className="h-3 w-3" /> Buttons
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => addNode('collect_input')}>
            <Plus className="h-3 w-3" /> Collect Input
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => addNode('condition')}>
            <Plus className="h-3 w-3" /> Condition
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => addNode('handoff')}>
            <Plus className="h-3 w-3" /> Handoff
          </Button>
          <Button size="sm" variant="secondary" className="h-8 text-xs gap-1 ml-2" onClick={handleAutoLayout}>
            <LayoutGrid className="h-3 w-3" /> Auto Layout
          </Button>
        </Panel>
      </ReactFlow>

      {/* Redesigned Node Inspector Sheet */}
      <Sheet open={Boolean(selectedNode)} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <SheetContent className="w-full sm:max-w-lg md:max-w-xl p-0 flex flex-col h-full bg-background border-l shadow-2xl z-50 overflow-hidden">
          {selectedNode && (() => {
            const colors = NODE_COLORS[selectedNode.node_type] || NODE_COLORS.send_message
            const isEntry = entryNodeId === selectedNode.node_key

            return (
              <div className="flex flex-col h-full overflow-hidden">
                {/* 1. Header with Node Icon Badge, Key, Type */}
                <div className="p-5 pr-14 border-b bg-card/60 backdrop-blur shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${colors.bg} ${colors.text} ${colors.border} shadow-2xs`}>
                      {selectedNode.node_type === 'start' && <Play className="h-5 w-5" />}
                      {selectedNode.node_type === 'send_message' && <MessageSquare className="h-5 w-5" />}
                      {selectedNode.node_type === 'send_buttons' && <Layers className="h-5 w-5" />}
                      {selectedNode.node_type === 'send_list' && <ListFilter className="h-5 w-5" />}
                      {selectedNode.node_type === 'collect_input' && <HelpCircle className="h-5 w-5" />}
                      {selectedNode.node_type === 'condition' && <LayoutGrid className="h-5 w-5" />}
                      {selectedNode.node_type === 'handoff' && <PhoneCall className="h-5 w-5" />}
                      {selectedNode.node_type === 'end' && <CheckCircle2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold tracking-tight text-foreground font-mono">
                          {selectedNode.node_key}
                        </h2>
                        <Badge variant="outline" className={`text-[10px] font-medium capitalize px-2 py-0.5 ${colors.bg} ${colors.text} ${colors.border}`}>
                          {selectedNode.node_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Configure message body, routing, and interactive actions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Flow Entry Indicator / Toggle Banner */}
                <div className={`px-5 py-2.5 border-b flex items-center justify-between text-xs transition-colors shrink-0 ${
                  isEntry ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-muted/30 border-border/50 text-muted-foreground'
                }`}>
                  <div className="flex items-center gap-2">
                    {isEntry ? (
                      <>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Flow Entry Point</span>
                        <span className="text-[11px] opacity-75 hidden sm:inline">(Trigger keywords route here)</span>
                      </>
                    ) : (
                      <>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Secondary node in flow sequence</span>
                      </>
                    )}
                  </div>

                  {!isEntry && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[11px] font-medium border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => onSetEntryNodeId(selectedNode.node_key)}
                    >
                      <Play className="h-2.5 w-2.5 mr-1" />
                      Set as Entry
                    </Button>
                  )}
                </div>

                {/* 3. Main Body Tabs (Config vs Live Preview) */}
                <Tabs defaultValue="config" className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-5 pt-3 border-b bg-muted/20 shrink-0">
                    <TabsList className="h-8 bg-muted/60 p-1">
                      <TabsTrigger value="config" className="text-xs gap-1.5 h-6 px-3">
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>Node Settings</span>
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs gap-1.5 h-6 px-3">
                        <Smartphone className="h-3 w-3" />
                        <span>WhatsApp Live Preview</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* TAB 1: Configuration */}
                  <TabsContent value="config" className="flex-1 overflow-y-auto p-5 space-y-5 m-0 focus-visible:outline-none">
                    {/* SEND MESSAGE NODE */}
                    {selectedNode.node_type === 'send_message' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                              Message Text
                            </Label>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              *bold* _italic_ ~strike~
                            </span>
                          </div>
                          <Textarea
                            rows={6}
                            value={((selectedNode.config.text as string) || '').replace(/\\n/g, '\n')}
                            onChange={(e) => updateSelectedNodeConfig({ text: e.target.value })}
                            placeholder="Type WhatsApp message..."
                            className="font-sans text-xs leading-relaxed resize-y bg-muted/20 border-border/70 focus-visible:ring-primary/20"
                          />
                        </div>

                        {/* Next Node Target Dropdown */}
                        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                          <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <ArrowRight className="h-3.5 w-3.5 text-primary" />
                            Next Step (After Message is Sent)
                          </Label>
                          <Select
                            value={(selectedNode.config.next_node_key as string) || 'none'}
                            onValueChange={(val) =>
                              updateSelectedNodeConfig({ next_node_key: val === 'none' ? '' : val })
                            }
                          >
                            <SelectTrigger className="h-9 text-xs bg-background">
                              <SelectValue placeholder="Choose destination node..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">(None / Stop Here)</SelectItem>
                              {nodes
                                .filter((n) => n.node_key !== selectedNode.node_key)
                                .map((n) => (
                                  <SelectItem key={n.node_key} value={n.node_key}>
                                    <span className="font-semibold">{n.node_key}</span>{' '}
                                    <span className="text-muted-foreground text-[11px]">({n.node_type})</span>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* SEND BUTTONS NODE */}
                    {selectedNode.node_type === 'send_buttons' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                              Body Message Text
                            </Label>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              *bold* _italic_
                            </span>
                          </div>
                          <Textarea
                            rows={5}
                            value={((selectedNode.config.text as string) || '').replace(/\\n/g, '\n')}
                            onChange={(e) => updateSelectedNodeConfig({ text: e.target.value })}
                            placeholder="Type prompt or message before options..."
                            className="font-sans text-xs leading-relaxed resize-y bg-muted/20 border-border/70 focus-visible:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Footer / Instructions (Optional)</Label>
                          <Input
                            placeholder="e.g. Choose one option below"
                            value={(selectedNode.config.footer_text as string) || ''}
                            onChange={(e) => updateSelectedNodeConfig({ footer_text: e.target.value })}
                            className="h-8 text-xs bg-muted/20"
                          />
                        </div>

                        {/* Interactive Button Items List */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5 text-purple-500" />
                              Option Buttons
                            </Label>
                            <span className="text-[11px] text-muted-foreground">
                              {((selectedNode.config.buttons as any[]) || []).length} Options
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {((selectedNode.config.buttons as any[]) || []).map((b, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl border border-border/80 bg-card hover:border-primary/30 transition-all space-y-2.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                                      {i + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-foreground">
                                      {b.title || `Option ${i + 1}`}
                                    </span>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      const updated = ((selectedNode.config.buttons as any[]) || []).filter((_, idx) => idx !== i)
                                      updateSelectedNodeConfig({ buttons: updated })
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground font-medium">Button Label</span>
                                    <Input
                                      placeholder="e.g. 💼 Talk to Sales"
                                      value={b.title || ''}
                                      onChange={(e) => {
                                        const updated = [...(selectedNode.config.buttons as any[])]
                                        updated[i] = { ...updated[i], title: e.target.value }
                                        updateSelectedNodeConfig({ buttons: updated })
                                      }}
                                      className="h-8 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground font-medium">Payload / ID</span>
                                    <Input
                                      placeholder="btn_1"
                                      value={b.reply_id || ''}
                                      onChange={(e) => {
                                        const updated = [...(selectedNode.config.buttons as any[])]
                                        updated[i] = { ...updated[i], reply_id: e.target.value }
                                        updateSelectedNodeConfig({ buttons: updated })
                                      }}
                                      className="h-8 text-xs font-mono"
                                    />
                                  </div>
                                </div>

                                {/* Connect to Node Dropdown for this button */}
                                <div className="space-y-1 pt-1 border-t border-border/40">
                                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                    <CornerDownRight className="h-3 w-3" />
                                    When chosen, route to:
                                  </span>
                                  <Select
                                    value={b.next_node_key || 'none'}
                                    onValueChange={(val) => {
                                      const updated = [...(selectedNode.config.buttons as any[])]
                                      updated[i] = { ...updated[i], next_node_key: val === 'none' ? '' : val }
                                      updateSelectedNodeConfig({ buttons: updated })
                                    }}
                                  >
                                    <SelectTrigger className="h-7 text-xs bg-muted/30">
                                      <SelectValue placeholder="Select target node..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">(Stop / End)</SelectItem>
                                      {nodes
                                        .filter((n) => n.node_key !== selectedNode.node_key)
                                        .map((n) => (
                                          <SelectItem key={n.node_key} value={n.node_key}>
                                            <span className="font-semibold">{n.node_key}</span>{' '}
                                            <span className="text-muted-foreground text-[10px]">({n.node_type})</span>
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5 text-xs h-8 gap-1.5"
                            onClick={() => {
                              const existing = (selectedNode.config.buttons as any[]) || []
                              updateSelectedNodeConfig({
                                buttons: [
                                  ...existing,
                                  {
                                    reply_id: `btn_${existing.length + 1}`,
                                    title: `Option ${existing.length + 1}`,
                                    next_node_key: '',
                                  },
                                ],
                              })
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" /> Add Another Option Button
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* COLLECT INPUT NODE */}
                    {selectedNode.node_type === 'collect_input' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                            Question / Prompt to Customer
                          </Label>
                          <Textarea
                            rows={4}
                            value={((selectedNode.config.prompt_text as string) || '').replace(/\\n/g, '\n')}
                            onChange={(e) => updateSelectedNodeConfig({ prompt_text: e.target.value })}
                            placeholder="e.g. Please enter your full name or email address:"
                            className="font-sans text-xs leading-relaxed resize-y bg-muted/20 border-border/70"
                          />
                        </div>

                        <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-1.5">
                          <Label className="text-xs font-semibold flex items-center gap-1.5">
                            Save Answer as Variable Key
                          </Label>
                          <Input
                            value={(selectedNode.config.var_key as string) || ''}
                            placeholder="e.g. customer_name, email, query"
                            onChange={(e) => updateSelectedNodeConfig({ var_key: e.target.value })}
                            className="h-8 text-xs font-mono bg-background"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Use <span className="font-mono text-primary font-semibold">{'{{vars.' + ((selectedNode.config.var_key as string) || 'key') + '}}'}</span> in later nodes.
                          </p>
                        </div>

                        {/* Next Step */}
                        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                          <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <ArrowRight className="h-3.5 w-3.5 text-primary" />
                            Next Step After Input is Received
                          </Label>
                          <Select
                            value={(selectedNode.config.next_node_key as string) || 'none'}
                            onValueChange={(val) =>
                              updateSelectedNodeConfig({ next_node_key: val === 'none' ? '' : val })
                            }
                          >
                            <SelectTrigger className="h-9 text-xs bg-background">
                              <SelectValue placeholder="Choose destination node..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">(None / Stop Here)</SelectItem>
                              {nodes
                                .filter((n) => n.node_key !== selectedNode.node_key)
                                .map((n) => (
                                  <SelectItem key={n.node_key} value={n.node_key}>
                                    <span className="font-semibold">{n.node_key}</span>{' '}
                                    <span className="text-muted-foreground text-[11px]">({n.node_type})</span>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* CONDITION NODE */}
                    {selectedNode.node_type === 'condition' && (
                      <div className="space-y-4">
                        <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-3 shadow-2xs">
                          <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <LayoutGrid className="h-3.5 w-3.5 text-orange-500" />
                            Rule Evaluation Condition
                          </Label>

                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground font-medium">Variable to Test</span>
                            <Input
                              value={(selectedNode.config.subject_key as string) || ''}
                              placeholder="e.g. email, role, choice"
                              onChange={(e) => updateSelectedNodeConfig({ subject_key: e.target.value })}
                              className="h-8 text-xs font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground font-medium">Operator</span>
                              <Select
                                value={(selectedNode.config.operator as string) || 'equals'}
                                onValueChange={(val) => updateSelectedNodeConfig({ operator: val })}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">Equals (===)</SelectItem>
                                  <SelectItem value="contains">Contains Substring</SelectItem>
                                  <SelectItem value="present">Is Present (Not Empty)</SelectItem>
                                  <SelectItem value="absent">Is Empty</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground font-medium">Target Value</span>
                              <Input
                                value={(selectedNode.config.value as string) || ''}
                                placeholder="e.g. yes"
                                onChange={(e) => updateSelectedNodeConfig({ value: e.target.value })}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Branch Routes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              ✓ If TRUE ➔ Next Node
                            </span>
                            <Select
                              value={(selectedNode.config.true_next as string) || 'none'}
                              onValueChange={(val) =>
                                updateSelectedNodeConfig({ true_next: val === 'none' ? '' : val })
                              }
                            >
                              <SelectTrigger className="h-8 text-xs bg-background">
                                <SelectValue placeholder="Select node..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">(None / Stop)</SelectItem>
                                {nodes
                                  .filter((n) => n.node_key !== selectedNode.node_key)
                                  .map((n) => (
                                    <SelectItem key={n.node_key} value={n.node_key}>
                                      {n.node_key}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-1.5">
                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              ✕ If FALSE ➔ Next Node
                            </span>
                            <Select
                              value={(selectedNode.config.false_next as string) || 'none'}
                              onValueChange={(val) =>
                                updateSelectedNodeConfig({ false_next: val === 'none' ? '' : val })
                              }
                            >
                              <SelectTrigger className="h-8 text-xs bg-background">
                                <SelectValue placeholder="Select node..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">(None / Stop)</SelectItem>
                                {nodes
                                  .filter((n) => n.node_key !== selectedNode.node_key)
                                  .map((n) => (
                                    <SelectItem key={n.node_key} value={n.node_key}>
                                      {n.node_key}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HANDOFF NODE */}
                    {selectedNode.node_type === 'handoff' && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-1.5">
                          <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                            <PhoneCall className="h-4 w-4" />
                            Human Agent Takeover
                          </p>
                          <p className="text-[11px] text-rose-600/90 dark:text-rose-400 leading-relaxed">
                            When reached, this node pauses the automated flow machine and flags the contact for human agent attention.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">Internal Handoff Note</Label>
                          <Textarea
                            rows={3}
                            value={(selectedNode.config.note as string) || ''}
                            onChange={(e) => updateSelectedNodeConfig({ note: e.target.value })}
                            placeholder="e.g. Customer requested direct contact with Salamon..."
                            className="text-xs bg-muted/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* START & END NODES */}
                    {(selectedNode.node_type === 'start' || selectedNode.node_type === 'end') && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                          <p className="text-xs font-semibold">
                            {selectedNode.node_type === 'start' ? '🚀 Flow Starting Point' : '🏁 Flow End Point'}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {selectedNode.node_type === 'start'
                              ? 'This node is triggered when an inbound message matches your flow keywords. It immediately proceeds to the connected next node.'
                              : 'This node marks the completion of the conversation flow. The contact session is successfully closed.'}
                          </p>
                        </div>

                        {selectedNode.node_type === 'start' && (
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                              <ArrowRight className="h-3.5 w-3.5 text-primary" />
                              Next Node to Trigger
                            </Label>
                            <Select
                              value={(selectedNode.config.next_node_key as string) || 'none'}
                              onValueChange={(val) =>
                                updateSelectedNodeConfig({ next_node_key: val === 'none' ? '' : val })
                              }
                            >
                              <SelectTrigger className="h-9 text-xs bg-background">
                                <SelectValue placeholder="Select target node..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">(None / Stop)</SelectItem>
                                {nodes
                                  .filter((n) => n.node_key !== selectedNode.node_key)
                                  .map((n) => (
                                    <SelectItem key={n.node_key} value={n.node_key}>
                                      <span className="font-semibold">{n.node_key}</span>{' '}
                                      <span className="text-muted-foreground text-[10px]">({n.node_type})</span>
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* TAB 2: WhatsApp Live Preview */}
                  <TabsContent value="preview" className="flex-1 overflow-y-auto p-5 m-0 focus-visible:outline-none">
                    <div className="rounded-2xl border border-border/70 bg-[#efeae2] dark:bg-muted/15 p-4 shadow-inner space-y-3">
                      {/* Fake WhatsApp Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
                            WA
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground leading-none">Virtual Assistant</p>
                            <p className="text-[10px] text-emerald-600 font-medium">online</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-background/80">WhatsApp Preview</Badge>
                      </div>

                      {/* Fake WhatsApp Message Bubble */}
                      <div className="flex justify-start">
                        <div className="max-w-[92%] rounded-xl rounded-tl-none bg-card text-card-foreground p-3 shadow-md border border-border/40 space-y-2 text-xs">
                          {/* Body text with formatting */}
                          <div
                            className="whitespace-pre-wrap leading-relaxed text-foreground"
                            dangerouslySetInnerHTML={{
                              __html: (
                                (selectedNode.config.text as string) ||
                                (selectedNode.config.prompt_text as string) ||
                                (selectedNode.config.note as string) ||
                                '*(Empty message)*'
                              )
                                .replace(/\\n/g, '\n')
                                .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                                .replace(/_(.*?)_/g, '<em>$1</em>')
                                .replace(/~(.*?)~/g, '<del>$1</del>')
                                .replace(/\n/g, '<br />'),
                            }}
                          />

                          {/* Footer text if present */}
                          {Boolean(selectedNode.config.footer_text) && (
                            <p className="text-[10px] text-muted-foreground italic border-t border-border/40 pt-1">
                              {selectedNode.config.footer_text as string}
                            </p>
                          )}

                          <div className="text-[9px] text-muted-foreground/70 text-right pt-0.5">
                            Just now ✓✓
                          </div>
                        </div>
                      </div>

                      {/* Interactive Button Chips underneath */}
                      {selectedNode.node_type === 'send_buttons' && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] text-muted-foreground font-semibold px-1">
                            Interactive Options Sent:
                          </p>
                          {((selectedNode.config.buttons as any[]) || []).map((b, i) => (
                            <div
                              key={i}
                              className="w-full flex items-center justify-between p-2 rounded-lg bg-card/90 border border-primary/20 text-xs font-medium text-primary shadow-xs"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs">{i + 1}.</span>
                                <span>{b.title || `Option ${i + 1}`}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ➔ {b.next_node_key || '(Stop)'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 4. Drawer Action Footer */}
                <div className="p-4 border-t bg-card/80 backdrop-blur flex items-center justify-between shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs gap-1.5 h-8 px-2.5"
                    onClick={() => {
                      if (confirm(`Delete node "${selectedNode.node_key}"? This action cannot be undone.`)) {
                        deleteNode(selectedNode.node_key)
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Node</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3"
                    onClick={() => setSelectedNode(null)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            )
          })()}
        </SheetContent>
      </Sheet>
    </div>
  )
}
