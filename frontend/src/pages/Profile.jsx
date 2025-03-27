import React, { useState } from "react";
// Import the createActor helper and canisterId from your generated declarations
import { createActor } from "declarations/backend";
import { canisterId } from "declarations/backend/index.js";
import { useAuth } from "../utils/auth";

// Create the backend actor. Adjust the host if needed.
const backendActor = createActor(canisterId, {
  agentOptions: {
    host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
  },
});

export default function Profile() {
  // State for campaigns and the campaign creation form
  const { principal } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    target: "",
  });

  // Handler to update form fields
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    try {
      const success = await backendActor.createCampaign(
        formData.id,
        formData.title,
        formData.description,
        BigInt(formData.target)
      );
      if (success) {
        alert("Campaign created successfully!");
        setFormData({ id: "", title: "", description: "", target: "" });
        loadCampaigns(); // refresh list
      } else {
        alert("Campaign creation failed. It might already exist.");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Error creating campaign. See console for details.");
    }
  };

  // Load campaigns using getCampaigns() → (vec record {...})
  const loadCampaigns = async () => {
    try {
      const campaignsData = await backendActor.getCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      alert("Error loading campaigns.");
    }
  };

  // (Optional) Donate to a campaign using donate(text, nat) → (bool)
  const donateToCampaign = async (campaignId, amount) => {
    try {
      const result = await backendActor.donate(campaignId, BigInt(amount));
      if (result) {
        alert("Donation successful!");
        loadCampaigns();
      } else {
        alert("Donation failed.");
      }
    } catch (error) {
      console.error("Donation error:", error);
      alert("Error during donation.");
    }
  };

  return (
    <div className="min-h-screen w-[100vw] bg-white text-gray-800">
      <main className="container mx-auto px-4 flex flex-row gap-12">
        <section className="flex w-full flex-col h-full">
          <section className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-md shadow p-6 mb-8">
            <div className="flex items-center space-x-4">
              <p>{principal}</p>
            </div>
          </section>

          <section className="bg-white rounded-md shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
            <form onSubmit={createCampaign} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Campaign ID:</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter unique campaign id"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Campaign title"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description:</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Campaign description"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Target (in ICP):</label>
                <input
                  type="number"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 1000"
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-[#12A3ED] text-white rounded hover:bg-[#0d9b8c] transition">
                Create
              </button>
            </form>
          </section>
        </section>

        <section className="bg-white rounded-md shadow p-6 flex w-full flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Campaigns</h2>
            <button onClick={loadCampaigns} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition">
              Load Campaigns
            </button>
          </div>
          {campaigns.length === 0 ? (
            <p>No campaigns available. Click "Load Campaigns" to fetch data.</p>
          ) : (
            <ul>
              {campaigns.map((camp, index) => (
                <li key={index} className="mb-2 shadow-md border border-gray-200 rounded-xl p-6">
                  <p className="font-bold text-3xl">{camp.title}</p>
                  <p>{camp.description}</p>
                  <p>
                    Collected: {camp.collected.toString()} / Target: {camp.target.toString()}
                  </p>
                  <p>Status: {Object.keys(camp.status)[0]}</p>
                  <button
                    onClick={() => donateToCampaign(camp.id, 10)}
                    className="mt-2 inline-block rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-400">
                    Donate 10 ICP
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
