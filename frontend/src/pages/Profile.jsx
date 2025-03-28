import React, { useEffect, useState } from "react";
// Import the createActor helper and canisterId from your generated declarations
import { createActor } from "declarations/backend";
import { canisterId } from "declarations/backend/index.js";
import { useAuth } from "../utils/auth";
import { Principal } from "@dfinity/principal";

// Create the backend actor. Adjust the host if needed.
const backendActor = createActor(canisterId, {
  agentOptions: {
    host:
      process.env.DFX_NETWORK === "ic"
        ? "https://ic0.app"
        : "http://localhost:4943",
  },
});

export default function Profile() {
  const { principal } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    date: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    try {
      const success = await backendActor.createCampaign(
        Principal.fromText(principal),
        formData.title,
        formData.description,
        BigInt(formData.target),
        BigInt(new Date(formData.date).getTime()) * 1_000_000n
      );
      if (success) {
        alert("Campaign created successfully!");
        setFormData({ title: "", description: "", target: "", date: "" });
        loadCampaigns();
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Error creating campaign. See console for details.");
    }
  };

  const loadCampaigns = async () => {
    try {
      const campaignsData = await backendActor.getCampaignsByUser(Principal.fromText(principal));
      setCampaigns(campaignsData);
      console.log(campaignsData);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      alert("Error loading campaigns.");
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [principal]);

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
                <label className="block font-semibold mb-1">
                  Target (in ICP):
                </label>
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
              <div>
                <label className="block font-semibold mb-1">Target Date:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#12A3ED] text-white rounded hover:bg-[#0d9b8c] transition"
              >
                Create
              </button>
            </form>
          </section>
        </section>

        <section className="bg-white rounded-md shadow p-6 flex w-full flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-4xl font-semibold">My Campaigns</h2>
          </div>
          {campaigns.length === 0 ? (
            <p>No campaigns available. Click "Load Campaigns" to fetch data.</p>
          ) : (
            <ul>
              {campaigns.map((camp, index) => (
                <li
                  key={index}
                  className="mb-2 shadow-md border border-gray-200 rounded-xl p-6"
                >
                  <p className="font-bold text-3xl">{camp.title}</p>
                  <p>{camp.description}</p>
                  <p>
                    Collected: {camp.collected.toString()} / Target:{" "}
                    {camp.target.toString()}
                  </p>
                  <p>Status: {Object.keys(camp.status)[0]}</p>
                  <p>Owner: {camp.owner.toText()}</p>
                  <p>
                    Date:{" "}
                    {new Date(Number(camp.date) / 1_000_000).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
