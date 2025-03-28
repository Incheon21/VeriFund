import React, { useEffect, useState } from "react";
import { createActor } from "declarations/backend";
import { canisterId } from "declarations/backend/index.js";
import { useAuth } from "../utils/auth";
import { Principal } from "@dfinity/principal";
import Alert from "../components/Alert";

const backendActor = createActor(canisterId, {
  agentOptions: {
    host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
  },
});

export default function Profile() {
  const { principal } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    date: "",
  });
  const [alert, setAlert] = useState(null);
  const [currentPageCampaigns, setCurrentPageCampaigns] = useState(1);
  const [currentPageDonations, setCurrentPageDonations] = useState(1);

  const totalPagesCampaigns = Math.ceil(campaigns.length / 2);
  const totalPagesDonations = Math.ceil(donations.length / 2);
  const paginatedCampaigns = campaigns.slice((currentPageCampaigns - 1) * 2, currentPageCampaigns * 2);
  const paginatedDonations = donations.slice((currentPageDonations - 1) * 2, currentPageDonations * 2);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrevPageCampaigns = () => {
    if (currentPageCampaigns > 1) setCurrentPageCampaigns(currentPageCampaigns - 1);
  };
  const handleNextPageCampaigns = () => {
    if (currentPageCampaigns < totalPagesCampaigns) setCurrentPageCampaigns(currentPageCampaigns + 1);
  };
  const handlePrevPageDonations = () => {
    if (currentPageDonations > 1) setCurrentPageDonations(currentPageDonations - 1);
  };
  const handleNextPageDonations = () => {
    if (currentPageDonations < totalPagesDonations) setCurrentPageDonations(currentPageDonations + 1);
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
        setAlert({ type: "success", message: "Campaign created successfully!" });
        setFormData({ title: "", description: "", target: "", date: "" });
        loadCampaigns();
        loadDonations();
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      setAlert({ type: "error", message: "Error creating campaign." });
    }
  };

  const loadCampaigns = async () => {
    if (principal) {
      try {
        const campaignsData = await backendActor.getCampaignsByUser(Principal.fromText(principal));
        setCampaigns(campaignsData);
      } catch (error) {
        console.error("Error loading campaigns:", error);
        setAlert({ type: "error", message: "Error loading campaigns." });
      }
    }
  };

  const loadDonations = async () => {
    if (principal) {
      try {
        const donationsData = await backendActor.getDonationsByUser(Principal.fromText(principal));
        setDonations(donationsData);
      } catch (error) {
        console.error("Error loading donations:", error);
        setAlert({ type: "error", message: "Error loading donations." });
      }
    }
  };

  useEffect(() => {
    loadCampaigns();
    loadDonations();
  }, [principal]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 mt-6">
      <main className="container mx-auto px-6 py-8">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">👤 Profile</h2>
            <p className="bg-gray-100 rounded-md p-3 text-gray-600 font-mono">{principal}</p>

            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-4">🎯 Create a New Campaign</h3>
            <form onSubmit={createCampaign} className="space-y-4">
              <div>
                <label className="block text-gray-600 font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Campaign title"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Campaign description"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium">Target (ICP)</label>
                  <input
                    type="number"
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="e.g., 1000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium">Target Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                🚀 Create Campaign
              </button>
            </form>
          </section>

          <section className="space-y-8">
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📢 My Campaigns</h2>
              {campaigns.length === 0 ? (
                <p className="text-gray-500">No campaigns available.</p>
              ) : (
                <>
                  <ul>
                    {paginatedCampaigns.map((camp, index) => (
                      <li key={index} className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md mb-4">
                        <p className="text-lg font-semibold">{camp.title}</p>
                        <p className="text-gray-600">{camp.description}</p>
                        <p className="text-sm text-gray-500">
                          <strong>Collected:</strong> {camp.collected.toString()} / {camp.target.toString()} ICP
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Date:</strong> {new Date(Number(camp.date) / 1_000_000).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Status:</strong> {Object.keys(camp.status)[0]}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Owner:</strong> {camp.owner.toText()}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {campaigns.length > 2 && (
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={handlePrevPageCampaigns}
                        disabled={currentPageCampaigns === 1}
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        ⬅️ Prev
                      </button>
                      <span>
                        Page {currentPageCampaigns} of {totalPagesCampaigns}
                      </span>
                      <button
                        onClick={handleNextPageCampaigns}
                        disabled={currentPageCampaigns === totalPagesCampaigns}
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        Next ➡️
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">💰 My Donations</h2>
              {donations.length === 0 ? (
                <p className="text-gray-500">No donations found for your account.</p>
              ) : (
                <>
                  <ul>
                    {paginatedDonations.map((don, index) => (
                      <li key={index} className="bg-gray-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Amount:</strong> {don.amount.toString()} ICP
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Timestamp:</strong> {new Date(Number(don.timestamp) / 1_000_000).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Donor:</strong> {don.donor.toText()}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {donations.length > 2 && (
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={handlePrevPageDonations}
                        disabled={currentPageDonations === 1}
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        Prev
                      </button>
                      <span>
                        Page {currentPageDonations} of {totalPagesDonations}
                      </span>
                      <button
                        onClick={handleNextPageDonations}
                        disabled={currentPageDonations === totalPagesDonations}
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
