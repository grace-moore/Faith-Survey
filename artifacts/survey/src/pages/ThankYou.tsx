import { Link, useLocation } from "wouter";

export default function ThankYou() {
  const [location] = useLocation();
  const state = (window.history.state as Record<string, unknown> | null) ?? {};
  const hometown = (state?.hometown as string) || "—";
  const stateName = (state?.state as string) || "—";
  const affiliation = (state?.affiliation as string) || "—";
  const practices = (state?.practices as string[]) || [];
  const otherPractice = (state?.otherPractice as string) || "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <button className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#8A3BDB" }}>
              ← Home
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: "#f0e8ff" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A3BDB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
            <p className="text-gray-600 text-sm">Your response has been recorded.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Your Answers</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 shrink-0">Hometown</dt>
                <dd className="text-gray-900 text-right">{hometown}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 shrink-0">State</dt>
                <dd className="text-gray-900 text-right">{stateName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 shrink-0">Affiliation</dt>
                <dd className="text-gray-900 text-right">{affiliation}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 shrink-0">Faith Practices</dt>
                <dd className="text-gray-900 text-right">
                  {practices.length === 0 ? "—" : practices.map((p) => p === "Other" && otherPractice ? otherPractice : p).join(", ")}
                </dd>
              </div>
            </dl>
          </div>

          <Link href="/results">
            <button
              className="w-full py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ background: "#8A3BDB" }}
            >
              View Results
            </button>
          </Link>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 py-6 border-t border-gray-200">
        Survey by Grace Moore, BAIS:3300 - spring 2026
      </footer>
    </div>
  );
}
