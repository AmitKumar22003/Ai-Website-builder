import { ArrowLeft, Rocket, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

function Dashboard() {
  const { userData } = useSelector((state) => state.user);

  const navigate = useNavigate();

  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deployingId, setDeployingId] = useState(null);

  // Deploy Website
  const handleDeploy = async (id) => {
    try {
      setDeployingId(id);

      const result = await axios.get(
        `${serverUrl}/api/website/deploy/${id}`,
        {
          withCredentials: true,
        }
      );

      // Open deployed website
      if (result?.data?.url) {
        window.open(result.data.url, "_blank");
      }

      // Update deployed state locally
      setWebsites((prev) =>
        prev.map((website) =>
          website._id === id
            ? {
                ...website,
                deployed: true,
              }
            : website
        )
      );
    } catch (error) {
      console.error("Deploy Error:", error);

      alert(
        error?.response?.data?.message || "Failed to deploy website"
      );
    } finally {
      setDeployingId(null);
    }
  };

  // Get All Websites
  useEffect(() => {
    const handleGetAllWebsites = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await axios.get(
          `${serverUrl}/api/website/get-all`,
          {
            withCredentials: true,
          }
        );

        setWebsites(result?.data || []);
      } catch (error) {
        console.error("Get Websites Error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load websites"
        );
      } finally {
        setLoading(false);
      }
    };

    handleGetAllWebsites();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
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
              Dashboard
            </h1>
          </div>

          <button
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition"
            onClick={() => navigate("/generate")}
          >
            + New Website
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-sm text-zinc-400 mb-1">
            Welcome Back
          </p>

          <h1 className="text-3xl font-bold">
            {userData?.name || "User"}
          </h1>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="mt-24 text-center text-zinc-400">
            Loading Your Websites...
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-24 text-center text-red-400">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && websites.length === 0 && (
          <div className="mt-24 text-center text-zinc-400">
            You have no websites
          </div>
        )}

        {/* Websites */}
        {!loading && !error && websites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {websites.map((w, i) => (
              <motion.div
                key={w._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition flex flex-col"
              >
                {/* Preview */}
                <div
                  className="relative h-40 bg-black cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/editor/${w._id}`)}
                >
                  <iframe
                    sandbox=""
                    srcDoc={w.latestCode || ""}
                    title={w.title}
                    className="absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white"
                  />

                  <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  <h3 className="text-base font-semibold line-clamp-2">
                    {w.title || "Untitled Website"}
                  </h3>

                  <p className="text-xs text-zinc-400">
                    Last Updated{" "}
                    {w.updatedAt
                      ? new Date(
                          w.updatedAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>

                  {!w.deployed ? (
                    <button
                      onClick={() => handleDeploy(w._id)}
                      disabled={deployingId === w._id}
                      className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Rocket size={18} />

                      {deployingId === w._id
                        ? "Deploying..."
                        : "Deploy"}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        window.open(w.deployLink, "_blank")
                      }
                      className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:scale-105 transition"
                    >
                      <Share2 size={18} />
                      Share Link
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;