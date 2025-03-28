import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { createActor } from "declarations/backend";
import { canisterId } from "declarations/backend/index.js";
import Alert from "../../components/Alert";

const backendActor = createActor(canisterId, {
  agentOptions: {
    host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
  },
});

export default function CampaignDetails() {
  const { id } = useParams(); // Get the campaign ID from the URL
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [alert, setAlert] = useState(null);

  // Fetch campaign details
  const loadCampaignDetails = async () => {
    try {
      const campaigns = await backendActor.getCampaigns();
      const campaign = campaigns.find((camp) => camp.id === id);
      setCampaign(campaign);

      const donationsData = await backendActor.getDonationsByID(id);
      setDonations(donationsData);
    } catch (error) {
      console.error("Error loading campaign details:", error);
      setAlert({ type: "error", message: "Error loading campaign details." });
    }
  };

  useEffect(() => {
    loadCampaignDetails();
  }, [id]);

  if (!campaign) {
    return <p>Loading campaign details...</p>;
  }

  return (
    <div className="min-h-screen w-[100vw] bg-white text-gray-800">
      <main className="container mx-auto px-4 py-8">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
        <p className="mb-4">{campaign.description}</p>
        <p className="mb-4">
          <strong>Target:</strong> {campaign.target.toString()} ICP
        </p>
        <p className="mb-4">
          <strong>Collected:</strong> {campaign.collected.toString()} ICP
        </p>
        <p className="mb-4">
          <strong>Status:</strong> {Object.keys(campaign.status)[0]}
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">Donations</h2>
        {donations.length === 0 ? (
          <p>No donations yet.</p>
        ) : (
          <ul className="space-y-2">
            {donations.map((donation, index) => (
              <li key={index} className="border rounded p-4">
                <p>
                  <strong>Donor:</strong> {donation.donor.toText()}
                </p>
                <p>
                  <strong>Amount:</strong> {donation.amount.toString()} ICP
                </p>
                <p>
                  <strong>Timestamp:</strong> {new Date(Number(donation.timestamp / BigInt(1_000_000))).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
