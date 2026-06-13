import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { parse } from "url";

/**
 * Live audio relay.
 *
 * Lets one device (e.g. an iPhone in Safari) capture its microphone and stream
 * raw PCM audio over a WebSocket. The server relays those packets to every
 * "listener" device (e.g. a Mac) connected to the same room, which plays the
 * audio out of its speakers in near real time.
 *
 * Protocol (all on the same socket):
 *   - Connect to:  /ws/audio?room=<room>&role=speaker|listener
 *   - Speakers send a JSON `{ type: "hello", sampleRate }` control frame, then
 *     a stream of binary frames containing 16-bit little-endian mono PCM.
 *   - The server forwards both the hello frame and the audio frames to every
 *     listener in the room, and broadcasts `{ type: "presence", ... }` updates
 *     whenever the room membership changes.
 */

type Role = "speaker" | "listener";

interface Meta {
  room: string;
  role: Role;
  sampleRate?: number;
}

export function setupAudioRelay(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/audio" });
  const meta = new WeakMap<WebSocket, Meta>();
  const rooms = new Map<string, Set<WebSocket>>();

  const peersOf = (room: string) => rooms.get(room) ?? new Set<WebSocket>();

  function broadcastPresence(room: string) {
    const peers = peersOf(room);
    let speakers = 0;
    let listeners = 0;
    let sampleRate: number | undefined;
    peers.forEach((p) => {
      const m = meta.get(p);
      if (m?.role === "speaker") {
        speakers++;
        if (m.sampleRate) sampleRate = m.sampleRate;
      } else if (m?.role === "listener") {
        listeners++;
      }
    });
    const msg = JSON.stringify({ type: "presence", speakers, listeners, sampleRate });
    peers.forEach((p) => {
      if (p.readyState === WebSocket.OPEN) p.send(msg);
    });
  }

  wss.on("connection", (ws, req) => {
    const { query } = parse(req.url || "", true);
    const room = (typeof query.room === "string" && query.room) || "main";
    const role: Role = query.role === "speaker" ? "speaker" : "listener";

    meta.set(ws, { room, role });
    if (!rooms.has(room)) rooms.set(room, new Set());
    rooms.get(room)!.add(ws);
    broadcastPresence(room);

    ws.on("message", (data, isBinary) => {
      const m = meta.get(ws);
      if (!m) return;

      // Capture the speaker's sample rate from its hello frame so listeners
      // joining later can be told about it via the presence broadcast.
      if (!isBinary && m.role === "speaker") {
        try {
          const obj = JSON.parse(data.toString());
          if (obj?.type === "hello" && typeof obj.sampleRate === "number") {
            m.sampleRate = obj.sampleRate;
            broadcastPresence(m.room);
          }
        } catch {
          /* ignore malformed control frames */
        }
      }

      // Only speakers produce audio; relay everything they send to listeners.
      if (m.role !== "speaker") return;
      peersOf(m.room).forEach((peer) => {
        if (peer === ws) return;
        if (meta.get(peer)?.role !== "listener") return;
        if (peer.readyState === WebSocket.OPEN) {
          peer.send(data, { binary: isBinary });
        }
      });
    });

    ws.on("close", () => {
      const m = meta.get(ws);
      if (!m) return;
      peersOf(m.room).delete(ws);
      if (peersOf(m.room).size === 0) rooms.delete(m.room);
      else broadcastPresence(m.room);
    });
  });

  return wss;
}
