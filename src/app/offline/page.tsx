/**
 * Offline fallback page.
 *
 * The service worker serves this route when the device is offline and the
 * requested page isn't cached. Kept simple, friendly, and audio-free.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-6xl">📡</div>
      <h1 className="text-3xl font-bold">You&apos;re offline</h1>
      <p className="text-lg">
        Captain Kiddo needs the internet for this. Please reconnect and try again!
      </p>
    </main>
  );
}
