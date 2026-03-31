import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { supabase, SurveyResponse } from "@/lib/supabase";

const ACCENT = "#8A3BDB";
const LIGHT = "#c4a0f5";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function aggregateAffiliations(rows: SurveyResponse[]) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const key = r.affiliation;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function aggregatePractices(rows: SurveyResponse[]) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    for (const p of r.practices) {
      if (p === "Other") {
        const label = r.other_practice ? normalize(r.other_practice) : "other";
        const display = r.other_practice
          ? r.other_practice.charAt(0).toUpperCase() + r.other_practice.slice(1).toLowerCase()
          : "Other";
        counts[display] = (counts[display] ?? 0) + 1;
      } else {
        counts[p] = (counts[p] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function aggregateStates(rows: SurveyResponse[]) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.state] = (counts[r.state] ?? 0) + 1;
  }
  const total = rows.length;
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, pct: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-6">{title}</h2>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-purple-700">{payload[0].value} response{payload[0].value !== 1 ? "s" : ""}</p>
      </div>
    );
  }
  return null;
};

const StatePctTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { pct: number } }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-purple-700">{payload[0].value} response{payload[0].value !== 1 ? "s" : ""} ({payload[0].payload.pct}%)</p>
      </div>
    );
  }
  return null;
};

export default function Results() {
  const [rows, setRows] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from("survey_responses")
        .select("hometown,state,affiliation,practices,other_practice");
      if (err) {
        setError("Could not load results. Please try again later.");
      } else {
        setRows(data as SurveyResponse[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const affiliationData = aggregateAffiliations(rows);
  const practiceData = aggregatePractices(rows);
  const stateData = aggregateStates(rows);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/">
            <button className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#8A3BDB" }}>
              ← Home
            </button>
          </Link>
          <Link href="/survey">
            <button className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#8A3BDB" }}>
              Take the Survey
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Results</h1>
          <p className="text-gray-500 text-sm mb-8">Aggregated, anonymized data from all submissions.</p>

          {loading && (
            <div className="text-center py-20 text-gray-500">Loading results…</div>
          )}

          {error && (
            <div role="alert" className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {/* Total */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Total Responses</p>
                <p className="text-6xl font-bold" style={{ color: "#8A3BDB" }}>{rows.length}</p>
              </div>

              {rows.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  No responses yet. Be the first to{" "}
                  <Link href="/survey">
                    <span className="underline cursor-pointer" style={{ color: "#8A3BDB" }}>take the survey</span>
                  </Link>
                  !
                </div>
              ) : (
                <>
                  {/* Affiliation breakdown */}
                  <ChartCard title="Christian Affiliation Breakdown">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={affiliationData} margin={{ top: 0, right: 20, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#555" }}
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 11, fill: "#555" }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {affiliationData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? ACCENT : LIGHT} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* Faith practices */}
                  <ChartCard title="Most Common Faith Practices">
                    <ResponsiveContainer width="100%" height={Math.max(220, practiceData.length * 44)}>
                      <BarChart data={practiceData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#555" }} allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={200}
                          tick={{ fontSize: 11, fill: "#555" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {practiceData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? ACCENT : LIGHT} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* Top states */}
                  <ChartCard title="Top States Represented">
                    <ResponsiveContainer width="100%" height={Math.max(220, stateData.length * 44)}>
                      <BarChart data={stateData} layout="vertical" margin={{ top: 0, right: 70, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#555" }} allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={120}
                          tick={{ fontSize: 11, fill: "#555" }}
                        />
                        <Tooltip content={<StatePctTooltip />} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11, fill: "#888", formatter: (v: number, entry: { payload?: { pct: number } }) => `${entry?.payload?.pct ?? 0}%` }}>
                          {stateData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? ACCENT : LIGHT} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 py-6 border-t border-gray-200">
        Survey by Grace Moore, BAIS:3300 - spring 2026
      </footer>
    </div>
  );
}
