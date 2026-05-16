import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { serverUrl } from "../App";

const PHASES = [
  "Analyzing your ideas...",
  "Designing layout & Structure...",
  "Writing HTML & CSS...",
  "Adding animations & interactions...",
  "Final quality checks...",
];

function Generate() {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [error, setError] = useState("");

  const handleGenerateWebsite = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/website/generate`,
        { prompt },
        { withCredentials: true },
      );

      console.log(result.data);

      setProgress(100);

      setTimeout(() => {
        setLoading(false);

        navigate(`/editor/${result.data.website}`);
      }, 500);
    } catch (error) {
      console.log(error);

      setLoading(false);

      setError(
        error?.response?.data?.message || "Something went wrong",
      );
    }
  };

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      setPhaseIndex(0);
      return;
    }

    let value = 0;

    const interval = setInterval(() => {
      const increment =
        value < 20
          ? Math.random() * 1.5
          : value < 60
            ? Math.random() * 1.2
            : Math.random() * 0.6;

      value += increment;

      if (value >= 93) value = 93;

      setProgress(Math.floor(value));

      const phase = Math.min(
        Math.floor((value / 100) * PHASES.length),
        PHASES.length - 1,
      );

      setPhaseIndex(phase);
    }, 1200);

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#050505] via-[#0b0b0b] to-[#050505] text-white flex flex-col">
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} />
            </button>

            <h1 className="text-lg font-semibold">
              Genweb<span className="text-zinc-400">.ai</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Build Website with
              <span className="block bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Real AI Power
              </span>
            </h1>

            <p className="text-zinc-400 max-w-2xl mx-auto">
              This process may take several minutes.
            </p>
          </motion.div>

          <div className="mb-10">
            <h1 className="text-xl font-semibold mb-3">
              Describe your website
            </h1>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your website in details..."
              className="w-full h-52 resize-none p-6 rounded-3xl bg-black/60 border border-white/20 outline-none text-sm leading-relaxed focus:ring-2 focus:ring-white/20"
            />

            {error && (
              <p className="mt-4 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <motion.button
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.96 } : {}}
              disabled={!prompt.trim() || loading}
              onClick={handleGenerateWebsite}
              className={`px-14 py-4 rounded-2xl font-semibold text-lg transition ${
                prompt.trim() && !loading
                  ? "bg-white text-black"
                  : "bg-white/20 text-zinc-400 cursor-not-allowed"
              }`}
            >
              {loading
                ? "Generating Website..."
                : "Generate Website"}
            </motion.button>
          </div>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-xl mx-auto mt-12"
            >
              <div className="flex justify-between mb-2 text-xs text-zinc-400">
                <span>{PHASES[phaseIndex]}</span>
                <span>{progress}%</span>
              </div>

              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-white to-zinc-300"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Generate;