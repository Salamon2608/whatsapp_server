// ============================================================
// WhatsApp Server – Cloudflare Worker Sentinel
// Handles: cron keep-alive, InstaBox webhook, maintenance page
// ============================================================

export interface Env {
  INSTABOX_API_KEY: string;
  INSTABOX_MACHINE_ID: string;
  SERVER_URL: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  WEBHOOK_SECRET: string;
}

// ─── InstaBox API ────────────────────────────────────────────

interface InstaboxMachine {
  id: string;
  state: "running" | "suspended" | "stopped" | "starting" | "stopping";
  runStartedAt: string | null;
  maxRunMinutes: number;
  autoSuspendAfterSeconds: number;
  retryAfterSeconds?: number;
}

function cleanSecret(val?: string): string {
  return (val || "").replace(/^\uFEFF/, "").trim().replace(/^["']|["']$/g, "");
}

async function getMachineState(env: Env): Promise<InstaboxMachine | null> {
  try {
    const rawKey = cleanSecret(env.INSTABOX_API_KEY);
    const res = await fetch("https://api.instabox.sh/v1/machines", {
      headers: {
        Authorization: `Bearer ${rawKey}`,
        "User-Agent": "Cloudflare-Worker",
      },
    });
    if (!res.ok) return null;
    const data: { machines: InstaboxMachine[] } = await res.json();
    return data.machines.find((m) => m.id === env.INSTABOX_MACHINE_ID) ?? null;
  } catch {
    return null;
  }
}

async function wakeServer(env: Env): Promise<boolean> {
  try {
    const rawKey = cleanSecret(env.INSTABOX_API_KEY);
    const res = await fetch(
      `https://api.instabox.sh/v1/machines/${env.INSTABOX_MACHINE_ID}/start`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${rawKey}`,
          "User-Agent": "Cloudflare-Worker",
        },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Telegram ────────────────────────────────────────────────

async function sendTelegram(env: Env, text: string): Promise<void> {
  const token = cleanSecret(env.TELEGRAM_BOT_TOKEN);
  const chatId = cleanSecret(env.TELEGRAM_CHAT_ID);
  await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    }
  );
}

// ─── InstaBox Webhook Verification ───────────────────────────

async function verifyWebhookSignature(
  request: Request,
  body: string,
  secret: string
): Promise<boolean> {
  const sigHeader = request.headers.get("svix-signature") ?? "";
  const tsHeader = request.headers.get("svix-timestamp") ?? "";
  const msgId = request.headers.get("svix-id") ?? "";

  const toSign = `${msgId}.${tsHeader}.${body}`;
  const clean = cleanSecret(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(clean.replace(/^whsec_/, "")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(toSign)
  );
  const computed = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
  return sigHeader.split(" ").some((s) => s.startsWith(`v1,${computed}`));
}

// ─── Maintenance Page HTML (Unslopped) ─────────────────────────

function maintenancePage(secondsLeft: number, state: string): string {
  const VIDEO_URL =
    "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/cloudinarry%20to%20cloudflare/202606021731-e_hqa6sn.mp4";

  const stateLabel =
    state === "suspended"
      ? "Cooldown"
      : state === "starting"
      ? "Starting"
      : "Paused";

  const totalCycle = 120 * 60; // 2 hour cycle

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WhatsApp Gateway — Service Rest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --surface-deep: #090b0e;
      --surface-card: rgba(18, 22, 28, 0.74);
      --surface-tile: rgba(255, 255, 255, 0.03);
      --border-hairline: rgba(255, 255, 255, 0.08);
      --border-tile: rgba(255, 255, 255, 0.06);
      --text-primary: #ededed;
      --text-secondary: #a1a1a6;
      --text-muted: #737373;
      --accent-signal: #4cc38a;
      --status-amber: #e5a038;
      --radius-card: 16px;
      --radius-tile: 8px;
      --radius-ctrl: 6px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      height: 100%;
      width: 100%;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--surface-deep);
      color: var(--text-primary);
      -webkit-font-smoothing: antialiased;
    }

    .video-backdrop {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      z-index: 0;
    }

    #bg-video {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 100%;
      min-height: 100%;
      width: auto;
      height: auto;
      object-fit: cover;
      opacity: 0.92;
      filter: contrast(1.04) saturate(1.08);
    }

    .film-mask {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(9, 11, 14, 0.25) 0%, rgba(9, 11, 14, 0.6) 80%, rgba(9, 11, 14, 0.88) 100%);
      pointer-events: none;
    }

    .app-shell {
      position: relative;
      z-index: 2;
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 32px 24px;
    }

    header {
      width: 100%;
      max-width: 580px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-mark {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-icon {
      width: 18px;
      height: 18px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-name {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: var(--text-primary);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px;
      border-radius: var(--radius-ctrl);
      background: rgba(229, 160, 56, 0.08);
      border: 1px solid rgba(229, 160, 56, 0.2);
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--status-amber);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--status-amber);
    }

    main {
      width: 100%;
      max-width: 580px;
    }

    .hud-card {
      width: 100%;
      background: var(--surface-card);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border-hairline);
      border-radius: var(--radius-card);
      padding: 32px 28px;
      box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.6);
    }

    .hud-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .hud-title {
      font-size: 24px;
      font-weight: 600;
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .hud-desc {
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }

    .timer-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .timer-tile {
      background: var(--surface-tile);
      border: 1px solid var(--border-tile);
      border-radius: var(--radius-tile);
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .timer-digit {
      font-family: 'JetBrains Mono', monospace;
      font-size: 36px;
      font-weight: 500;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .timer-label {
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 0.02em;
    }

    .progress-group {
      width: 100%;
      margin-bottom: 20px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .progress-header span:last-child {
      color: var(--accent-signal);
      font-weight: 500;
    }

    .progress-track {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      width: 0%;
      background: var(--accent-signal);
      border-radius: 2px;
      transition: width 0.6s ease-out;
    }

    .telemetry-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--border-hairline);
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
    }

    .telemetry-item span {
      color: var(--text-secondary);
    }

    footer {
      width: 100%;
      max-width: 580px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
      padding: 0 4px;
    }

    footer a {
      color: var(--text-muted);
      text-decoration: none;
      cursor: pointer;
    }

    footer a:hover {
      color: var(--text-secondary);
    }

    @media (max-width: 640px) {
      .app-shell { padding: 20px 16px; }
      .hud-card { padding: 24px 20px; }
      .timer-digit { font-size: 28px; }
      .hud-title { font-size: 20px; }
      .telemetry-row { flex-direction: column; gap: 8px; align-items: flex-start; }
    }
  </style>
</head>
<body>

  <div class="video-backdrop">
    <video id="bg-video" autoplay loop muted playsinline preload="auto">
      <source src="${VIDEO_URL}" type="video/mp4" />
    </video>
    <div class="film-mask"></div>
  </div>

  <div class="app-shell">
    <header>
      <div class="brand-mark">
        <div class="brand-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <span class="brand-name">WhatsApp Gateway</span>
      </div>

      <div class="status-indicator">
        <span class="status-dot"></span>
        <span id="status-label">${stateLabel}</span>
      </div>
    </header>

    <main>
      <div class="hud-card">
        <div class="hud-meta">m_agqz7rh6ki3vl7acl4otox5yfy • 120m cycle</div>
        <h1 class="hud-title">Scheduled rest in progress</h1>
        <p class="hud-desc">
          The node is cooling down following its maximum continuous runtime window. Inbound webhooks and connection states will resume automatically.
        </p>

        <div class="timer-grid">
          <div class="timer-tile">
            <span class="timer-digit" id="hours">00</span>
            <span class="timer-label">Hours</span>
          </div>
          <div class="timer-tile">
            <span class="timer-digit" id="minutes">--</span>
            <span class="timer-label">Minutes</span>
          </div>
          <div class="timer-tile">
            <span class="timer-digit" id="seconds">--</span>
            <span class="timer-label">Seconds</span>
          </div>
        </div>

        <div class="progress-group">
          <div class="progress-header">
            <span>Cycle completion</span>
            <span id="pct-label">0%</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" id="bar-fill" style="width: 0%;"></div>
          </div>
        </div>

        <div class="telemetry-row">
          <div class="telemetry-item">Platform: <span>InstaBox Serverless</span></div>
          <div class="telemetry-item">Auto-resume: <span>Active</span></div>
          <div class="telemetry-item">Status: <span>HTTP 503</span></div>
        </div>
      </div>
    </main>

    <footer>
      <span>Cloudflare Sentinel Edge</span>
      <a onclick="location.reload()">Check now</a>
    </footer>
  </div>

  <script>
    const v = document.getElementById('bg-video');
    if (v) {
      v.muted = true;
      v.play().catch(() => {
        window.addEventListener('click', () => v.play(), { once: true });
      });
    }

    let remaining = ${secondsLeft > 0 ? secondsLeft : 0};
    const totalCycle = ${totalCycle};

    function render() {
      if (remaining <= 0) {
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        document.getElementById('pct-label').textContent = '100%';
        document.getElementById('bar-fill').style.width = '100%';
        document.getElementById('status-label').textContent = 'Resuming';
        setTimeout(() => location.reload(), 2000);
        return;
      }

      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;

      document.getElementById('hours').textContent = String(h).padStart(2, '0');
      document.getElementById('minutes').textContent = String(m).padStart(2, '0');
      document.getElementById('seconds').textContent = String(s).padStart(2, '0');

      const elapsed = Math.max(0, totalCycle - remaining);
      const pct = Math.min(100, Math.round((elapsed / totalCycle) * 100));
      document.getElementById('pct-label').textContent = pct + '%';
      document.getElementById('bar-fill').style.width = pct + '%';

      remaining--;
      setTimeout(render, 1000);
    }

    render();
  </script>
</body>
</html>`;
}

// ─── Cron Handler ────────────────────────────────────────────

async function handleCron(env: Env): Promise<void> {
  const machine = await getMachineState(env);
  if (!machine) return;

  if (machine.state === "running") {
    // Keep-alive ping
    try {
      await fetch(env.SERVER_URL, { signal: AbortSignal.timeout(8000) });
    } catch {
      // Server not responding — try to wake it
    }

    // Check if approaching max runtime (warn at 5 min remaining)
    if (machine.runStartedAt) {
      const startMs = new Date(machine.runStartedAt).getTime();
      const elapsedMin = (Date.now() - startMs) / 60000;
      const remaining = machine.maxRunMinutes - elapsedMin;

      if (remaining > 0 && remaining <= 5) {
        await sendTelegram(
          env,
          `⚠️ <b>WhatsApp Server</b> freezes in <b>${Math.ceil(remaining)} min</b>!\n\nMax runtime (${machine.maxRunMinutes}m) almost reached.\nServer will be offline ~2h after freeze.`
        );
      }
    }
  } else if (machine.state === "suspended" || machine.state === "stopped") {
    // Try to wake it up
    await wakeServer(env);
  }
}

// ─── Webhook Handler ─────────────────────────────────────────

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const body = await request.text();

  // Verify signature
  const valid = await verifyWebhookSignature(
    request,
    body,
    env.WEBHOOK_SECRET
  ).catch(() => false);

  if (!valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: { type: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const emojiMap: Record<string, string> = {
    "sandbox.started": "🟢",
    "sandbox.stopped": "🔴",
    "sandbox.suspended": "⏸️",
    "sandbox.error": "❌",
    "sandbox.created": "🆕",
    "sandbox.deleted": "🗑️",
    "snapshot.created": "📸",
    "snapshot.failed": "⚠️",
    "snapshot.deleted": "🗑️",
  };

  const emoji = emojiMap[event.type] ?? "ℹ️";
  const label = event.type.replace(".", " ").toUpperCase();

  await sendTelegram(
    env,
    `${emoji} <b>InstaBox Event</b>: ${label}\n\n<code>${JSON.stringify(event.data ?? {}, null, 2)}</code>`
  );

  return new Response("OK", { status: 200 });
}

// ─── Fetch Handler (Main Entry) ──────────────────────────────

export default {
  // ── HTTP requests ──
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // POST /webhook — InstaBox events
    if (request.method === "POST" && url.pathname === "/webhook") {
      return handleWebhook(request, env);
    }

    // GET /status — raw JSON status (for debugging)
    if (url.pathname === "/status") {
      try {
        const rawKey = (env.INSTABOX_API_KEY || "").trim().replace(/^["']|["']$/g, "");
        const res = await fetch("https://api.instabox.sh/v1/machines", {
          headers: {
            Authorization: `Bearer ${rawKey}`,
            "User-Agent": "Cloudflare-Worker",
          },
        });
        const text = await res.text();
        return new Response(
          JSON.stringify(
            {
              api_status: res.status,
              machine_id_sought: env.INSTABOX_MACHINE_ID,
              key_len: env.INSTABOX_API_KEY?.length,
              key_preview: env.INSTABOX_API_KEY ? `${env.INSTABOX_API_KEY.slice(0, 7)}...${env.INSTABOX_API_KEY.slice(-4)}` : null,
              key_char_codes: env.INSTABOX_API_KEY ? Array.from(env.INSTABOX_API_KEY.slice(0, 10)).map(c => c.charCodeAt(0)) : [],
              api_response: JSON.parse(text),
            },
            null,
            2
          ),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify(
            {
              error: err?.message || String(err),
              has_api_key: Boolean(env.INSTABOX_API_KEY),
            },
            null,
            2
          ),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // GET /wake — manually trigger wake (for debugging)
    if (url.pathname === "/wake") {
      const ok = await wakeServer(env);
      return new Response(JSON.stringify({ woken: ok }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── All other requests: check server state ──
    const machine = await getMachineState(env);

    if (!machine) {
      // API error — show maintenance page with unknown ETA
      return new Response(maintenancePage(300, "suspended"), {
        status: 503,
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    if (machine.state === "running") {
      // Server is live — redirect to actual server
      const targetUrl = env.SERVER_URL + url.pathname + url.search;
      return Response.redirect(targetUrl, 302);
    }

    if (machine.state === "starting") {
      return new Response(maintenancePage(60, "starting"), {
        status: 503,
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Retry-After": "30",
        },
      });
    }

    // Suspended / stopped — calculate seconds until cooldown ends
    let secondsLeft = 0;

    if (machine.runStartedAt) {
      const startMs = new Date(machine.runStartedAt).getTime();
      const ranForMs = Date.now() - startMs;
      const maxMs = machine.maxRunMinutes * 60 * 1000;
      // Cooldown ≈ same duration as max runtime (InstaBox rule)
      const cooldownMs = maxMs;
      const cooldownEndMs = startMs + maxMs + cooldownMs;
      secondsLeft = Math.max(0, Math.ceil((cooldownEndMs - Date.now()) / 1000));
    } else {
      // Fallback: assume 2h cooldown
      secondsLeft = 2 * 60 * 60;
    }

    // Also try to wake it
    wakeServer(env); // fire-and-forget

    return new Response(maintenancePage(secondsLeft, machine.state), {
      status: 503,
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Retry-After": String(Math.min(secondsLeft, 120)),
      },
    });
  },

  // ── Cron trigger ──
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    await handleCron(env);
  },
};
