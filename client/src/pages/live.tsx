import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Mic, MicOff, Volume2, Radio, Smartphone, Speaker } from "lucide-react";

type Role = "speaker" | "listener";
type Status = "idle" | "connecting" | "live" | "error";

interface Presence {
  speakers: number;
  listeners: number;
  sampleRate?: number;
}

// AudioWorklet that buffers microphone samples and ships them back to the main
// thread in ~1024-sample chunks. Loaded from a Blob so we don't need a
// separate served asset file.
const CAPTURE_WORKLET = `
class CaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._chunks = [];
    this._count = 0;
    this._target = 1024;
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      this._chunks.push(channel.slice(0));
      this._count += channel.length;
      if (this._count >= this._target) {
        const out = new Float32Array(this._count);
        let offset = 0;
        for (const c of this._chunks) { out.set(c, offset); offset += c.length; }
        this.port.postMessage(out, [out.buffer]);
        this._chunks = [];
        this._count = 0;
      }
    }
    return true;
  }
}
registerProcessor('capture', CaptureProcessor);
`;

function wsUrl(room: string, role: Role) {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws/audio?room=${encodeURIComponent(
    room,
  )}&role=${role}`;
}

export default function Live() {
  const [role, setRole] = useState<Role | null>(null);
  const [room, setRoom] = useState("main");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [presence, setPresence] = useState<Presence>({ speakers: 0, listeners: 0 });
  const [level, setLevel] = useState(0); // 0..1 mic level for the speaker meter
  const [volume, setVolume] = useState(0.9);

  // Long-lived audio/socket handles kept in refs so React re-renders don't
  // tear down the live stream.
  const wsRef = useRef<WebSocket | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nextTimeRef = useRef(0);
  const srcRateRef = useRef(48000);

  const stopAll = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    gainRef.current = null;
    nextTimeRef.current = 0;
    setLevel(0);
    setStatus("idle");
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  useEffect(() => {
    gainRef.current?.gain.setValueAtTime(volume, ctxRef.current?.currentTime ?? 0);
  }, [volume]);

  const startSpeaking = useCallback(async () => {
    setError(null);
    setStatus("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      ctxRef.current = ctx;
      await ctx.resume();

      const blob = new Blob([CAPTURE_WORKLET], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      const ws = new WebSocket(wsUrl(room, "speaker"));
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "hello", sampleRate: ctx.sampleRate }));
        setStatus("live");
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(typeof ev.data === "string" ? ev.data : "");
          if (msg.type === "presence") setPresence(msg);
        } catch {
          /* binary echoes are ignored by speakers */
        }
      };
      ws.onclose = () => setStatus((s) => (s === "live" ? "idle" : s));
      ws.onerror = () => {
        setError("Connection lost.");
        setStatus("error");
      };

      const source = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, "capture");
      worklet.port.onmessage = (ev: MessageEvent<Float32Array>) => {
        const floats = ev.data;
        // Track a rough peak for the on-screen meter.
        let peak = 0;
        const pcm = new Int16Array(floats.length);
        for (let i = 0; i < floats.length; i++) {
          const s = Math.max(-1, Math.min(1, floats[i]));
          if (s > peak) peak = s;
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        setLevel(peak);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(pcm.buffer);
        }
      };

      // Keep the graph "pulled" without playing the mic back to the speaker.
      const mute = ctx.createGain();
      mute.gain.value = 0;
      source.connect(worklet);
      worklet.connect(mute);
      mute.connect(ctx.destination);
    } catch (e: any) {
      setError(
        e?.name === "NotAllowedError"
          ? "Microphone permission was denied."
          : e?.message || "Could not start the microphone.",
      );
      setStatus("error");
      stopAll();
    }
  }, [room, stopAll]);

  const startListening = useCallback(async () => {
    setError(null);
    setStatus("connecting");
    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      await ctx.resume();

      const gain = ctx.createGain();
      gain.gain.value = volume;
      gain.connect(ctx.destination);
      gainRef.current = gain;

      const ws = new WebSocket(wsUrl(room, "listener"));
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => setStatus("live");
      ws.onclose = () => setStatus((s) => (s === "live" ? "idle" : s));
      ws.onerror = () => {
        setError("Connection lost.");
        setStatus("error");
      };
      ws.onmessage = (ev) => {
        if (typeof ev.data === "string") {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === "presence") {
              setPresence(msg);
              if (msg.sampleRate) srcRateRef.current = msg.sampleRate;
            }
          } catch {
            /* ignore */
          }
          return;
        }
        // Binary frame: 16-bit PCM -> schedule for gapless playback.
        const pcm = new Int16Array(ev.data as ArrayBuffer);
        if (pcm.length === 0) return;
        const floats = new Float32Array(pcm.length);
        for (let i = 0; i < pcm.length; i++) floats[i] = pcm[i] / 0x8000;

        const rate = srcRateRef.current || ctx.sampleRate;
        const buffer = ctx.createBuffer(1, floats.length, rate);
        buffer.copyToChannel(floats, 0);

        const node = ctx.createBufferSource();
        node.buffer = buffer;
        node.connect(gain);

        const now = ctx.currentTime;
        // ~120ms jitter buffer; resync if we ever fall behind.
        if (nextTimeRef.current < now + 0.05) nextTimeRef.current = now + 0.12;
        node.start(nextTimeRef.current);
        nextTimeRef.current += buffer.duration;
      };
    } catch (e: any) {
      setError(e?.message || "Could not start audio playback.");
      setStatus("error");
      stopAll();
    }
  }, [room, volume, stopAll]);

  const live = status === "live";
  const busy = status === "connecting" || live;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Radio className="h-7 w-7 text-primary" />
          Live Talk
        </h1>
        <p className="text-muted-foreground">
          Speak through your iPhone and hear it live on your Mac&apos;s speakers.
        </p>
      </div>

      {/* Role picker */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          role="button"
          onClick={() => !busy && setRole("speaker")}
          className={`cursor-pointer transition ${
            role === "speaker" ? "border-primary ring-2 ring-primary" : ""
          } ${busy ? "opacity-60 pointer-events-none" : ""}`}
        >
          <CardHeader className="items-center text-center">
            <Smartphone className="h-8 w-8 text-primary" />
            <CardTitle>Speak</CardTitle>
            <CardDescription>Use this on your iPhone</CardDescription>
          </CardHeader>
        </Card>
        <Card
          role="button"
          onClick={() => !busy && setRole("listener")}
          className={`cursor-pointer transition ${
            role === "listener" ? "border-primary ring-2 ring-primary" : ""
          } ${busy ? "opacity-60 pointer-events-none" : ""}`}
        >
          <CardHeader className="items-center text-center">
            <Speaker className="h-8 w-8 text-primary" />
            <CardTitle>Listen</CardTitle>
            <CardDescription>Use this on your Mac</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {role && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="room">Room code</Label>
              <Input
                id="room"
                value={room}
                disabled={busy}
                onChange={(e) => setRoom(e.target.value.trim() || "main")}
                placeholder="main"
              />
              <p className="text-xs text-muted-foreground">
                Use the same room code on both devices.
              </p>
            </div>

            {/* Live status */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    live ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"
                  }`}
                />
                {status === "idle" && "Not connected"}
                {status === "connecting" && "Connecting…"}
                {live && (role === "speaker" ? "On air" : "Listening")}
                {status === "error" && "Stopped"}
              </span>
              <span className="text-muted-foreground">
                {presence.speakers} speaking · {presence.listeners} listening
              </span>
            </div>

            {/* Speaker mic meter */}
            {role === "speaker" && live && (
              <div className="space-y-1">
                <div className="h-2 w-full rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-[width] duration-75"
                    style={{ width: `${Math.min(100, Math.round(level * 140))}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Microphone level</p>
              </div>
            )}

            {/* Listener volume */}
            {role === "listener" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" /> Volume
                </Label>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(v) => setVolume(v[0])}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {!live ? (
              <Button
                className="w-full"
                disabled={status === "connecting"}
                onClick={role === "speaker" ? startSpeaking : startListening}
              >
                {role === "speaker" ? (
                  <>
                    <Mic className="mr-2 h-4 w-4" /> Start talking
                  </>
                ) : (
                  <>
                    <Speaker className="mr-2 h-4 w-4" /> Start listening
                  </>
                )}
              </Button>
            ) : (
              <Button className="w-full" variant="destructive" onClick={stopAll}>
                <MicOff className="mr-2 h-4 w-4" /> Stop
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Microphone access requires opening this page over HTTPS (or on localhost).
      </p>
    </div>
  );
}
