import { useEffect, useRef, useState } from "react";

export default function UtcClock() {
  const [display, setDisplay] = useState<string>("Loading...");
  const baseEpochRef = useRef<number | null>(null);
  const baseOffsetRef = useRef<number>(performance.now());

  const pad = (num: number, size: number) => num.toString().padStart(size, "0");

  const fetchUtcTime = async () => {
    try {
      const res = await fetch(
        "https://timeapi.io/api/Time/current/zone?timeZone=UTC"
      );
      const data = await res.json();
      const { year, month, day, hour, minute, seconds, milliSeconds } = data;

      const date = Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute,
        seconds,
        milliSeconds
      );
      baseEpochRef.current = date;
      baseOffsetRef.current = performance.now();
    } catch (err) {
      console.error("Failed to fetch UTC time:", err);
      const now = Date.now();
      baseEpochRef.current = now;
      baseOffsetRef.current = performance.now();
    }
  };

  useEffect(() => {
    fetchUtcTime();

    const syncInterval = setInterval(() => {
      fetchUtcTime();
    }, 300000); // every 5 minutes

    const tickInterval = setInterval(() => {
      if (baseEpochRef.current === null) return;

      const elapsed = performance.now() - baseOffsetRef.current;
      const now = new Date(baseEpochRef.current + elapsed);

      const year = now.getUTCFullYear();
      const month = pad(now.getUTCMonth() + 1, 2);
      const day = pad(now.getUTCDate(), 2);
      const hours = pad(now.getUTCHours(), 2);
      const minutes = pad(now.getUTCMinutes(), 2);
      const seconds = pad(now.getUTCSeconds(), 2);
      const millis = pad(now.getUTCMilliseconds(), 3);

      const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${millis}`;
      setDisplay(formatted);
    }, 10);

    return () => {
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, []);

  return (
    <main className="flex flex-col items-center justify-between min-h-dvh p-8 container mx-auto">
      <div className="flex flex-col w-full mb-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">
          Khao's Live UTC Timestamp App
        </h1>
        <p>This app was used for keeping track of the UTC timestamp. Uses <a target="_blank" href="https://timeapi.io" className="text-blue-500 hover:text-blue-600 hover:underline">timeapi.io</a> for syncing.</p>
      </div>

      <p className="text-sm md:text-base text-muted-foreground mb-4 text-center">
        Format: YYYY-MM-DD HH:MM:SS:MS
      </p>

      <div className="flex-1 flex items-center justify-center w-full">
        <div className="text-4xl md:text-6xl font-mono tracking-widest text-center">
          {display}
        </div>
      </div>

      <footer className="text-sm text-muted-foreground mt-8 text-center">
        <a
          href="https://github.com/KhaoDoesDev/timestamp-app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          View on GitHub
        </a>
        <span className="mx-2">•</span>
        <a
					href="https://www.khaodoes.dev/"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:underline"
				>
          Made with <span className="text-red-500">♥</span> by Khao
        </a>
      </footer>
    </main>
  );
}
