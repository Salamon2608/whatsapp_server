import type {
  FlowTemplate,
  SendMessageNodeConfig,
  SendButtonsNodeConfig,
  CollectInputNodeConfig,
  HandoffNodeConfig,
} from './types'

const WELCOME_MENU: FlowTemplate = {
  slug: 'welcome_menu',
  name: 'Welcome & Branching Menu',
  description:
    'Greet inbound contacts with an interactive menu and route them to Sales, Support, or FAQs.',
  icon: 'Compass',
  trigger_type: 'keyword',
  trigger_config: {
    keywords: ['hi', 'hello', 'start', 'menu', 'help'],
    match_type: 'contains',
  },
  entry_node_id: 'start',
  nodes: [
    {
      node_key: 'start',
      node_type: 'start',
      config: { next_node_key: 'welcome_buttons' },
      position_x: 0,
      position_y: 0,
    },
    {
      node_key: 'welcome_buttons',
      node_type: 'send_buttons',
      config: {
        text: '👋 *Welcome!* Thanks for messaging us.\n\nPlease choose an option below:',
        footer_text: 'Choose one option',
        buttons: [
          {
            reply_id: 'btn_sales',
            title: '💼 Talk to Sales',
            next_node_key: 'sales_node',
          },
          {
            reply_id: 'btn_support',
            title: '🛠️ Support & Help',
            next_node_key: 'support_node',
          },
          {
            reply_id: 'btn_hours',
            title: '🕒 Working Hours',
            next_node_key: 'hours_node',
          },
        ],
      } as SendButtonsNodeConfig,
      position_x: 0,
      position_y: 120,
    },
    {
      node_key: 'sales_node',
      node_type: 'handoff',
      config: {
        note: 'Customer requested to speak with the sales department.',
      } as HandoffNodeConfig,
      position_x: -250,
      position_y: 280,
    },
    {
      node_key: 'support_node',
      node_type: 'handoff',
      config: {
        note: 'Customer requested customer support assistance.',
      } as HandoffNodeConfig,
      position_x: 0,
      position_y: 280,
    },
    {
      node_key: 'hours_node',
      node_type: 'send_message',
      config: {
        text: '⏰ Our office is open Monday to Saturday, 9:00 AM – 6:00 PM.\n\nLeave your message anytime and we will respond promptly!',
        next_node_key: 'end',
      } as SendMessageNodeConfig,
      position_x: 250,
      position_y: 280,
    },
    {
      node_key: 'end',
      node_type: 'end',
      config: {},
      position_x: 250,
      position_y: 420,
    },
  ],
}

const LEAD_CAPTURE: FlowTemplate = {
  slug: 'lead_capture',
  name: 'Lead Capture Form',
  description:
    'Greet first-time inbounds, collect customer name, email, and inquiry, and notify an agent.',
  icon: 'UserPlus',
  trigger_type: 'first_inbound_message',
  trigger_config: {},
  entry_node_id: 'start',
  nodes: [
    {
      node_key: 'start',
      node_type: 'start',
      config: { next_node_key: 'intro' },
      position_x: 0,
      position_y: 0,
    },
    {
      node_key: 'intro',
      node_type: 'send_message',
      config: {
        text: 'Welcome! 👋 I will ask a few quick questions so we can connect you with the right team.',
        next_node_key: 'ask_name',
      } as SendMessageNodeConfig,
      position_x: 0,
      position_y: 120,
    },
    {
      node_key: 'ask_name',
      node_type: 'collect_input',
      config: {
        prompt_text: 'May I know your full name?',
        var_key: 'name',
        next_node_key: 'ask_email',
      } as CollectInputNodeConfig,
      position_x: 0,
      position_y: 240,
    },
    {
      node_key: 'ask_email',
      node_type: 'collect_input',
      config: {
        prompt_text: 'Thanks! What is your email address?',
        var_key: 'email',
        next_node_key: 'handoff',
      } as CollectInputNodeConfig,
      position_x: 0,
      position_y: 360,
    },
    {
      node_key: 'handoff',
      node_type: 'handoff',
      config: {
        note: 'New lead submitted details.',
      } as HandoffNodeConfig,
      position_x: 0,
      position_y: 480,
    },
  ],
}

const TEMPLATES: Record<string, FlowTemplate> = {
  welcome_menu: WELCOME_MENU,
  lead_capture: LEAD_CAPTURE,
}

export function getFlowTemplate(slug: string): FlowTemplate | null {
  return TEMPLATES[slug] ?? null
}

export function listFlowTemplates(): FlowTemplate[] {
  return Object.values(TEMPLATES)
}
