import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import Alert from "../../components/Alert";
import { getFormattedDate } from "../../utils/date";
import { backendActor } from "../../utils/backend";

export default function CampaignDetails() {
  const { id } = useParams(); // Get the campaign ID from the URL
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [alert, setAlert] = useState(null);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-xl">Loading campaign details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 w-full px-6 py-8">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
        <p className="text-gray-700 mb-6">{campaign.description}</p>
        <div className="mb-4 space-y-2">
          <p className="text-lg">
            <strong>Target:</strong> {campaign.target.toString()} ICP
          </p>
          <p className="text-lg">
            <strong>Collected:</strong> {campaign.collected.toString()} ICP
          </p>
          <p className="text-lg">
            <strong>Status:</strong> {Object.keys(campaign.status)[0]}
          </p>
          <p className="text-lg">
            <strong>Date:</strong> {getFormattedDate(campaign.date)}
          </p>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Donations</h2>
        {donations.length === 0 ? (
          <p className="text-gray-500">No donations yet.</p>
        ) : (
          <ul className="space-y-4">
            {donations.map((donation, index) => (
              <li key={index} className="bg-gray-50 border-l-4 border-green-500 p-4 rounded shadow">
                <p className="text-sm text-gray-700">
                  <strong>Donor:</strong> {donation.donor.toText()}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Amount:</strong> {donation.amount.toString()} ICP
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Timestamp:</strong> {getFormattedDate(donation.timestamp)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
