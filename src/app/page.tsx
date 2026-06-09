/**
 * Home page (route "/").
 *
 * This is a placeholder landing page so the project runs end-to-end. We replace
 * it with the real kid-facing home screen (module grid, etc.) in a later ticket.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">🦸 Captain Kiddo</h1>
      <p className="text-lg">
        Project scaffold is ready. Learning modules coming soon!
      </p>
    </main>
  );
}
