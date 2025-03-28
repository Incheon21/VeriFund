import React, { useState, useEffect } from "react";
import { createActor } from "declarations/backend";
import { canisterId } from "declarations/backend/index.js";
import { NavLink } from "react-router";
import { Principal } from "@dfinity/principal";
import { useAuth } from "../utils/auth";
import Alert from "../components/Alert";

const backendActor = createActor(canisterId, {
  agentOptions: {
    host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
  },
});

export default function Explore() {
  const [campaigns, setCampaigns] = useState([]);
  const { principal } = useAuth();
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(campaigns.length / 6);
  const paginatedCampaigns = campaigns.slice((currentPage - 1) * 6, currentPage * 6);

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const loadCampaigns = async () => {
    try {
      const campaignsData = await backendActor.getCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setAlert({ type: "error", message: "Error loading campaigns." });
    }
  };

  const donateToCampaign = async (campaignId, amount) => {
    try {
      const result = await backendActor.donate(Principal.fromText(principal), campaignId, BigInt(amount));
      if (result) {
        setAlert({ type: "success", message: "Donation successful!" });
        loadCampaigns();
      } else {
        setAlert({ type: "error", message: "Donation failed." });
      }
    } catch (error) {
      setAlert({ type: "error", message: "Error during donation." });
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Explore Campaigns</h1>
        {campaigns.length === 0 ? (
          <p className="text-center text-gray-500">No campaigns available. Please check back later.</p>
        ) : (
          <>
            <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {paginatedCampaigns.map((camp, index) => {
                const percentage = Math.min((Number(camp.collected) / Number(camp.target)) * 100, 100);
                const isOverTarget = Number(camp.collected) > Number(camp.target);
                return (
                  <li
                    key={index}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition transform hover:-translate-y-1 hover:shadow-2xl">
                    <h2 className="text-2xl font-bold mb-2">{camp.title}</h2>
                    <p className="text-gray-700 mb-4">{camp.description}</p>
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-600">
                        Collected: {camp.collected.toString()} / {camp.target.toString()} ICP
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: isOverTarget
                              ? `rgb(0, ${Math.min(255, 100 + (Number(camp.collected) - Number(camp.target)) * 2)}, 0)`
                              : "rgb(34, 197, 94)",
                          }}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 ">
                      <strong>Date:</strong>{" "}
                      {new Date(Number(camp.date) / 1_000_000).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Status:</strong> {Object.keys(camp.status)[0]}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      <strong>Owner:</strong> {camp.owner.toText()}
                    </p>
                    <div className="flex justify-between">
                      <NavLink
                        to={`/campaign/${camp.id}`}
                        className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition">
                        View Details
                      </NavLink>
                      <button
                        onClick={() => donateToCampaign(camp.id, 10)}
                        className="inline-block rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition">
                        Donate 10 ICP
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {campaigns.length > 6 && (
              <div className="flex items-center justify-center mt-8 space-x-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition">
                  Prev
                </button>
                <span className="text-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
