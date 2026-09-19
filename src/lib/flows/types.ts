export type FlowNodeType =
  | 'start'
  | 'send_message'
  | 'send_buttons'
  | 'send_list'
  | 'send_media'
  | 'collect_input'
  | 'condition'
  | 'set_tag'
  | 'handoff'
  | 'end'

export interface StartNodeConfig {
  next_node_key: string
}

export interface SendMessageNodeConfig {
  text: string
  next_node_key: string
}

export interface FlowButtonOption {
  reply_id: string
  title: string
  next_node_key: string
}

export interface SendButtonsNodeConfig {
  text: string
  footer_text?: string
  buttons: FlowButtonOption[]
}

export interface FlowListRow {
  reply_id: string
  title: string
  description?: string
  next_node_key: string
}

export interface FlowListSection {
  title: string
  rows: FlowListRow[]
}

export interface SendListNodeConfig {
  text: string
  button_text: string
  title?: string
  footer_text?: string
  sections: FlowListSection[]
}

export interface CollectInputNodeConfig {
  prompt_text: string
  var_key: string
  next_node_key: string
}

export interface ConditionNodeConfig {
  subject: 'var' | 'contact_field'
  subject_key: string
  operator: 'equals' | 'contains' | 'present' | 'absent'
  value?: string
  true_next: string
  false_next: string
}

export interface HandoffNodeConfig {
  note?: string
  assigned_agent_id?: string
}

export interface FlowFallbackPolicy {
  on_unknown_reply: 'reprompt' | 'handoff' | 'ignore'
  max_reprompts: number
  on_timeout_hours: number
  on_exhaust: 'handoff' | 'end'
}

export const DEFAULT_FALLBACK_POLICY: FlowFallbackPolicy = {
  on_unknown_reply: 'reprompt',
  max_reprompts: 2,
  on_timeout_hours: 24,
  on_exhaust: 'handoff',
}

export interface BuilderNode {
  id?: string
  node_key: string
  node_type: FlowNodeType
  config: Record<string, any>
  position_x?: number
  position_y?: number
}

export interface FlowTemplate {
  slug: string
  name: string
  description: string
  icon?: string
  trigger_type: 'keyword' | 'first_inbound_message' | 'manual'
  trigger_config: Record<string, unknown>
  entry_node_id: string
  nodes: BuilderNode[]
}

export interface ParsedInbound {
  kind: 'text' | 'interactive_reply'
  text?: string
  reply_id?: string
  reply_title?: string
}
