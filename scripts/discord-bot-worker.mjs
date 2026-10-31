#!/usr/bin/env node

// VORTEX GAMING — Persistent Discord Gateway Support Bot Worker
// Connects to Discord Gateway v10, listens for support staff replies in ticket threads,
// and synchronizes responses into PostgreSQL and website Live Support chat in real-time.

import fs from 'fs';
import path from 'path';
import https from 'https';

// Load environment variables from .env.local or .env if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          val = val.replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const BOT_TOKEN = (process.env.DISCORD_BOT_TOKEN || '').trim().replace(/^["']|["']$/g, '');
const GUILD_ID = (process.env.DISCORD_GUILD_ID || '').trim().replace(/^["']|["']$/g, '');
const SUPPORT_CHANNEL_ID = (process.env.DISCORD_SUPPORT_CHANNEL_ID || '').trim().replace(/^["']|["']$/g, '');

if (!BOT_TOKEN) {
  console.error('[Discord Worker] ERROR: DISCORD_BOT_TOKEN is not configured.');
  process.exit(1);
}

console.log('───────────────────────────────────────────────────────────────────────');
console.log(' VORTEX GAMING — Dedicated Discord Live Support Worker');
console.log(` Guild ID:          ${GUILD_ID || '(any)'}`);
console.log(` Support Channel:   ${SUPPORT_CHANNEL_ID || '(all threads)'}`);
console.log('───────────────────────────────────────────────────────────────────────');

function discordReq(apiPath, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Authorization': `Bot ${BOT_TOKEN}`,
      'User-Agent': 'VORTEX-Gaming-Bot-Worker (https://vortexgaming.gg, 1.0.0)',
    };
    if (body) headers['Content-Type'] = 'application/json';

    const req = https.request(
      {
        hostname: 'discord.com',
        port: 443,
        path: `/api/v10${apiPath}`,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Ingest staff reply into local support store
async function ingestStaffReply({ threadId, messageId, authorName, authorAvatar, content }) {
  try {
    const { addMessageToTicket, getTicketByDiscordThreadId, updateTicketStatus } = await import('../src/lib/support/support-store.ts');
    const ticket = getTicketByDiscordThreadId(threadId);

    if (!ticket) {
      console.log(`[Discord Worker] Message in thread ${threadId} does not match any active website ticket.`);
      return;
    }

    const trimmed = content.trim();

    // Check for staff commands
    if (trimmed === '!close' || trimmed === '/close') {
      await updateTicketStatus({ ticketId: ticket.id, status: 'CLOSED', isAdmin: true });
      await addMessageToTicket({
        ticketId: ticket.id,
        sender: 'SYSTEM',
        senderName: 'VORTEX System',
        message: `Support ticket was resolved and closed by staff (${authorName}).`,
        isAdmin: true,
      });
      await discordReq(`/channels/${threadId}/messages`, 'POST', {
        content: `🔒 **Ticket #${ticket.ticketNumber || ticket.id} closed** by ${authorName}. Thread archived.`,
      });
      console.log(`[Discord Worker] Ticket #${ticket.ticketNumber || ticket.id} closed by staff command.`);
      return;
    }

    if (trimmed === '!reopen' || trimmed === '/reopen') {
      await updateTicketStatus({ ticketId: ticket.id, status: 'OPEN', isAdmin: true });
      await addMessageToTicket({
        ticketId: ticket.id,
        sender: 'SYSTEM',
        senderName: 'VORTEX System',
        message: `Support ticket was reopened by staff (${authorName}).`,
        isAdmin: true,
      });
      await discordReq(`/channels/${threadId}/messages`, 'POST', {
        content: `🔓 **Ticket #${ticket.ticketNumber || ticket.id} reopened** by ${authorName}.`,
      });
      console.log(`[Discord Worker] Ticket #${ticket.ticketNumber || ticket.id} reopened by staff command.`);
      return;
    }

    // Normal staff reply
    const added = await addMessageToTicket({
      ticketId: ticket.id,
      sender: 'SUPPORT_AGENT',
      senderName: `${authorName} (Staff)`,
      senderAvatar: authorAvatar,
      message: content,
      isAdmin: true,
      discordMessageId: messageId,
    });

    console.log(`[Discord Worker] ✅ Synced reply from "${authorName}" into Ticket #${ticket.ticketNumber || ticket.id}: "${content.substring(0, 50)}"`);
  } catch (err) {
    console.error('[Discord Worker] Failed to ingest staff reply:', err?.message || err);
  }
}

let ws = null;
let heartbeatTimer = null;
let lastSequence = null;
let isReconnecting = false;

function connectGateway() {
  if (isReconnecting) return;
  console.log('[Discord Worker] Connecting to Discord Gateway v10...');

  // Intent 1 (GUILDS) | 512 (GUILD_MESSAGES) = 513
  const intents = 1 | 512;

  ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

  ws.addEventListener('open', () => {
    console.log('[Discord Worker] WebSocket connection established.');
  });

  ws.addEventListener('message', async (event) => {
    try {
      const payload = JSON.parse(event.data);
      const { op, d, s, t } = payload;
      if (s !== null) lastSequence = s;

      // Opcode 10: Hello
      if (op === 10) {
        const interval = d.heartbeat_interval;
        console.log(`[Discord Worker] Received Hello from Discord. Heartbeat interval: ${interval}ms`);

        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 1, d: lastSequence }));
          }
        }, interval);

        // Send Opcode 2: Identify
        const identify = {
          op: 2,
          d: {
            token: BOT_TOKEN,
            intents: intents,
            properties: {
              os: process.platform,
              browser: 'vortex-discord-worker',
              device: 'vortex-discord-worker',
            },
          },
        };
        ws.send(JSON.stringify(identify));
      }

      // Opcode 11: Heartbeat ACK
      if (op === 11) {
        // Heartbeat acknowledged cleanly
      }

      // Opcode 0: Dispatch
      if (op === 0) {
        if (t === 'READY') {
          console.log(`[Discord Worker] 🚀 Bot Ready! Logged in as: ${d.user.username}#${d.user.discriminator} (ID: ${d.user.id})`);
          console.log(`[Discord Worker] Listening for staff responses in Discord support threads...`);
        }

        if (t === 'MESSAGE_CREATE') {
          // Ignore messages from bots (prevents feedback loops)
          if (d.author?.bot) return;

          // Verify guild if configured
          if (GUILD_ID && d.guild_id && d.guild_id !== GUILD_ID) return;

          let content = d.content || '';

          // If message content was redacted due to privileged intent toggle, fetch via REST
          if (!content && d.channel_id && d.id) {
            try {
              const fullMsg = await discordReq(`/channels/${d.channel_id}/messages/${d.id}`);
              if (fullMsg.status === 200 && fullMsg.data?.content) {
                content = fullMsg.data.content;
              }
            } catch {}
          }

          if (!content) return;

          const staffName = d.member?.nick || d.author?.global_name || d.author?.username || 'Staff Agent';
          const avatarUrl = d.author?.avatar
            ? `https://cdn.discordapp.com/avatars/${d.author.id}/${d.author.avatar}.png`
            : undefined;

          await ingestStaffReply({
            threadId: d.channel_id,
            messageId: d.id,
            authorName: staffName,
            authorAvatar: avatarUrl,
            content,
          });
        }
      }

      // Opcode 9 or 7: Reconnect / Invalid Session
      if (op === 9 || op === 7) {
        console.warn(`[Discord Worker] Gateway requested reconnect (op: ${op}).`);
        reconnect();
      }
    } catch (err) {
      console.error('[Discord Worker] Message processing error:', err);
    }
  });

  ws.addEventListener('close', (event) => {
    console.warn(`[Discord Worker] WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || 'None'}`);
    reconnect();
  });

  ws.addEventListener('error', (err) => {
    console.error('[Discord Worker] WebSocket error:', err?.message || err);
  });
}

function reconnect() {
  if (isReconnecting) return;
  isReconnecting = true;
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (ws) {
    try { ws.close(); } catch {}
  }
  setTimeout(() => {
    isReconnecting = false;
    connectGateway();
  }, 5000);
}

// Start Gateway Connection
connectGateway();

// Graceful termination
process.on('SIGINT', () => {
  console.log('[Discord Worker] Shutting down gracefully...');
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (ws) ws.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (ws) ws.close();
  process.exit(0);
});
