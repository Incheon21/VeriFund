import React, { useState, useEffect } from "react";
import { createActor } from "declarations/backend";
import { canisterId } from "declarations/backend/index.js";
import { NavLink } from "react-router";
import Alert from "../components/Alert";

const backendActor = createActor(canisterId, {
  agentOptions: {
    host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
  },
});

export default function Explore() {
  const [campaigns, setCampaigns] = useState([]);
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
      const result = await backendActor.donate(campaignId, BigInt(amount));
      if (result) {
        setAlert({ type: "success", message: "Donation successful!" });
        loadCampaigns(); 
      } else {
        setAlert({ type: "error", message: "Donation error!" });
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
        {campaigns.length === 0 ? (
          <p>No campaigns available. Please check back later.</p>
        ) : (
          <ul className="space-y-4">
            {campaigns.map((camp, index) => (
              <li key={index} className="shadow-md border border-gray-200 rounded-xl p-6">
                <h2 className="font-bold text-2xl">{camp.title}</h2>
                <p>{camp.description}</p>
                <p>
                  Collected: {camp.collected.toString()} / Target: {camp.target.toString()}
                </p>
                <p>Status: {Object.keys(camp.status)[0]}</p>
                <NavLink
                  to={`/campaign/${camp.id}`}
                  className="mt-2 inline-block rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-400">
                  View Details
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
