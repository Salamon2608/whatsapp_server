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

async function getMachineState(env: Env): Promise<InstaboxMachine | null> {
  try {
    const res = await fetch("https://api.instabox.sh/v1/machines", {
      headers: { Authorization: `Bearer ${env.INSTABOX_API_KEY}` },
      cf: { cacheTtl: 0 },
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
    const res = await fetch(
      `https://api.instabox.sh/v1/machines/${env.INSTABOX_MACHINE_ID}/start`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${env.INSTABOX_API_KEY}` },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Telegram ────────────────────────────────────────────────

async function sendTelegram(env: Env, text: string): Promise<void> {
  await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
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
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret.replace(/^whsec_/, "")),
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

// ─── Maintenance Page HTML ────────────────────────────────────

function maintenancePage(secondsLeft: number, state: string): string {
  const VIDEO_URL =
    "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/cloudinarry%20to%20cloudflare/202606021731-e_hqa6sn.mp4";

  const stateLabel =
    state === "suspended"
      ? "Cooldown Active"
      : state === "starting"
      ? "Node Initializing"
      : "Service Paused";

  const cycleTotal = 120 * 60; // 2 hour max cycle

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WhatsApp Server — Service Rest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent: #25d366;
      --accent-glow: rgba(37, 211, 102, 0.35);
      --amber: #fbbf24;
      --glass-bg: rgba(13, 17, 23, 0.42);
      --glass-border: rgba(255, 255, 255, 0.18);
      --glass-border-light: rgba(255, 255, 255, 0.08);
      --text: #ffffff;
      --text-sub: rgba(255, 255, 255, 0.75);
      --text-dim: rgba(255, 255, 255, 0.5);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      height: 100%;
      width: 100%;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #000;
      color: var(--text);
      -webkit-font-smoothing: antialiased;
    }

    /* ── Fullscreen Video (Vibrant & Fully Visible) ── */
    .video-viewport {
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
      opacity: 0.95;
      filter: contrast(1.05) saturate(1.1);
    }

    .cinema-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.5) 85%, rgba(0, 0, 0, 0.8) 100%);
      pointer-events: none;
    }

    .app-canvas {
      position: relative;
      z-index: 2;
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 2.25rem 2rem;
    }

    header {
      width: 100%;
      max-width: 900px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.55rem 1.1rem;
      border-radius: 999px;
      background: rgba(10, 15, 22, 0.55);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
    }

    .brand-icon {
      width: 22px;
      height: 22px;
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-title {
      font-size: 0.88rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #fff;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.55rem 1.1rem;
      border-radius: 999px;
      background: rgba(10, 15, 22, 0.55);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--amber);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .pulsing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--amber);
      box-shadow: 0 0 10px var(--amber);
      animation: pulse 1.8s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.45; transform: scale(0.85); }
    }

    main {
      width: 100%;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .glass-card {
      width: 100%;
      background: var(--glass-bg);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      padding: 2.5rem 2.25rem;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
      position: relative;
      overflow: hidden;
    }

    .glass-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 50% 0%, rgba(37, 211, 102, 0.12) 0%, transparent 60%);
      pointer-events: none;
    }

    .badge-sub {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.85rem;
      text-shadow: 0 0 12px var(--accent-glow);
    }

    .headline {
      font-size: clamp(1.75rem, 4vw, 2.35rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: 0.75rem;
      text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6);
    }

    .desc {
      font-size: 0.92rem;
      line-height: 1.55;
      color: var(--text-sub);
      margin-bottom: 2rem;
      text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
    }

    .countdown-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
      margin-bottom: 1.75rem;
    }

    .digit-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--glass-border-light);
      border-radius: 14px;
      padding: 1.15rem 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      backdrop-filter: blur(8px);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .digit-box:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .digit-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: clamp(2rem, 5vw, 2.85rem);
      font-weight: 700;
      line-height: 1;
      color: #ffffff;
      font-variant-numeric: tabular-nums;
      margin-bottom: 0.35rem;
      text-shadow: 0 0 24px rgba(255, 255, 255, 0.35);
    }

    .digit-tag {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-dim);
    }

    .progress-wrapper {
      width: 100%;
      text-align: left;
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.76rem;
      color: var(--text-sub);
      margin-bottom: 0.55rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .progress-labels span:last-child {
      color: var(--accent);
      font-weight: 700;
    }

    .progress-bar-track {
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #10b981, #25d366);
      border-radius: 999px;
      box-shadow: 0 0 12px var(--accent-glow);
      transition: width 0.8s ease;
    }

    .meta-pills {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      color: var(--text-dim);
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .meta-item span {
      color: #fff;
      font-weight: 500;
    }

    footer {
      width: 100%;
      max-width: 900px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.74rem;
      color: var(--text-dim);
      padding: 0.75rem 1.25rem;
      border-radius: 999px;
      background: rgba(10, 15, 22, 0.45);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border-light);
    }

    .footer-edge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-sub);
    }

    .footer-auto {
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-dim);
    }

    @media (max-width: 600px) {
      .app-canvas { padding: 1.25rem 1rem; }
      .glass-card { padding: 1.75rem 1.25rem; }
      .headline { font-size: 1.5rem; }
      footer { flex-direction: column; gap: 0.35rem; border-radius: 16px; text-align: center; }
    }
  </style>
</head>
<body>

  <div class="video-viewport">
    <video id="bg-video" autoplay loop muted playsinline preload="auto">
      <source src="${VIDEO_URL}" type="video/mp4" />
    </video>
    <div class="cinema-overlay"></div>
  </div>

  <div class="app-canvas">
    <header>
      <div class="brand-pill">
        <div class="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <span class="brand-title">WhatsApp Server Gateway</span>
      </div>

      <div class="status-pill">
        <span class="pulsing-dot"></span>
        <span id="badge-status">${stateLabel}</span>
      </div>
    </header>

    <main>
      <div class="glass-card">
        <div class="badge-sub">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Automated Resource Rest
        </div>

        <h1 class="headline">Rest Cycle in Progress</h1>
        <p class="desc">
          The node is in its scheduled cooldown. The gateway will automatically reconnect the moment runtime resumes.
        </p>

        <div class="countdown-grid">
          <div class="digit-box">
            <span class="digit-val" id="hours">00</span>
            <span class="digit-tag">Hours</span>
          </div>
          <div class="digit-box">
            <span class="digit-val" id="minutes">--</span>
            <span class="digit-tag">Minutes</span>
          </div>
          <div class="digit-box">
            <span class="digit-val" id="seconds">--</span>
            <span class="digit-tag">Seconds</span>
          </div>
        </div>

        <div class="progress-wrapper">
          <div class="progress-labels">
            <span>Cycle Progress</span>
            <span id="progress-percent">0%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="progress-fill" style="width: 0%;"></div>
          </div>
        </div>

        <div class="meta-pills">
          <div class="meta-item">
            Cluster: <span>InstaBox Edge</span>
          </div>
          <div class="meta-item">•</div>
          <div class="meta-item">
            Recovery: <span>Automatic</span>
          </div>
        </div>
      </div>
    </main>

    <footer>
      <div class="footer-edge">
        <span>Cloudflare Sentinel Edge</span>
        <span>•</span>
        <span>HTTP 503 Maintenance</span>
      </div>
      <div class="footer-auto">
        Auto-refreshes when operational
      </div>
    </footer>
  </div>

  <script>
    const videoEl = document.getElementById('bg-video');
    if (videoEl) {
      videoEl.muted = true;
      videoEl.play().catch(() => {
        window.addEventListener('click', () => videoEl.play(), { once: true });
      });
    }

    let remaining = ${secondsLeft > 0 ? secondsLeft : 0};
    const cycleTotal = ${cycleTotal};

    function update() {
      if (remaining <= 0) {
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        document.getElementById('progress-percent').textContent = '100%';
        document.getElementById('progress-fill').style.width = '100%';
        document.getElementById('badge-status').textContent = 'Starting Server';
        setTimeout(() => location.reload(), 2500);
        return;
      }

      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;

      document.getElementById('hours').textContent = String(h).padStart(2, '0');
      document.getElementById('minutes').textContent = String(m).padStart(2, '0');
      document.getElementById('seconds').textContent = String(s).padStart(2, '0');

      const elapsed = Math.max(0, cycleTotal - remaining);
      const pct = Math.min(100, Math.round((elapsed / cycleTotal) * 100));
      document.getElementById('progress-percent').textContent = pct + '%';
      document.getElementById('progress-fill').style.width = pct + '%';

      remaining--;
      setTimeout(update, 1000);
    }

    update();
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
      const machine = await getMachineState(env);
      return new Response(JSON.stringify(machine, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
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
