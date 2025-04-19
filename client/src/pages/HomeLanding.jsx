// HomeLanding.jsx – buyer‑centric landing w/ Solutions, Use‑cases, Deep Intelligence Engine
// Tailwind + i18n + dark‑mode. Fully self‑contained file.

import React from "react";
import { Link } from "../stub-router-dom";
import { PlayCircle, ArrowRight, BarChart2, Brain } from "lucide-react";
import { useTranslation } from "../i18n";
// Import i18n to initialize it
import "../i18n";

export default function HomeLanding() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const Button = ({ to, children, variant = "primary" }) => {
    const base =
      "px-6 py-3 rounded-lg inline-flex items-center gap-2 text-lg transition font-medium focus:outline-none";
    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-lg focus:ring-2 focus:ring-blue-400",
      ghost:
        "bg-white dark:bg-slate-900/30 border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-900/50",
    };
    return (
      <Link to={to} className={`${base} ${variants[variant]}`}>{children}</Link>
    );
  };

  /* ───────────────────────── Basic data */
  const valueBullets = [
    ["⏱️", t("Save Months"), t("Automate 70% of narrative writing & eCTD packaging time.")],
    ["💸", t("Slash Costs"), t("Reduce external medical‑writing spend by $120k per program.")],
    ["📈", t("Scale Studies"), t("Run 3× more trials per FTE—without compromising compliance.")],
  ];

  const solutions = [
    {
      color: "blue",
      title: t("CSR Intelligence"),
      desc: t("Comparator benchmarks, dropout trends, endpoint insights from 3 000+ tagged CSRs."),
      link: "/csr-library",
    },
    {
      color: "emerald",
      title: t("CER Generator"),
      desc: t("EU MDR Word/PDF with FAERS anomaly detection and Rev 2/7‑1 traceability matrix."),
      link: "/cer-dashboard",
    },
    {
      color: "violet",
      title: t("IND Automation"),
      desc: t("Module 1–5 creator, GPT‑4 Turbo summaries, eCTD packaging, ESG push + sequence tracking."),
      link: "/ind-automation",
    },
    {
      color: "teal",
      title: t("KPI Analytics & Alerts"),
      desc: t("Drag‑and‑drop charts, server‑SQL, Teams/email alerts, PNG/CSV export."),
      link: "/dashboard#kpi",
    },
  ];

  const useCases = [
    ["🚀", t("First‑in‑Human"), t("Draft Module 2 summaries and QOS in 48 hrs, compressing go‑to‑IND timelines."), "/ind-automation"],
    ["🔄", t("Label Expansion"), t("Reuse CER evidence & CSR deltas to generate IND amendments in days."), "/cer-dashboard"],
    ["🧬", t("Rare‑Disease Trials"), t("Benchmark comparators & endpoints when historical data is scarce."), "/csr-library"],
  ];

  /* ───────────────────────── Component */
  return (
    <main className="font-sans text-gray-800 dark:text-gray-100 w-full overflow-x-hidden">
      {/* HERO */}
      <header className="pt-28 pb-24 bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-800 text-center relative">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-blue-700 dark:text-blue-400">
          {t("Move Concepts → Cures Faster")}
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl leading-relaxed text-gray-700 dark:text-gray-300">
          {t("Ingest evidence, auto‑draft CERs & IND modules, and e‑submit via FDA ESG—cutting CRO billables up to 40%.")}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button to="/demo">
            <PlayCircle size={20} /> {t("Watch 2‑min Demo")}
          </Button>
          <Button variant="ghost" to="/roi">
            <BarChart2 size={18} /> {t("Estimate ROI")}
          </Button>
        </div>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          {t("Trusted by regulatory teams at venture‑backed biotechs and global CROs")}
        </p>
      </header>

      {/* VALUE BULLETS */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
        {valueBullets.map(([icon, title, body]) => (
          <article key={title} className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 text-center flex flex-col items-center">
            <span className="text-4xl mb-2">{icon}</span>
            <h3 className="font-semibold text-xl mb-1">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{body}</p>
          </article>
        ))}
      </section>

      {/* DEEP INTELLIGENCE ENGINE */}
      <section className="py-20 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 text-center px-6">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Brain size={28} className="text-emerald-600 dark:text-emerald-400" /> {t("Deep Intelligence Engine")}
        </h2>
        <p className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300 text-lg mb-6">
          {t("Our LLM‑tuned pipeline links every statement back to a verifiable data point—CSR paragraph, FAERS case, Benchling batch record—so reviewers trust every sentence.")}
        </p>
        <Button variant="primary" to="/tech">
          {t("Explore the tech stack")} <ArrowRight size={16} />
        </Button>
      </section>

      {/* USE CASES */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-10">
        {useCases.map(([icon, title, body, to]) => (
          <article key={title} className="border rounded-lg p-6 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">{icon}</span> {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 flex-grow leading-relaxed mb-4">{body}</p>
            <Link to={to} className="text-blue-700 dark:text-blue-300 font-medium hover:underline">
              {t("See how")} →
            </Link>
          </article>
        ))}
      </section>

      {/* SOLUTION CARDS */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid gap-10 md:grid-cols-2">
        {solutions.map((m) => (
          <article key={m.title} className={`p-6 rounded-lg shadow bg-white dark:bg-slate-900 border-t-4 border-${m.color}-600 dark:border-${m.color}-400 flex flex-col`}>
            <h3 className={`text-${m.color}-700 dark:text-${m.color}-300 text-xl font-semibold mb-2`}>{m.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 flex-grow leading-relaxed mb-4">{m.desc}</p>
            <Link to={m.link} className={`font-medium text-${m.color}-700 dark:text-${m.color}-300 hover:underline`}>
              {t("Learn more")}
            </Link>
          </article>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="py-14 bg-gray-50 dark:bg-slate-900 text-center text-sm text-gray-500 dark:text-gray-400">
        © {year}  TrialSage • {t("All rights reserved.")}
      </footer>
    </main>
  );
}