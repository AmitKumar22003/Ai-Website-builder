import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
function Dashboard() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleGetAllWebsites = async () => {
      setLoading(true);
      try {
        const result = await axios.get(`${serverUrl}/api/website/get-all`, {
          withCredentials: true,
        });
        setWebsites(result.data || []);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError(error.response.data.message);
        setLoading(false);
      }
    };
    handleGetAllWebsites();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} />
            </button>

            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          <button
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition"
            onClick={() => navigate("/generate")}
          >
            + New Website
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-sm text-zinc-400 mb-1">Welcome Back</p>

          <h1 className="text-3xl font-bold">{userData?.name}</h1>
        </motion.div>

        {loading && (
          <div className="mt-24 text-center text-zinc-400 ">
            Loading Your Websites...
          </div>
        )}

        {error && !loading && (
          <div className="mt-24 text-center text-red-400 ">{error}</div>
        )}

        {websites?.length == 0 && (
          <div className="mt-24 text-center text-zinc-400 ">
            You have no Websites
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
