import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #f5f0ff 0%, #fafafa 60%, #fff 100%)" }}>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: "#8A3BDB" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L12 22M2 12L22 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Christianity Affiliation Survey
          </h1>
          <p className="text-gray-600 text-base mb-10 leading-relaxed">
            This short survey collects anonymous information about your background and your affiliation with Christianity. Your responses help us better understand our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/survey">
              <button
                className="px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto"
                style={{ background: "#8A3BDB", focusRingColor: "#8A3BDB" }}
              >
                Take the Survey
              </button>
            </Link>
            <Link href="/results">
              <button className="px-8 py-3 rounded-lg font-semibold border-2 text-gray-700 bg-white transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto" style={{ borderColor: "#8A3BDB", color: "#8A3BDB" }}>
                View Results
              </button>
            </Link>
          </div>
        </div>
      </main>
      <footer className="text-center text-sm text-gray-500 py-6 border-t border-gray-200">
        Survey by Grace Moore, BAIS:3300 - spring 2026
      </footer>
    </div>
  );
}
