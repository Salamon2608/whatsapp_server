export type AutomationTriggerType =
  | 'new_message_received'
  | 'first_inbound_message'
  | 'keyword_match'
  | 'new_contact_created'
  | 'conversation_assigned'
  | 'tag_added'
  | 'time_based'
  | 'interactive_reply'

export type AutomationStepType =
  | 'send_message'
  | 'send_buttons'
  | 'send_list'
  | 'send_template'
  | 'send_webhook'
  | 'wait'
  | 'condition'
  | 'add_tag'
  | 'remove_tag'
  | 'assign_conversation'
  | 'update_contact_field'
  | 'create_deal'

export interface KeywordMatchTriggerConfig {
  keywords: string[]
  match_type?: 'exact' | 'contains' | 'word'
  case_sensitive?: boolean
}

export interface InteractiveReplyTriggerConfig {
  reply_ids: string[]
}

export interface TagTriggerConfig {
  tag_id: string
}

export type AutomationTriggerConfig =
  | KeywordMatchTriggerConfig
  | InteractiveReplyTriggerConfig
  | TagTriggerConfig
  | Record<string, unknown>

export interface SendMessageStepConfig {
  text: string
}

export interface ButtonItem {
  id?: string
  reply_id: string
  title: string
}

export interface SendButtonsStepConfig {
  text: string
  footer_text?: string
  buttons: ButtonItem[]
}

export interface ListRowItem {
  id?: string
  reply_id: string
  title: string
  description?: string
}

export interface ListSectionItem {
  title: string
  rows: ListRowItem[]
}

export interface SendListStepConfig {
  text: string
  button_text: string
  title?: string
  footer_text?: string
  sections: ListSectionItem[]
}

export interface WaitStepConfig {
  amount: number
  unit: 'minutes' | 'hours' | 'days'
}

export interface ConditionStepConfig {
  subject: 'message_content' | 'time_of_day' | 'contact_field' | 'tag_presence'
  operand?: string
  value?: string
}

export interface TagStepConfig {
  tag_id: string
}

export interface AssignConversationStepConfig {
  mode: 'specific_agent' | 'round_robin'
  agent_id?: string
}

export type AutomationStepConfig =
  | SendMessageStepConfig
  | SendButtonsStepConfig
  | SendListStepConfig
  | WaitStepConfig
  | ConditionStepConfig
  | TagStepConfig
  | AssignConversationStepConfig
  | Record<string, unknown>

export interface AutomationLogStepResult {
  step_id?: string
  step_type: string
  status: 'success' | 'failed' | 'skipped'
  output?: Record<string, unknown>
  error?: string
  executed_at: string
}
