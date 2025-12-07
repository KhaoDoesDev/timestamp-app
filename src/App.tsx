import { useEffect, useRef, useState } from "react";

export default function UtcClock() {
  const [display, setDisplay] = useState("Loading…");

  const baseUtcRef = useRef<number | null>(null);
  const perfStartRef = useRef<number>(0);

  const pad = (num: number, size: number) => String(num).padStart(size, "0");

  const syncUtc = async () => {
    try {
      const t0 = performance.now();
      const res = await fetch("https://time.akamai.com/?iso");
      const t1 = performance.now();

      const text = await res.text();
      const akamaiUtc = new Date(text).getTime();

      const latency = (t1 - t0) / 2;
      const correctedAkamai = akamaiUtc + latency;

      baseUtcRef.current = correctedAkamai;
      perfStartRef.current = performance.now();
    } catch (err) {
      console.error("Akamai fetch failed, using local UTC:", err);

      baseUtcRef.current = Date.now();
      perfStartRef.current = performance.now();
    }
  };

  useEffect(() => {
    let tickId: number;
    let syncId: NodeJS.Timeout;

    const start = async () => {
      await syncUtc();

      syncId = setInterval(syncUtc, 5_000);

      const tick = () => {
        if (baseUtcRef.current === null) {
          tickId = requestAnimationFrame(tick);
          return;
        }

        const elapsed = performance.now() - perfStartRef.current;
        const now = new Date(baseUtcRef.current + elapsed);

        const formatted =
          `${now.getUTCFullYear()}-` +
          `${pad(now.getUTCMonth() + 1, 2)}-` +
          `${pad(now.getUTCDate(), 2)} ` +
          `${pad(now.getUTCHours(), 2)}:` +
          `${pad(now.getUTCMinutes(), 2)}:` +
          `${pad(now.getUTCSeconds(), 2)}:` +
          `${pad(now.getUTCMilliseconds(), 3)}`;

        setDisplay(formatted);

        tickId = requestAnimationFrame(tick);
      };

      tick();
    };

    start();

    return () => {
      cancelAnimationFrame(tickId);
      clearInterval(syncId);
    };
  }, []);

  return (
    <main className="w-fit mx-auto p-8 flex flex-col min-h-dvh">
      <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
        Khao's Live UTC Timestamp App
      </h1>

      <p className="text-sm text-muted-foreground text-center mb-4">
        Format: YYYY-MM-DD HH:MM:SS:MS
      </p>

      <div className="text-4xl md:text-6xl font-mono tracking-widest text-center my-auto">
        {display}
      </div>

      <footer>
        <p className="text-center">Made by <a href="https://www.khaodoes.dev/" target="_blank" className="hover:underline text-blue-500">Khao</a></p>
      </footer>
    </main>
  );
}
