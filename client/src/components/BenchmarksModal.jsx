import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function BenchmarksModal({ onClose }) {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/benchmarks?limit=20")
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! Status: ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        setBenchmarks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching benchmarks:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 max-w-3xl w-full rounded-lg shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500">
          <X size={20} />
        </button>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Data Benchmarks</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Industry-standard performance metrics derived from 892 clinical study reports
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md text-red-700 dark:text-red-400">
            Error loading benchmarks: {error}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {benchmarks.map((benchmark, index) => (
              <div key={index} className="py-3 grid grid-cols-2">
                <div className="font-medium">{benchmark.metric}</div>
                <div className="text-right">{benchmark.value}</div>
              </div>
            ))}
            {benchmarks.length === 0 && (
              <p className="italic text-gray-500 py-4 text-center">No benchmarks available</p>
            )}
            {benchmarks.length > 0 && (
              <div className="pt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Showing {benchmarks.length} of 892 benchmarks
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}