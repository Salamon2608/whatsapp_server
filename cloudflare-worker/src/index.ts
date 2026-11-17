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
      ? "⏸️ Server is on cooldown"
      : state === "starting"
      ? "🔄 Server is starting up..."
      : "🔧 Server is temporarily offline";

  const stateColor =
    state === "starting" ? "#22c55e" : "#f59e0b";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Server Maintenance – InstaBox WhatsApp</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      background: #0a0a0a;
    }

    /* ── Video Background ── */
    #bg-video {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      min-width: 100vw;
      min-height: 100vh;
      width: auto;
      height: auto;
      object-fit: cover;
      z-index: 0;
      opacity: 0.45;
      filter: blur(1px) brightness(0.6);
    }

    /* ── Dark gradient overlay ── */
    #overlay {
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center,
        rgba(0,0,0,0.3) 0%,
        rgba(0,0,0,0.75) 70%,
        rgba(0,0,0,0.92) 100%);
      z-index: 1;
    }

    /* ── Content ── */
    #content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100vw;
      text-align: center;
      padding: 2rem;
      gap: 1.5rem;
    }

    /* ── Logo / Icon ── */
    .icon-wrap {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      animation: pulse 2.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
      50% { box-shadow: 0 0 0 20px rgba(245,158,11,0); }
    }

    /* ── State badge ── */
    .state-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1.2rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      border: 1px solid ${stateColor}55;
      color: ${stateColor};
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
    }

    /* ── Heading ── */
    h1 {
      color: #fff;
      font-size: clamp(1.6rem, 5vw, 2.8rem);
      font-weight: 800;
      line-height: 1.2;
      text-shadow: 0 2px 20px rgba(0,0,0,0.8);
      max-width: 600px;
    }

    h1 span {
      background: linear-gradient(135deg, #25d366, #128c7e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── Subtext ── */
    .subtitle {
      color: rgba(255,255,255,0.65);
      font-size: 1rem;
      max-width: 420px;
      line-height: 1.6;
    }

    /* ── Countdown Card ── */
    .countdown-card {
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 20px;
      padding: 1.5rem 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      min-width: 240px;
    }

    .countdown-label {
      color: rgba(255,255,255,0.5);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 600;
    }

    .countdown-time {
      font-size: clamp(2.5rem, 8vw, 4rem);
      font-weight: 900;
      font-variant-numeric: tabular-nums;
      letter-spacing: -2px;
      color: #fff;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 30px rgba(37,211,102,0.5);
      transition: color 0.3s;
    }

    .countdown-time.almost-done {
      color: #22c55e;
      text-shadow: 0 0 40px rgba(34,197,94,0.8);
    }

    .countdown-sub {
      color: rgba(255,255,255,0.4);
      font-size: 0.75rem;
    }

    /* ── Progress bar ── */
    .progress-wrap {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 999px;
      overflow: hidden;
      margin-top: 0.5rem;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #25d366, #128c7e);
      border-radius: 999px;
      transition: width 1s linear;
    }

    /* ── Refresh hint ── */
    .refresh-hint {
      color: rgba(255,255,255,0.3);
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }

    /* ── Footer ── */
    footer {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255,255,255,0.2);
      font-size: 0.7rem;
      z-index: 2;
      white-space: nowrap;
    }

    /* ── Hidden state if starting ── */
    .hidden { display: none; }

    /* ── Spinner for starting state ── */
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #22c55e;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>

  <!-- Background video -->
  <video id="bg-video" autoplay loop muted playsinline>
    <source src="${VIDEO_URL}" type="video/mp4" />
  </video>

  <!-- Dark overlay -->
  <div id="overlay"></div>

  <!-- Main content -->
  <div id="content">
    <div class="icon-wrap">🤖</div>

    <div class="state-badge">${stateLabel}</div>

    <h1>WhatsApp Server<br/><span>Coming Back Soon</span></h1>

    <p class="subtitle">
      The server is currently in cooldown mode.<br/>
      It will automatically restart — no action needed.
    </p>

    <!-- Countdown -->
    <div class="countdown-card" id="countdown-wrap">
      <div class="countdown-label">⏱ Resumes in</div>
      <div class="countdown-time" id="timer">--:--</div>
      <div class="countdown-sub" id="timer-sub">Calculating...</div>
      <div class="progress-wrap">
        <div class="progress-bar" id="progress-bar" style="width: 0%"></div>
      </div>
    </div>

    <div class="refresh-hint" id="refresh-hint"></div>
  </div>

  <footer>InstaBox WhatsApp Server &nbsp;•&nbsp; Auto-resumes after cooldown</footer>

  <script>
    const TOTAL_SECONDS = ${secondsLeft > 0 ? secondsLeft : 0};
    const STATE = "${state}";

    let remaining = TOTAL_SECONDS;
    const startRemaining = TOTAL_SECONDS;

    function fmt(s) {
      if (s <= 0) return '00:00';
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    }

    function tick() {
      const timerEl = document.getElementById('timer');
      const subEl = document.getElementById('timer-sub');
      const barEl = document.getElementById('progress-bar');
      const hintEl = document.getElementById('refresh-hint');

      if (remaining <= 0) {
        timerEl.textContent = '00:00';
        timerEl.classList.add('almost-done');
        subEl.textContent = 'Server should be online now!';
        barEl.style.width = '100%';
        hintEl.textContent = 'Refreshing in 5 seconds…';
        setTimeout(() => location.reload(), 5000);
        return;
      }

      timerEl.textContent = fmt(remaining);

      if (remaining <= 30) {
        timerEl.classList.add('almost-done');
        hintEl.textContent = 'Almost ready — will auto-refresh!';
      } else {
        const minLeft = Math.ceil(remaining / 60);
        subEl.textContent = 'About ' + minLeft + ' minute' + (minLeft !== 1 ? 's' : '') + ' remaining';
        hintEl.textContent = 'Page will auto-refresh when server is back online';
      }

      // Progress: grows from 0 → 100 as countdown goes from TOTAL → 0
      if (startRemaining > 0) {
        const pct = ((startRemaining - remaining) / startRemaining) * 100;
        barEl.style.width = pct.toFixed(1) + '%';
      }

      remaining--;
      setTimeout(tick, 1000);
    }

    // Handle "starting" state differently
    if (STATE === 'starting') {
      document.getElementById('countdown-wrap').style.display = 'none';
      const content = document.getElementById('content');
      const spinner = document.createElement('div');
      spinner.className = 'spinner';
      content.appendChild(spinner);
      // Refresh every 10 seconds
      setInterval(() => location.reload(), 10000);
      document.getElementById('refresh-hint').textContent = 'Server is starting — checking every 10 seconds…';
    } else {
      tick();
    }
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
