import type {
  FlowTemplate,
  SendMessageNodeConfig,
  SendButtonsNodeConfig,
  CollectInputNodeConfig,
  HttpRequestNodeConfig,
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

const PONDYKINGS_BOATING: FlowTemplate = {
  slug: 'pondykings_boating',
  name: 'PondyKings Boating Tour Assistant',
  description:
    'Live boat packages, daily time slots, attractions, and real-time offers dynamically fetched from pondykingsboating.in.',
  icon: 'Anchor',
  trigger_type: 'keyword',
  trigger_config: {
    keywords: ['boat', 'boating', 'pondy', 'pondykings', 'package', 'packages', 'price', 'rates', 'booking'],
    match_type: 'contains',
  },
  entry_node_id: 'start',
  nodes: [
    {
      node_key: 'start',
      node_type: 'start',
      config: { next_node_key: 'fetch_packages' },
      position_x: 0,
      position_y: 0,
    },
    {
      node_key: 'fetch_packages',
      node_type: 'http_request',
      config: {
        url: 'https://pondykingsboating.in/api/packages',
        method: 'GET',
        headers: [],
        response_mappings: [
          { json_path: 'data', var_key: 'packages_list' },
        ],
        next_node_key: 'show_packages',
        error_node_key: 'fallback_packages',
      } as HttpRequestNodeConfig,
      position_x: 0,
      position_y: 120,
    },
    {
      node_key: 'show_packages',
      node_type: 'send_message',
      config: {
        text: '🚤 *Welcome to PondyKings Boating!* 🌴\n_Premier Backwater & Mangrove Boat Tours in Pondicherry_\n\n📍 *Boarding Location:*\n1, Boat House Road, New Port (Inside Expo Ground), Uppalam, Pondicherry - 605001\n\n⏰ *Operating Hours:* 8:00 AM – 6:00 PM (Daily)\n⏱️ *Tour Duration:* 60 Mins (1 Hour)\n\n✨ *4 Destinations Covered in Every Ride:*\n1. 🌿 Mangrove Forest Channels\n2. ⚓ Fishing Harbour\n3. 🏛️ Arikamedu Ancient Roman Port\n4. 🌊 River Mouth (Backwaters meet Bay of Bengal)\n\n━━━━━━━━━━━━━━━━━━━━\n🔥 *LIVE PACKAGES & PRICES (Updated Daily):*\n━━━━━━━━━━━━━━━━━━━━\n{{vars.packages_list}}\n\n_Reply with an option below to continue:_',
        next_node_key: 'options_menu',
      } as SendMessageNodeConfig,
      position_x: -120,
      position_y: 260,
    },
    {
      node_key: 'fallback_packages',
      node_type: 'send_message',
      config: {
        text: '🚤 *PondyKings Boating Tour Packages:* 🌴\n\n• *Mangrove Group Boating* (10 Max) | 💰 ₹500/adult, ₹250/child\n• *Couple\'s Private Escape* (2 Max) | 💰 ₹3,500/trip\n• *Friends & Family Cruise* (5 Max) | 💰 ₹4,400/trip\n• *Royal Private Cruise* (8 Max) | 💰 ₹4,500/trip\n• *Kings Grand Cruise* (10 Max) | 💰 ₹5,000/trip\n• *Bulk Booking* (Schools & Corporate) | 💰 ₹400/head\n\n📍 *Boarding:* 1, Boat House Road, New Port (Expo Ground), Uppalam\n⏰ *Timings:* 8:00 AM – 6:00 PM (Daily)',
        next_node_key: 'options_menu',
      } as SendMessageNodeConfig,
      position_x: 180,
      position_y: 260,
    },
    {
      node_key: 'options_menu',
      node_type: 'send_buttons',
      config: {
        text: 'What would you like to check next?',
        footer_text: 'Choose an option',
        buttons: [
          {
            reply_id: 'btn_timings',
            title: '⏰ Daily Time Slots',
            next_node_key: 'fetch_timeslots',
          },
          {
            reply_id: 'btn_location',
            title: '📍 Tour Attractions',
            next_node_key: 'fetch_locations',
          },
          {
            reply_id: 'btn_book',
            title: '🎟️ Offers & Booking',
            next_node_key: 'fetch_offers',
          },
        ],
      } as SendButtonsNodeConfig,
      position_x: 0,
      position_y: 400,
    },
    {
      node_key: 'fetch_timeslots',
      node_type: 'http_request',
      config: {
        url: 'https://pondykingsboating.in/api/timeslots',
        method: 'GET',
        headers: [],
        response_mappings: [
          { json_path: 'data', var_key: 'timeslots_list' },
        ],
        next_node_key: 'show_timeslots',
        error_node_key: 'fallback_timeslots',
      } as HttpRequestNodeConfig,
      position_x: -240,
      position_y: 540,
    },
    {
      node_key: 'show_timeslots',
      node_type: 'send_message',
      config: {
        text: '⏰ *Live Operating Time Slots (Today):*\n_Departures running daily from Uppalam:_\n\n{{vars.timeslots_list}}\n\n🌅 *Recommended Sunset Golden Hour:*\n4:00 PM – 6:00 PM for the most breathtaking views where the backwaters meet the Bay of Bengal!\n\n🎟️ *Instant Online Booking:*\n👉 https://pondykingsboating.in/booking.html',
        next_node_key: 'end',
      } as SendMessageNodeConfig,
      position_x: -240,
      position_y: 680,
    },
    {
      node_key: 'fallback_timeslots',
      node_type: 'send_message',
      config: {
        text: '⏰ *Daily Operating Hours:*\n\n• 8:00 AM – 6:00 PM (Monday to Sunday)\n• Rides depart hourly (8 AM, 9 AM, 10 AM, 11 AM, 12 PM, 1 PM, 2 PM, 3 PM, 4 PM, 5 PM)\n• 🌅 Best Sunset Slot: 4:00 PM – 6:00 PM\n\n🎟️ *Book Online:* https://pondykingsboating.in/booking.html',
        next_node_key: 'end',
      } as SendMessageNodeConfig,
      position_x: -240,
      position_y: 800,
    },
    {
      node_key: 'fetch_locations',
      node_type: 'http_request',
      config: {
        url: 'https://pondykingsboating.in/api/locations',
        method: 'GET',
        headers: [],
        response_mappings: [
          { json_path: 'data', var_key: 'locations_list' },
        ],
        next_node_key: 'show_locations',
        error_node_key: 'fallback_locations',
      } as HttpRequestNodeConfig,
      position_x: 0,
      position_y: 540,
    },
    {
      node_key: 'show_locations',
      node_type: 'send_message',
      config: {
        text: '📍 *Attractions & Sights Covered in Every Ride:*\n\n{{vars.locations_list}}\n\n━━━━━━━━━━━━━━━━━━━━\n🚗 *Boarding Point:*\n1, Boat House Road, New Port (Inside Expo Ground), Uppalam, Pondicherry - 605001.\n\n🗺️ *Google Maps:* https://maps.google.com/?q=PondyKings+Boating+Uppalam\n🚗 Free parking available inside Expo Ground!',
        next_node_key: 'end',
      } as SendMessageNodeConfig,
      position_x: 0,
      position_y: 680,
    },
    {
      node_key: 'fallback_locations',
      node_type: 'send_message',
      config: {
        text: '📍 *PondyKings Boating Boarding Point:*\n\n1, First Cross (Boat House Road), New Port (Inside Expo Ground), Uppalam, Pondicherry - 605001.\n\n🗺️ *Google Maps:* https://maps.google.com/?q=PondyKings+Boating+Uppalam\n\n🚗 Free parking inside the Expo Ground premises!',
        next_node_key: 'end',
      } as SendMessageNodeConfig,
      position_x: 0,
      position_y: 800,
    },
    {
      node_key: 'fetch_offers',
      node_type: 'http_request',
      config: {
        url: 'https://pondykingsboating.in/api/offers',
        method: 'GET',
        headers: [],
        response_mappings: [
          { json_path: 'data', var_key: 'offers_list' },
        ],
        next_node_key: 'show_offers',
        error_node_key: 'fallback_offers',
      } as HttpRequestNodeConfig,
      position_x: 240,
      position_y: 540,
    },
    {
      node_key: 'show_offers',
      node_type: 'send_message',
      config: {
        text: '🎟️ *Live Special Offers & Booking:*\n\n{{vars.offers_list}}\n\n👉 *Instant Online Booking:*\nhttps://pondykingsboating.in/booking.html\n\n1. Select your preferred date & time slot\n2. Choose your boat\n3. Instant confirmation voucher on WhatsApp!\n\n📞 Or call for phone booking: *+91 70947 27897*',
        next_node_key: 'end',
      } as SendMessageNodeConfig,
      position_x: 240,
      position_y: 680,
    },
    {
      node_key: 'fallback_offers',
      node_type: 'send_message',
      config: {
        text: '🎟️ *Instant Online Booking:*\n\n👉 https://pondykingsboating.in/booking.html\n\n📞 Phone booking / Inquiries: *+91 70947 27897*',
        next_node_key: 'end',
      } as SendMessageNodeConfig,
      position_x: 240,
      position_y: 800,
    },
    {
      node_key: 'end',
      node_type: 'end',
      config: {},
      position_x: 0,
      position_y: 920,
    },
  ],
}

const TEMPLATES: Record<string, FlowTemplate> = {
  welcome_menu: WELCOME_MENU,
  lead_capture: LEAD_CAPTURE,
  pondykings_boating: PONDYKINGS_BOATING,
}

export function getFlowTemplate(slug: string): FlowTemplate | null {
  return TEMPLATES[slug] ?? null
}

export function listFlowTemplates(): FlowTemplate[] {
  return Object.values(TEMPLATES)
}
