# Graph Report - Whatsapp_Server  (2026-09-21)

## Corpus Check
- 313 files · ~591,510 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 7, .log 2, .example 1)

## Summary
- 2199 nodes · 4647 edges · 154 communities (137 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ae65b2d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- canAccessSession
- dependencies
- scheduler/page.tsx
- cn
- chat/actions.ts
- 📂 Chat
- package.json
- @prisma/client
- lucide-react
- fireSentWebhook
- sheet.tsx
- dashboard/layout.tsx
- auto-reply.ts
- dashboard/page.tsx
- api-auth.ts
- form.tsx
- 📂 Labels
- flows/engine.ts
- devDependencies
- compilerOptions
- components.json
- docs-client.tsx
- 📂 Sessions
- navbar.tsx
- isAdmin
- button.tsx
- 📂 Webhooks
- react
- getAuthenticatedUser
- AntiSpamManager
- 📂 Scheduler
- scripts
- 📂 Users
- tsconfig.server.json
- generate-docs.js
- \[PUT\] /profile/{sessionId}/name
- 📂 Profile
- swagger.ts
- \[POST\] /status/{sessionId}/update
- prisma.ts
- \[PUT\] /profile/{sessionId}/picture
- inject-swagger.js
- \[GET\] /chats/by-label/{labelId}
- CHANGELOG.md
- 📂 Notifications
- check_port.js
- 🚀 WhatsApp Server: The Ultimate Gateway & Dashboard
- Payload Examples
- overrides
- swagger/page.tsx
- test_endpoints.sh
- privacy/page.tsx
- terms/page.tsx
- eslint.config.mjs
- postcss.config.mjs
- start.sh
- { GET, POST }
- Common Operations
- \[POST\] /autoreplies/{sessionId}
- agents/page.tsx
- 📖 WA-AKG User Manual
- WhatsApp AI Gateway — Complete API Reference
- 🗄️ Database Setup Guide
- PULL_REQUEST_TEMPLATE.md
- API Deep Analysis Report
- \[POST\] /auth/register
- Option B: Manual Update Process
- [v1.6.0] - 2026-06-23
- docs/README.md
- 📦 Schemas
- \[DELETE\] /sessions/{sessionId}/access
- 📂 Messaging
- Verify Examples
- 🔐 Environment Variables Guide
- 🏗️ WA-AKG Project Architecture & Logic
- \[POST\] /contacts/{sessionId}/{jid}/block
- 📂 Groups
- automations/engine.ts
- 📂 Knowledge Base Index
- builder-tree.ts
- autoreply.ts
- Contributing to WA-AKG
- Security Policy — WA-AKG
- KeywordChatbot
- \[POST\] /messages/{sessionId}/{jid}/send
- \[POST\] /messages/{sessionId}/{jid}/media
- \[POST\] /groups/{sessionId}/create
- \[POST\] /messages/{sessionId}/broadcast
- [POST] /messages/{sessionId}/{jid}/poll
- \[POST\] /messages/{sessionId}/{jid}/location
- \[POST\] /messages/{sessionId}/{jid}/contact
- \[POST\] /messages/{sessionId}/{jid}/{messageId}/react
- \[POST\] /messages/{sessionId}/{jid}/{messageId}/reply
- \[POST\] /messages/{sessionId}/{jid}/reply
- \[POST\] /messages/{sessionId}/{jid}/{messageId}/star
- \[PUT\] /groups/{sessionId}/{jid}/subject
- \[POST\] /messages/{sessionId}/{jid}/list
- \[POST\] /messages/{sessionId}/{jid}/spam
- \[POST\] /messages/{sessionId}/{jid}/sticker
- \[POST\] /messages/{sessionId}/forward
- \[PATCH\] /messages/{sessionId}/{jid}/{messageId}
- \[PUT\] /groups/{jid}/subject
- layout.ts
- \[PUT\] /groups/{sessionId}/{jid}/members
- \[POST\] /groups/{jid}/leave
- \[POST\] /groups/{sessionId}/invite/accept
- \[PUT\] /groups/{sessionId}/{jid}/picture
- \[PUT\] /groups/{sessionId}/{jid}/settings
- \[PUT\] /groups/{sessionId}/{jid}/description
- \[PUT\] /groups/{sessionId}/{jid}/ephemeral
- chat-list.tsx
- [v1.5.2] - 2026-03-20
- [v1.5.1-beta.2] - 2026-03-02
- [v1.5.0] - 2026-02-26
- Nopan design system
- webhook.ts
- [1.0.6] - 2026-01-13
- [v1.6.4] - 2026-07-12
- [v1.6.3] - 2026-06-30
- [v1.5.5] - 2026-06-03
- [v1.5.3] - 2026-04-08
- [v1.5.3-beta.1] - 2026-03-22
- [v1.6.2] - 2026-06-28
- [v1.5.2-beta.2] - 2026-03-20
- [v1.5.2-beta.1] - 2026-03-15
- [v1.5.1] - 2026-03-03
- [v1.5.1-beta.1] - 2026-03-02
- [v1.4.0] - 2026-02-21
- \[GET\] /groups/{sessionId}
- \[GET\] /messages/{sessionId}/download/{messageId}/media
- \[GET\] /messages/{sessionId}/search
- \[PUT\] /groups/{sessionId}/{jid}/invite
- \[GET\] /groups/{sessionId}/{jid}
- \[POST\] /groups/{sessionId}/{jid}/leave
- [1.1.0] - 2026-01-13
- [v1.5.4] - 2026-05-21
- [v1.5.3-beta.2] - 2026-04-03
- [v1.3.0] - 2026-02-01
- [v1.2.0] - 2026-01-18
- [beta-v1.1.0.1] - 2026-01-15
- [v1.6.1] - 2026-06-27
- automations/templates.ts
- api/media/route.ts
- rules/graphify.md
- SKILL.md
- workflows/graphify.md
- auth.ts
- rule-engine.ts
- app/page.tsx
- icon.tsx

## God Nodes (most connected - your core abstractions)
1. `getAuthenticatedUser()` - 217 edges
2. `canAccessSession()` - 168 edges
3. `cn()` - 125 edges
4. `react` - 89 edges
5. `prisma` - 86 edges
6. `lucide-react` - 71 edges
7. `waManager` - 50 edges
8. `Button()` - 49 edges
9. `Card()` - 34 edges
10. `CardContent()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `simulate()` --calls--> `normalizeJid()`  [EXTRACTED]
  test-message.ts → src/lib/jid-utils.ts
- `ChatWithJidPage()` --calls--> `canAccessSession()`  [EXTRACTED]
  src/app/dashboard/chat/[jid]/page.tsx → src/lib/api-auth.ts
- `ChatPage()` --calls--> `canAccessSession()`  [EXTRACTED]
  src/app/dashboard/chat/page.tsx → src/lib/api-auth.ts
- `SheetFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/sheet.tsx → src/lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/sheet.tsx → src/lib/utils.ts

## Import Cycles
- 2-file cycle: `src/modules/whatsapp/instance.ts -> src/modules/whatsapp/manager.ts -> src/modules/whatsapp/instance.ts`
- 4-file cycle: `src/lib/webhook.ts -> src/modules/whatsapp/manager.ts -> src/modules/whatsapp/instance.ts -> src/modules/whatsapp/store/index.ts -> src/lib/webhook.ts`

## Communities (154 total, 17 thin omitted)

### Community 0 - "canAccessSession"
Cohesion: 0.07
Nodes (32): moment-timezone, GET(), PUT(), DELETE(), PUT(), GET(), PUT(), GET() (+24 more)

### Community 1 - "dependencies"
Cohesion: 0.04
Nodes (54): dependencies, bcryptjs, class-variance-authority, clsx, cron-parser, @dagrejs/dagre, date-fns, @hookform/resolvers (+46 more)

### Community 2 - "scheduler/page.tsx"
Cohesion: 0.08
Nodes (50): sonner, Group, ChatLabelEntry, Contact, LabelData, WAP_COLORS, formatFileSize(), getSenderDisplay() (+42 more)

### Community 3 - "cn"
Cohesion: 0.07
Nodes (44): radix-ui, @radix-ui/react-scroll-area, Contact, InboxPage(), ProfileData, ProfilePage(), ChatWindowProps, ContextMenu() (+36 more)

### Community 4 - "chat/actions.ts"
Cohesion: 0.14
Nodes (17): GET(), POST(), POST(), createAutoReply(), deleteAutoReply(), getAutoReplies(), updateAutoReply(), CHAT_PAGE_SIZE (+9 more)

### Community 5 - "📂 Chat"
Cohesion: 0.04
Nodes (49): 📂 Chat, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example (+41 more)

### Community 6 - "package.json"
Cohesion: 0.04
Nodes (45): license, name, private, version, clsx, cron-parser, eslint, eslint-config-next (+37 more)

### Community 7 - "@prisma/client"
Cohesion: 0.12
Nodes (8): @prisma/client, prisma, { PrismaClient }, bcrypt, prisma, { PrismaClient }, prisma, prisma

### Community 8 - "lucide-react"
Cohesion: 0.10
Nodes (27): lucide-react, AutomationLogsPage(), AutomationsPage(), FlowRunsPage(), Notification, TYPE_STYLES, metadata, metadata (+19 more)

### Community 9 - "fireSentWebhook"
Cohesion: 0.24
Nodes (7): wa-sticker-formatter, POST(), POST(), POST(), POST(), POST(), fireSentWebhook()

### Community 10 - "sheet.tsx"
Cohesion: 0.19
Nodes (11): @radix-ui/react-dialog, NavGroup, navGroups, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 11 - "dashboard/layout.tsx"
Cohesion: 0.11
Nodes (18): @radix-ui/react-tooltip, Navbar(), RegistrationWarning(), SessionProvider(), SidebarContext, SidebarContextType, SidebarProvider(), useSidebar() (+10 more)

### Community 12 - "auto-reply.ts"
Cohesion: 0.13
Nodes (32): dynamic, GET(), POST(), dynamic, POST(), AiAutoReplyInput, AI_PROVIDER_DEFAULT_MODEL, aiRequestTimeoutMs() (+24 more)

### Community 13 - "dashboard/page.tsx"
Cohesion: 0.23
Nodes (8): GET(), GET(), dynamic, GET(), POST(), DashboardPage(), dynamic, getAccessibleSessions()

### Community 14 - "api-auth.ts"
Cohesion: 0.05
Nodes (36): POST(), PUT(), PUT(), PUT(), POST(), POST(), PUT(), POST() (+28 more)

### Community 15 - "form.tsx"
Cohesion: 0.11
Nodes (22): @radix-ui/react-label, react-hook-form, zod, formSchema, LoginForm(), formSchema, RegisterPage(), FormControl() (+14 more)

### Community 16 - "📂 Labels"
Cohesion: 0.05
Nodes (43): cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example (+35 more)

### Community 17 - "flows/engine.ts"
Cohesion: 0.09
Nodes (29): FlowsPage(), OutgoingSlot, advanceActiveRun(), DispatchFlowsInput, DispatchFlowsResult, dispatchInboundToFlows(), interpolateVars(), matchesTrigger() (+21 more)

### Community 18 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, eslint-config-next, next-swagger-doc, patch-package, postinstall-postinstall, prisma, swagger-ui-react (+13 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 20 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 21 - "docs-client.tsx"
Cohesion: 0.19
Nodes (9): react-markdown, remark-gfm, DocsClient(), DocsClientProps, TocItem, TocSection, metadata, TocItem (+1 more)

### Community 22 - "📂 Sessions"
Cohesion: 0.05
Nodes (41): cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example (+33 more)

### Community 23 - "navbar.tsx"
Cohesion: 0.06
Nodes (47): nextConfig, date-fns, next, nextjs-toploader, @radix-ui/react-popover, socket.io-client, geistMono, geistSans (+39 more)

### Community 24 - "isAdmin"
Cohesion: 0.16
Nodes (14): GET(), POST(), DELETE(), GET(), grantAccessSchema, POST(), revokeAccessSchema, DELETE() (+6 more)

### Community 25 - "button.tsx"
Cohesion: 0.19
Nodes (6): @radix-ui/react-slot, ERROR_CONFIGS, ErrorConfig, Button(), ButtonProps, buttonVariants

### Community 26 - "📂 Webhooks"
Cohesion: 0.06
Nodes (33): cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, \[DELETE\] /webhooks/{id} (+25 more)

### Community 27 - "react"
Cohesion: 0.12
Nodes (26): react, EditAutomationPage(), FlowEditorPage(), AccessEntry, SessionInfo, INITIAL_FORM_DATA, RuleFormData, SimMessage (+18 more)

### Community 28 - "getAuthenticatedUser"
Cohesion: 0.07
Nodes (34): systeminformation, DELETE(), dynamic, GET(), POST(), dynamic, GET(), DELETE() (+26 more)

### Community 30 - "📂 Scheduler"
Cohesion: 0.07
Nodes (28): cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, \[DELETE\] /scheduler/{sessionId}, \[DELETE\] /scheduler/{sessionId}/{scheduleId} (+20 more)

### Community 31 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, db:push, db:studio, dev, lint, make-admin, postinstall (+1 more)

### Community 32 - "📂 Users"
Cohesion: 0.07
Nodes (28): cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, \[DELETE\] /user/api-key (+20 more)

### Community 33 - "tsconfig.server.json"
Cohesion: 0.22
Nodes (8): ./tsconfig.json, compilerOptions, module, moduleResolution, noEmit, extends, ts-node, require

### Community 34 - "generate-docs.js"
Cohesion: 0.31
Nodes (7): fs, generateExample(), generateFieldsTable(), resolveRef(), resolveSchema(), swagger, tagMap

### Community 35 - "\[PUT\] /profile/{sessionId}/name"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PUT\] /profile/{sessionId}/name, Request Body (`application/json`), Responses

### Community 36 - "📂 Profile"
Cohesion: 0.13
Nodes (15): cURL Example, cURL Example, cURL Example, \[DELETE\] /profile/{sessionId}/picture, \[GET\] /profile/{sessionId}, Headers, Parameters, Parameters (+7 more)

### Community 37 - "swagger.ts"
Cohesion: 0.43
Nodes (4): next-swagger-doc, spec, GET(), getApiDocs()

### Community 38 - "\[POST\] /status/{sessionId}/update"
Cohesion: 0.09
Nodes (23): cURL Example, cURL Example, cURL Example, cURL Example, cURL Example, \[GET\] /settings/system, Headers, Headers (+15 more)

### Community 39 - "prisma.ts"
Cohesion: 0.05
Nodes (30): bcryptjs, registerSchema, POST(), dynamic, GET(), dynamic, PATCH(), GET() (+22 more)

### Community 40 - "\[PUT\] /profile/{sessionId}/picture"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PUT\] /profile/{sessionId}/picture, Request Body (`multipart/form-data`), Responses

### Community 41 - "inject-swagger.js"
Cohesion: 0.33
Nodes (5): additionalPaths, fs, path, swaggerFile, swaggerPath

### Community 42 - "\[GET\] /chats/by-label/{labelId}"
Cohesion: 0.40
Nodes (5): 📂 Chats, cURL Example, \[GET\] /chats/by-label/{labelId}, Parameters, Responses

### Community 43 - "CHANGELOG.md"
Cohesion: 0.11
Nodes (17): [1.0.7] - 2026-01-13, Added, Changed, Changed, Fixed, Fixed, Fixed, Fixed (+9 more)

### Community 44 - "📂 Notifications"
Cohesion: 0.11
Nodes (18): cURL Example, cURL Example, cURL Example, cURL Example, \[DELETE\] /notifications/delete, \[GET\] /notifications, Headers, Headers (+10 more)

### Community 45 - "check_port.js"
Cohesion: 0.67
Nodes (3): checkConnection(), interval, net

### Community 46 - "🚀 WhatsApp Server: The Ultimate Gateway & Dashboard"
Cohesion: 0.15
Nodes (13): 1. 📊 Dashboard & Analytics Services (NEW), 1. Prerequisites, 2. ⚡ Core API Gateway Services, 2. Setup, 3. Run (Development), 📚 API Reference Overview, Example: Send Text Message (PowerShell), 🏗️ How it Works (+5 more)

### Community 47 - "Payload Examples"
Cohesion: 0.11
Nodes (19): connection.update — Session connection state, contact.update — Contact name/notify changed, Events List, group.participant — Member joined/left/promoted, group.update — Group metadata changed, message.deleted — Message recalled/revoked, message.edited — Message edited, message.received — Audio / Sticker / Location / Contact (+11 more)

### Community 48 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, wa-sticker-formatter, sharp

### Community 59 - "Common Operations"
Cohesion: 0.06
Nodes (31): 10. Get Messages from a Chat, 11. Get Contacts (Paginated), 12. Get Groups, 13. Create a Group, 14. Update Bot Configuration, 15. Post WhatsApp Status, 1. Create a WhatsApp Session, 2. Get All Sessions (+23 more)

### Community 60 - "\[POST\] /autoreplies/{sessionId}"
Cohesion: 0.10
Nodes (21): 📂 Auto Reply, cURL Example, cURL Example, cURL Example, cURL Example, \[DELETE\] /autoreplies/{sessionId}/{replyId}, \[GET\] /autoreplies/{sessionId}, Headers (+13 more)

### Community 61 - "agents/page.tsx"
Cohesion: 0.22
Nodes (9): class-variance-authority, AiKnowledge(), AiPlayground(), AiUsage(), Tabs(), TabsContent(), TabsList(), tabsListVariants (+1 more)

### Community 62 - "📖 WA-AKG User Manual"
Cohesion: 0.14
Nodes (14): 1. Broadcast Engine, 1. Contact Management, 1. Real-time Chat, 2. Group Management, 2. Smart Scheduler, 2. Sticker Maker, 3. Automated Responses, ⚙️ Configuration (+6 more)

### Community 63 - "WhatsApp AI Gateway — Complete API Reference"
Cohesion: 0.12
Nodes (17): 🔐 Authentication, 📂 Auto Replies, 📋 Common Parameters, cURL Example, cURL Example, cURL Example, \[DELETE\] /autoreplies/{sessionId}, 📂 Documentation (+9 more)

### Community 64 - "🗄️ Database Setup Guide"
Cohesion: 0.14
Nodes (14): 1. Prerequisites, 2. Docker Compose Setup (Alternative), 3. Configuration (Bare-metal), 3. Initialization Commands, 4. Switching Database Provider, 5. Creating an Admin User, 6. Troubleshooting, 🗄️ Database Setup Guide (+6 more)

### Community 65 - "PULL_REQUEST_TEMPLATE.md"
Cohesion: 0.14
Nodes (13): ⚠️ Breaking Changes, ✅ Checklist, 📝 Description, Direct Chat URL, Direct Chat URL (`/dashboard/chat/[jid]`), 🔖 PR Type, 🔗 Related Issue, Reply Focus (+5 more)

### Community 66 - "API Deep Analysis Report"
Cohesion: 0.15
Nodes (12): 1. Architecture Overview, 2. Core Logic Analysis, 3. Code Quality Assessment, 4. Recommendations, 5. Conclusion, A. Session Management (`/api/sessions`), API Deep Analysis Report, 🔐 Authentication & Security (+4 more)

### Community 67 - "\[POST\] /auth/register"
Cohesion: 0.17
Nodes (12): cURL Example, cURL Example, cURL Example, \[GET\] /auth/csrf, \[GET\] /auth/session, Headers, \[POST\] /auth/register, Request Body (`application/json`) (+4 more)

### Community 68 - "Option B: Manual Update Process"
Cohesion: 0.17
Nodes (11): 1. Pull Latest Changes, 2. Update Dependencies, 3. Sync Database Schema, 4. Build & Restart, Option A: Automatic Update (Recommended), Option B: Manual Update Process, 🔒 Security Changelog (v1.6.1), 🚀 Standard Update Process (+3 more)

### Community 69 - "[v1.6.0] - 2026-06-23"
Cohesion: 0.18
Nodes (11): Added, Added, Changed, Changed, Database, Database, Fixed, Fixed (+3 more)

### Community 71 - "📦 Schemas"
Cohesion: 0.18
Nodes (11): Contact, Error, Group, GroupDetails, Label, Message, ScheduledMessage, 📦 Schemas (+3 more)

### Community 72 - "\[DELETE\] /sessions/{sessionId}/access"
Cohesion: 0.12
Nodes (17): cURL Example, cURL Example, cURL Example, \[DELETE\] /sessions/{sessionId}/access, \[GET\] /sessions/{sessionId}/access, Headers, Headers, Parameters (+9 more)

### Community 73 - "📂 Messaging"
Cohesion: 0.18
Nodes (11): cURL Example, cURL Example, cURL Example, \[DELETE\] /messages/{sessionId}/{jid}/{messageId}, [GET] /messages/{sessionId}/broadcast/history, [GET] /messages/{sessionId}/broadcast/history/{logId}, 📂 Messaging, Parameters (+3 more)

### Community 74 - "Verify Examples"
Cohesion: 0.20
Nodes (10): Go, How It Works, Node.js (Express), Node.js (Raw HTTP), PHP, Python (FastAPI), Python (Flask), Testing Your Webhook Receiver (+2 more)

### Community 75 - "🔐 Environment Variables Guide"
Cohesion: 0.20
Nodes (10): 🎯 1. Required Core Settings, 🔗 2. NextAuth & Proxy Integration, 🎨 3. Branding & General Settings, 📚 4. Swagger API Documentation (/docs), 🔌 5. WhatsApp Core (Baileys Engine), 🔧 6. Integrations & Feature Flags, 🛡️ 7. Security & Limits, 🌍 8. Localization & Storage (+2 more)

### Community 76 - "🏗️ WA-AKG Project Architecture & Logic"
Cohesion: 0.20
Nodes (9): 1. Connection Lifecycle, 2. Messaging & Webhooks, 3. Access Control & Automation, 🗄️ Database Models (Prisma), 📂 Directory Structure, 🚀 Environment & Deployment, ⚡ Key Logic Flows, 🏗️ System Architecture (+1 more)

### Community 77 - "\[POST\] /contacts/{sessionId}/{jid}/block"
Cohesion: 0.22
Nodes (9): 📂 Contacts, cURL Example, cURL Example, Parameters, Parameters, \[POST\] /contacts/{sessionId}/{jid}/block, \[POST\] /contacts/{sessionId}/{jid}/unblock, Responses (+1 more)

### Community 78 - "📂 Groups"
Cohesion: 0.22
Nodes (9): cURL Example, cURL Example, \[DELETE\] /groups/{sessionId}/{jid}/picture, \[GET\] /groups/{sessionId}/{jid}/invite, 📂 Groups, Parameters, Parameters, Responses (+1 more)

### Community 79 - "automations/engine.ts"
Cohesion: 0.13
Nodes (20): AutomationContext, evaluateCondition(), matchesWholeWord(), runAutomationsForTrigger(), RunAutomationsInput, triggerMatches(), AssignConversationStepConfig, AutomationLogStepResult (+12 more)

### Community 80 - "📂 Knowledge Base Index"
Cohesion: 0.50
Nodes (4): 📘 Essential Guides, 🚦 Getting Started (Programmatically), 🛠️ Infrastructure & Maintenance, 📂 Knowledge Base Index

### Community 81 - "builder-tree.ts"
Cohesion: 0.24
Nodes (9): atPath(), insertAt(), mapAtPath(), moveAt(), ParentScope, removeAt(), StepMarker, StepPath (+1 more)

### Community 82 - "autoreply.ts"
Cohesion: 0.38
Nodes (9): runAiAutoReply(), isCooldownActive(), markReplySent(), replyCooldownMap, simulateHumanTyping(), smartSendWithHumanBehavior(), executeChatbotRule(), bindAutoReply() (+1 more)

### Community 83 - "Contributing to WA-AKG"
Cohesion: 0.29
Nodes (6): Branch & Commit Convention, Code Style, Contributing to WA-AKG, Development Setup, Need Help?, Pull Request Process

### Community 84 - "Security Policy — WA-AKG"
Cohesion: 0.29
Nodes (6): Out of Scope, Reporting a Vulnerability, Response Timeline, Scope, Security Policy — WA-AKG, Supported Versions

### Community 85 - "KeywordChatbot"
Cohesion: 0.27
Nodes (6): KeywordChatbot(), handleDeleteRule(), handleSaveRule(), handleSaveSettings(), handleSend(), evaluateChatbotRule()

### Community 86 - "\[POST\] /messages/{sessionId}/{jid}/send"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/send, Request Body (`application/json`), Responses

### Community 87 - "\[POST\] /messages/{sessionId}/{jid}/media"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/media, Request Body (`multipart/form-data`), Responses

### Community 88 - "\[POST\] /groups/{sessionId}/create"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /groups/{sessionId}/create, Request Body (`application/json`), Responses

### Community 89 - "\[POST\] /messages/{sessionId}/broadcast"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/broadcast, Request Body (`application/json`), Responses

### Community 90 - "[POST] /messages/{sessionId}/{jid}/poll"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, [POST] /messages/{sessionId}/{jid}/poll, Request Body (`application/json`), Responses

### Community 91 - "\[POST\] /messages/{sessionId}/{jid}/location"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/location, Request Body (`application/json`), Responses

### Community 92 - "\[POST\] /messages/{sessionId}/{jid}/contact"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/contact, Request Body (`application/json`), Responses

### Community 93 - "\[POST\] /messages/{sessionId}/{jid}/{messageId}/react"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/{messageId}/react, Request Body (`application/json`), Responses

### Community 94 - "\[POST\] /messages/{sessionId}/{jid}/{messageId}/reply"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/{messageId}/reply, Request Body (`application/json`), Responses

### Community 95 - "\[POST\] /messages/{sessionId}/{jid}/reply"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/reply, Request Body (`application/json`), Responses

### Community 96 - "\[POST\] /messages/{sessionId}/{jid}/{messageId}/star"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/{messageId}/star, Request Body (`application/json`), Responses

### Community 97 - "\[PUT\] /groups/{sessionId}/{jid}/subject"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PUT\] /groups/{sessionId}/{jid}/subject, Request Body (`application/json`), Responses

### Community 98 - "\[POST\] /messages/{sessionId}/{jid}/list"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/list, Request Body (`application/json`), Responses

### Community 99 - "\[POST\] /messages/{sessionId}/{jid}/spam"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/spam, Request Body (`application/json`), Responses

### Community 100 - "\[POST\] /messages/{sessionId}/{jid}/sticker"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/{jid}/sticker, Request Body (`multipart/form-data`), Responses

### Community 101 - "\[POST\] /messages/{sessionId}/forward"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /messages/{sessionId}/forward, Request Body (`application/json`), Responses

### Community 102 - "\[PATCH\] /messages/{sessionId}/{jid}/{messageId}"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PATCH\] /messages/{sessionId}/{jid}/{messageId}, Request Body (`application/json`), Responses

### Community 103 - "\[PUT\] /groups/{jid}/subject"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PUT\] /groups/{jid}/subject, Request Body (`application/json`), Responses

### Community 104 - "layout.ts"
Cohesion: 0.22
Nodes (9): @dagrejs/dagre, FlowCanvas(), autoLayout(), DEFAULTS, LayoutEdge, LayoutNode, LayoutOptions, LayoutPosition (+1 more)

### Community 105 - "\[PUT\] /groups/{sessionId}/{jid}/members"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PUT\] /groups/{sessionId}/{jid}/members, Request Body (`application/json`), Responses

### Community 106 - "\[POST\] /groups/{jid}/leave"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /groups/{jid}/leave, Request Body (`application/json`), Responses

### Community 107 - "\[POST\] /groups/{sessionId}/invite/accept"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[POST\] /groups/{sessionId}/invite/accept, Request Body (`application/json`), Responses

### Community 108 - "\[PUT\] /groups/{sessionId}/{jid}/picture"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PUT\] /groups/{sessionId}/{jid}/picture, Request Body (`multipart/form-data`), Responses

### Community 109 - "\[PUT\] /groups/{sessionId}/{jid}/settings"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PUT\] /groups/{sessionId}/{jid}/settings, Request Body (`application/json`), Responses

### Community 110 - "\[PUT\] /groups/{sessionId}/{jid}/description"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PUT\] /groups/{sessionId}/{jid}/description, Request Body (`application/json`), Responses

### Community 111 - "\[PUT\] /groups/{sessionId}/{jid}/ephemeral"
Cohesion: 0.33
Nodes (6): cURL Example, Headers, Parameters, \[PUT\] /groups/{sessionId}/{jid}/ephemeral, Request Body (`application/json`), Responses

### Community 112 - "chat-list.tsx"
Cohesion: 0.07
Nodes (31): @radix-ui/react-slider, react-virtuoso, BotSettingsPage(), BroadcastLog, BroadcastPage(), BroadcastProgress, BroadcastRecipient, ContactListPage() (+23 more)

### Community 113 - "[v1.5.2] - 2026-03-20"
Cohesion: 0.40
Nodes (5): Added, Changed, Database, Fixed, [v1.5.2] - 2026-03-20

### Community 114 - "[v1.5.1-beta.2] - 2026-03-02"
Cohesion: 0.40
Nodes (5): Added, Fixed, Optimized, Technical, [v1.5.1-beta.2] - 2026-03-02

### Community 115 - "[v1.5.0] - 2026-02-26"
Cohesion: 0.40
Nodes (5): Added, Changed, Fixed, Security, [v1.5.0] - 2026-02-26

### Community 117 - "Nopan design system"
Cohesion: 0.25
Nodes (7): Colors, Components present, CSS variables exposed by the source, Nopan design system, Notes for the agent, Tone, Typography

### Community 118 - "webhook.ts"
Cohesion: 0.06
Nodes (47): socket.io, @whiskeysockets/baileys, batchResolveToPhoneJid(), isLidJid(), normalizeJid(), resolveToPhoneJid(), resolveToPhoneJidBySessionId(), c (+39 more)

### Community 119 - "[1.0.6] - 2026-01-13"
Cohesion: 0.50
Nodes (4): [1.0.6] - 2026-01-13, Added, Documentation, Fixed

### Community 120 - "[v1.6.4] - 2026-07-12"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.6.4] - 2026-07-12

### Community 121 - "[v1.6.3] - 2026-06-30"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.6.3] - 2026-06-30

### Community 122 - "[v1.5.5] - 2026-06-03"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.5.5] - 2026-06-03

### Community 123 - "[v1.5.3] - 2026-04-08"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.5.3] - 2026-04-08

### Community 124 - "[v1.5.3-beta.1] - 2026-03-22"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.5.3-beta.1] - 2026-03-22

### Community 125 - "[v1.6.2] - 2026-06-28"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.6.2] - 2026-06-28

### Community 126 - "[v1.5.2-beta.2] - 2026-03-20"
Cohesion: 0.50
Nodes (4): Added, Changed, Database, [v1.5.2-beta.2] - 2026-03-20

### Community 127 - "[v1.5.2-beta.1] - 2026-03-15"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.5.2-beta.1] - 2026-03-15

### Community 128 - "[v1.5.1] - 2026-03-03"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.5.1] - 2026-03-03

### Community 129 - "[v1.5.1-beta.1] - 2026-03-02"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.5.1-beta.1] - 2026-03-02

### Community 130 - "[v1.4.0] - 2026-02-21"
Cohesion: 0.50
Nodes (4): Added, Changed, Fixed, [v1.4.0] - 2026-02-21

### Community 131 - "\[GET\] /groups/{sessionId}"
Cohesion: 0.50
Nodes (4): cURL Example, \[GET\] /groups/{sessionId}, Parameters, Responses

### Community 132 - "\[GET\] /messages/{sessionId}/download/{messageId}/media"
Cohesion: 0.50
Nodes (4): cURL Example, \[GET\] /messages/{sessionId}/download/{messageId}/media, Parameters, Responses

### Community 133 - "\[GET\] /messages/{sessionId}/search"
Cohesion: 0.50
Nodes (4): cURL Example, \[GET\] /messages/{sessionId}/search, Parameters, Responses

### Community 134 - "\[PUT\] /groups/{sessionId}/{jid}/invite"
Cohesion: 0.50
Nodes (4): cURL Example, Parameters, \[PUT\] /groups/{sessionId}/{jid}/invite, Responses

### Community 135 - "\[GET\] /groups/{sessionId}/{jid}"
Cohesion: 0.50
Nodes (4): cURL Example, \[GET\] /groups/{sessionId}/{jid}, Parameters, Responses

### Community 136 - "\[POST\] /groups/{sessionId}/{jid}/leave"
Cohesion: 0.50
Nodes (4): cURL Example, Parameters, \[POST\] /groups/{sessionId}/{jid}/leave, Responses

### Community 137 - "[1.1.0] - 2026-01-13"
Cohesion: 0.67
Nodes (3): [1.1.0] - 2026-01-13, Added, Fixed

### Community 138 - "[v1.5.4] - 2026-05-21"
Cohesion: 0.67
Nodes (3): Added, Fixed, [v1.5.4] - 2026-05-21

### Community 139 - "[v1.5.3-beta.2] - 2026-04-03"
Cohesion: 0.67
Nodes (3): Added, Fixed, [v1.5.3-beta.2] - 2026-04-03

### Community 140 - "[v1.3.0] - 2026-02-01"
Cohesion: 0.67
Nodes (3): Added, Fixed, [v1.3.0] - 2026-02-01

### Community 141 - "[v1.2.0] - 2026-01-18"
Cohesion: 0.67
Nodes (3): Added, Fixed, [v1.2.0] - 2026-01-18

### Community 142 - "[beta-v1.1.0.1] - 2026-01-15"
Cohesion: 0.67
Nodes (3): Added, [beta-v1.1.0.1] - 2026-01-15, Fixed

### Community 143 - "[v1.6.1] - 2026-06-27"
Cohesion: 0.67
Nodes (3): Changed, Fixed, [v1.6.1] - 2026-06-27

### Community 144 - "automations/templates.ts"
Cohesion: 0.19
Nodes (12): NewAutomationContent(), AutomationBuilderProps, StepItem, AUTOMATION_TEMPLATES, AutomationTemplateDefinition, getTemplate(), TemplateSlug, TemplateStepSeed (+4 more)

### Community 145 - "api/media/route.ts"
Cohesion: 0.53
Nodes (4): DELETE(), GET(), MEDIA_DIR, parseFilename()

### Community 150 - "auth.ts"
Cohesion: 0.07
Nodes (20): config, next-auth, POST(), ChatWithJidPage(), ChatPage(), authConfig, ChatInterface(), ChatInterfaceProps (+12 more)

### Community 153 - "rule-engine.ts"
Cohesion: 0.24
Nodes (7): POST(), RULES_FILE_PATH, ChatbotConfig, ChatbotRule, DEFAULT_CHATBOT_CONFIG, DEFAULT_CHATBOT_RULES, RuleEvaluationResult

### Community 154 - "app/page.tsx"
Cohesion: 0.18
Nodes (8): metadata, CodePlayground(), SNIPPETS, TabKey, IsometricHeroPreview(), LANE_1, LANE_2, MarqueeTicker()

### Community 161 - "icon.tsx"
Cohesion: 0.40
Nodes (3): contentType, runtime, size

## Knowledge Gaps
- **1037 isolated node(s):** `NavGroup`, `LayoutEdge`, `LayoutNode`, `LayoutOptions`, `LayoutPosition` (+1032 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1144 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WhatsApp AI Gateway — Complete API Reference` connect `WhatsApp AI Gateway — Complete API Reference` to `📂 Chat`, `📂 Labels`, `📂 Sessions`, `📂 Webhooks`, `📂 Scheduler`, `📂 Users`, `📂 Profile`, `\[POST\] /status/{sessionId}/update`, `\[GET\] /chats/by-label/{labelId}`, `📂 Notifications`, `Payload Examples`, `\[POST\] /autoreplies/{sessionId}`, `\[POST\] /auth/register`, `docs/README.md`, `📦 Schemas`, `\[DELETE\] /sessions/{sessionId}/access`, `📂 Messaging`, `Verify Examples`, `\[POST\] /contacts/{sessionId}/{jid}/block`, `📂 Groups`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `scheduler/page.tsx`, `cn`, `package.json`, `sheet.tsx`, `dashboard/layout.tsx`, `dashboard/page.tsx`, `form.tsx`, `chat-list.tsx`, `privacy/page.tsx`, `terms/page.tsx`, `docs-client.tsx`, `auth.ts`, `navbar.tsx`, `button.tsx`, `app/page.tsx`, `react`, `agents/page.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `prisma` connect `prisma.ts` to `canAccessSession`, `chat/actions.ts`, `fireSentWebhook`, `dashboard/layout.tsx`, `auto-reply.ts`, `dashboard/page.tsx`, `api-auth.ts`, `automations/engine.ts`, `api/media/route.ts`, `flows/engine.ts`, `autoreply.ts`, `auth.ts`, `navbar.tsx`, `isAdmin`, `webhook.ts`, `getAuthenticatedUser`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `NavGroup`, `LayoutEdge`, `LayoutNode` to the rest of the system?**
  _1037 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `canAccessSession` be split into smaller, more focused modules?**
  _Cohesion score 0.07030527289546716 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.037037037037037035 - nodes in this community are weakly interconnected._
- **Should `scheduler/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07960199004975124 - nodes in this community are weakly interconnected._