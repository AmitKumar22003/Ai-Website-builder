import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { serverUrl } from "../App";

import { Code2, MessageSquare, Monitor, Rocket, Send, X } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import Editor from "@monaco-editor/react";

function WebsiteEditor() {
  const { id } = useParams();

  const iframeRef = useRef(null);

  const [website, setWebsite] = useState(null);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");

  const [updateLoading, setUpdateLoading] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);

  const [showCode, setShowCode] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const thinkingSteps = [
    "Understanding your request...",
    "Planning layout changes...",
    "Improving responsiveness...",
    "Applying animations...",
    "Finalizing updates...",
  ];

  const handleUpdate = async () => {
    if (!prompt.trim()) return;

    setUpdateLoading(true);

    const text = prompt;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setPrompt("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/website/update/${id}`,
        {
          prompt: text,
        },
        {
          withCredentials: true,
        },
      );

      console.log(result);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: result.data.message,
        },
      ]);

      setCode(result.data.code || "");
    } catch (error) {
      console.log(error);
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % thinkingSteps.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/website/get-by-id/${id}`,
          {
            withCredentials: true,
          },
        );

        console.log(result);

        setWebsite(result.data);

        setCode(result.data.latestCode || "");

        setMessages(result.data.conversation || []);
      } catch (error) {
        console.log(error);

        setError(error.response?.data?.message || "Something went wrong");
      }
    };

    handleGetWebsite();
  }, [id]);

  useEffect(() => {
    if (!iframeRef.current || !code) return;

    iframeRef.current.srcdoc = code;
  }, [code]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-red-400">
        {error}
      </div>
    );
  }

  if (!website) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  function Header({ onClose }) {
    return (
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
        <span className="font-semibold truncate">{website.title}</span>

        {onClose && (
          <button onClick={onClose}>
            <X size={18} color="white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-black text-white overflow-hidden">
      <aside className="hidden lg:flex w-[380px] flex-col border-r border-white/10 bg-black/80">
        <Header />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] ${
                  m.role === "user" ? "ml-auto" : "mr-auto"
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-white text-black"
                      : "bg-white/5 border border-white/10 text-zinc-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {updateLoading && (
              <div className="max-w-[85%] mr-auto">
                <div className="px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic">
                  {thinkingSteps[thinkingIndex]}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Describe changes..."
                className="flex-1 rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <button
                className="px-4 py-3 rounded-2xl bg-white text-black"
                disabled={updateLoading}
                onClick={handleUpdate}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80">
          <span className="text-xs text-zinc-400">Live Preview</span>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-semibold hover:scale-105 transition">
              <Rocket size={15} />
              Deploy
            </button>

            <button className="p-2 lg:hidden" onClick={() => setShowChat(true)}>
              <MessageSquare size={18} />
            </button>

            <button className="p-2" onClick={() => setShowCode(true)}>
              <Code2 size={18} />
            </button>

            {/* FULL SCREEN BUTTON */}

            <button className="p-2" onClick={() => setShowFullPreview(true)}>
              <Monitor size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white">
          <iframe ref={iframeRef} className="w-full h-full" title="preview" />
        </div>
      </div>

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col"
          >
            <Header onClose={() => setShowChat(false)} />

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] ${
                    m.role === "user" ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-white text-black"
                        : "bg-white/5 border border-white/10 text-zinc-200"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {updateLoading && (
                <div className="max-w-[85%] mr-auto">
                  <div className="px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic">
                    {thinkingSteps[thinkingIndex]}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Describe changes..."
                  className="flex-1 rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                <button
                  className="px-4 py-3 rounded-2xl bg-white text-black"
                  disabled={updateLoading}
                  onClick={handleUpdate}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full lg:w-[45%] z-[9999] bg-[#1e1e1e] flex flex-col"
          >
            <div className="h-12 px-4 flex justify-between items-center border-b border-white/10">
              <span className="text-sm font-medium">index.html</span>

              <button onClick={() => setShowCode(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                theme="vs-dark"
                language="html"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 14,
                  minimap: {
                    enabled: false,
                  },
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black"
          >
            <button
              onClick={() => setShowFullPreview(false)}
              className="absolute top-4 right-4 z-50 bg-black/70 p-2 rounded-full"
            >
              <X size={20} />
            </button>

            <iframe
              className="w-full h-full bg-white"
              srcDoc={code}
              title="full-preview"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WebsiteEditor;
