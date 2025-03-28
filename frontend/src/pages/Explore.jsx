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

  // Load campaigns using getCampaigns() → (vec record {...})
  const loadCampaigns = async () => {
    try {
      const campaignsData = await backendActor.getCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setAlert({ type: "error", message: "Error loading campaigns." });
    }
  };

  // (Optional) Donate to a campaign using donate(text, nat) → (bool)
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
      console.error("Donation error:", error);
      setAlert({ type: "error", message: "Error during donation." });
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="min-h-screen w-[100vw] bg-white text-gray-800">
      <main className="container mx-auto w-[95%]">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        <h1 className="text-2xl font-bold mb-6">Explore Campaigns</h1>
        {campaigns.map((camp, index) => {
          const percentage = Math.min((Number(camp.collected) / Number(camp.target)) * 100, 100);
          const isOverTarget = Number(camp.collected) > Number(camp.target);

          return (
            <li key={index} className="shadow-md border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-2xl">{camp.title}</h2>
              <p>{camp.description}</p>
              <div className="mt-2">
                <p className="text-sm font-semibold">
                  Collected: {camp.collected.toString()} / {camp.target.toString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                  <div
                    className="h-4 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isOverTarget
                        ? `rgb(0, ${Math.min(255, 100 + (Number(camp.collected) - Number(camp.target)) * 2)}, 0)`
                        : "rgb(34, 197, 94)", // Default green
                    }}></div>
                </div>
              </div>
              <p className="mt-2">Status: {Object.keys(camp.status)[0]}</p>
              <div className="mt-4 flex gap-4">
                <NavLink
                  to={`/campaign/${camp.id}`}
                  className="inline-block rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-400">
                  View Details
                </NavLink>
                <button
                  onClick={() => donateToCampaign(camp.id, 10)}
                  className="inline-block rounded bg-green-500 px-3 py-1 text-white hover:bg-green-400">
                  Donate 10 ICP
                </button>
              </div>
            </li>
          );
        })}
      </main>
    </div>
  );
}
