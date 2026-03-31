import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { supabase, SurveyResponse } from "@/lib/supabase";
import { US_STATES, AFFILIATIONS, PRACTICES } from "@/lib/constants";

interface FormErrors {
  hometown?: string;
  state?: string;
  affiliation?: string;
  practices?: string;
  other_practice?: string;
}

export default function Survey() {
  const [, navigate] = useLocation();
  const [hometown, setHometown] = useState("");
  const [state, setState] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [practices, setPractices] = useState<string[]>([]);
  const [otherPractice, setOtherPractice] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const otherInputRef = useRef<HTMLInputElement>(null);
  const hometownRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hometownRef.current?.focus();
  }, []);

  const otherChecked = practices.includes("Other");

  useEffect(() => {
    if (otherChecked) {
      otherInputRef.current?.focus();
    }
  }, [otherChecked]);

  function togglePractice(practice: string) {
    setPractices((prev) =>
      prev.includes(practice)
        ? prev.filter((p) => p !== practice)
        : [...prev, practice]
    );
    if (errors.practices) setErrors((e) => ({ ...e, practices: undefined }));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!hometown.trim()) errs.hometown = "Please enter your hometown.";
    if (!state) errs.state = "Please select your state.";
    if (!affiliation) errs.affiliation = "Please select your affiliation.";
    if (practices.length === 0) errs.practices = "Please select at least one practice.";
    if (otherChecked && !otherPractice.trim())
      errs.other_practice = "Please describe your other practice.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    const payload: SurveyResponse = {
      hometown: hometown.trim(),
      state,
      affiliation,
      practices,
      other_practice: otherChecked ? otherPractice.trim() : null,
    };

    const { error } = await supabase.from("survey_responses").insert([payload]);

    if (error) {
      setSubmitError("Something went wrong submitting your response. Please try again.");
      setSubmitting(false);
      return;
    }

    navigate("/thank-you", {
      state: { hometown: hometown.trim(), state, affiliation, practices, otherPractice: otherChecked ? otherPractice.trim() : "" },
    });
  }

  const inputClass = (hasError?: string) =>
    `w-full px-4 py-2.5 rounded-lg border text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors ${
      hasError
        ? "border-red-400 focus:ring-red-300"
        : "border-gray-300 focus:ring-purple-300"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/">
            <button className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#8A3BDB" }}>
              ← Home
            </button>
          </Link>
          <Link href="/results">
            <button className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#8A3BDB" }}>
              View Results
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Christianity Affiliation Survey</h1>
          <p className="text-gray-600 mb-8 text-sm">All fields are required. Your responses are anonymous.</p>

          {submitError && (
            <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Q1 */}
            <fieldset className="mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <legend className="sr-only">Question 1</legend>
              <label htmlFor="hometown" className="block font-semibold text-gray-900 mb-3">
                1. What is your hometown?
              </label>
              <div id="field-hometown">
                <input
                  id="hometown"
                  ref={hometownRef}
                  type="text"
                  value={hometown}
                  onChange={(e) => { setHometown(e.target.value); setErrors((er) => ({ ...er, hometown: undefined })); }}
                  placeholder="e.g. Springfield"
                  className={inputClass(errors.hometown)}
                  aria-describedby={errors.hometown ? "hometown-error" : undefined}
                  aria-invalid={!!errors.hometown}
                  autoComplete="off"
                />
                {errors.hometown && (
                  <p id="hometown-error" role="alert" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.hometown}
                  </p>
                )}
              </div>
            </fieldset>

            {/* Q2 */}
            <fieldset className="mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <legend className="sr-only">Question 2</legend>
              <label htmlFor="state" className="block font-semibold text-gray-900 mb-3">
                2. What state are you from?
              </label>
              <div id="field-state">
                <select
                  id="state"
                  value={state}
                  onChange={(e) => { setState(e.target.value); setErrors((er) => ({ ...er, state: undefined })); }}
                  className={inputClass(errors.state)}
                  aria-describedby={errors.state ? "state-error" : undefined}
                  aria-invalid={!!errors.state}
                >
                  <option value="">Select a state...</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && (
                  <p id="state-error" role="alert" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.state}
                  </p>
                )}
              </div>
            </fieldset>

            {/* Q3 */}
            <fieldset className="mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <legend className="block font-semibold text-gray-900 mb-3" id="field-affiliation">
                3. How do you identify your Christian affiliation?
              </legend>
              <div role="radiogroup" aria-labelledby="field-affiliation" aria-describedby={errors.affiliation ? "affiliation-error" : undefined}>
                {AFFILIATIONS.map((a) => (
                  <label key={a} className="flex items-center gap-3 py-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="affiliation"
                      value={a}
                      checked={affiliation === a}
                      onChange={() => { setAffiliation(a); setErrors((er) => ({ ...er, affiliation: undefined })); }}
                      className="w-4 h-4 accent-purple-600"
                      style={{ accentColor: "#8A3BDB" }}
                    />
                    <span className="text-gray-800 text-sm group-hover:text-gray-900">{a}</span>
                  </label>
                ))}
              </div>
              {errors.affiliation && (
                <p id="affiliation-error" role="alert" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span aria-hidden="true">⚠</span> {errors.affiliation}
                </p>
              )}
            </fieldset>

            {/* Q4 */}
            <fieldset className="mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <legend className="block font-semibold text-gray-900 mb-1" id="field-practices">
                4. How do you practice your faith?
              </legend>
              <p className="text-sm text-gray-500 mb-3">Select all that apply.</p>
              <div role="group" aria-labelledby="field-practices" aria-describedby={errors.practices ? "practices-error" : undefined}>
                {PRACTICES.map((p) => (
                  <label key={p} className="flex items-center gap-3 py-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      value={p}
                      checked={practices.includes(p)}
                      onChange={() => togglePractice(p)}
                      className="w-4 h-4"
                      style={{ accentColor: "#8A3BDB" }}
                    />
                    <span className="text-gray-800 text-sm group-hover:text-gray-900">{p}</span>
                  </label>
                ))}
              </div>
              {errors.practices && (
                <p id="practices-error" role="alert" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span aria-hidden="true">⚠</span> {errors.practices}
                </p>
              )}

              {otherChecked && (
                <div className="mt-4" id="field-other_practice">
                  <label htmlFor="other-practice" className="block text-sm font-medium text-gray-700 mb-1">
                    Please describe your other practice:
                  </label>
                  <input
                    id="other-practice"
                    ref={otherInputRef}
                    type="text"
                    value={otherPractice}
                    onChange={(e) => { setOtherPractice(e.target.value); setErrors((er) => ({ ...er, other_practice: undefined })); }}
                    placeholder="e.g. Contemplative prayer"
                    className={inputClass(errors.other_practice)}
                    aria-describedby={errors.other_practice ? "other-practice-error" : undefined}
                    aria-invalid={!!errors.other_practice}
                  />
                  {errors.other_practice && (
                    <p id="other-practice-error" role="alert" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span aria-hidden="true">⚠</span> {errors.other_practice}
                    </p>
                  )}
                </div>
              )}
            </fieldset>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ background: "#8A3BDB" }}
            >
              {submitting ? "Submitting…" : "Submit Survey"}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 py-6 border-t border-gray-200">
        Survey by Grace Moore, BAIS:3300 - spring 2026
      </footer>
    </div>
  );
}
