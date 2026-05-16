import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { serverUrl } from "../App";

function Generate() {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");

  const handleGenerateWebsite = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/website/generate`,
        { prompt },
        { withCredentials: true },
      );
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#050505] via-[#0b0b0b] to-[#050505] text-white flex flex-col">
      {/* Navbar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl">
          {/* Hero Section */}
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
              This process may take several minutes. genweb.ai focuses on
              quality, not shortcuts.
            </p>
          </motion.div>

          {/* Textarea */}
          <div className="mb-10">
            <h1 className="text-xl font-semibold mb-3">
              Describe your website
            </h1>

            <div className="relative">
              <textarea
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                placeholder="Describe your website in details..."
                className="w-full h-52 resize-none p-6 rounded-3xl bg-black/60 border border-white/30 outline-none text-sm leading-relaxed focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleGenerateWebsite}
              className="px-14 py-4 rounded-2xl font-semibold text-lg bg-white text-black hover:bg-zinc-200 transition"
            >
              Generate Website
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Generate;
