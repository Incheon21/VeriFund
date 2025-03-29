import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/auth";
import { Principal } from "@dfinity/principal";
import Alert from "../components/Alert";
import { backendActor } from "../utils/backend";

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
  const paginatedCampaigns = campaigns.slice((currentPageCampaigns - 1) * 2, currentPageCampaigns * 2);
  const paginatedDonations = donations.slice((currentPageDonations - 1) * 2, currentPageDonations * 2);

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
        setAlert({
          type: "success",
          message: "Campaign created successfully!",
        });
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
        const donationsData = await backendActor.getDonationsByUser(Principal.fromText(principal));
        setDonations(donationsData);
      } catch (error) {
        console.error("Error loading donations:", error);
        setAlert({ type: "error", message: "Error loading donations." });
      }
    }
  };

  async function handleCampaignFileUpload(campaignId, event) {
    const file = event.target.files[0];
    setAlert(null);

    if (!file) {
      setAlert({ type: "error", message: "Please select a file to upload." });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = new Uint8Array(e.target.result);
      const chunkSize = 1024 * 1024; // 1 MB chunks
      const totalChunks = Math.ceil(content.length / chunkSize);

      try {
        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, content.length);
          const chunk = content.slice(start, end);

          await backendActor.uploadCampaignFile(
            Principal.fromText(principal),
            campaignId,
            file.name,
            chunk,
            BigInt(i),
            file.type
          );
        }
        setAlert({
          type: "success",
          message: `File ${file.name} uploaded successfully!`,
        });
        loadCampaigns();
      } catch (error) {
        setAlert({
          type: "error",
          message: `Failed to upload ${file.name}: ${error.message}`,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  }

  async function handleCampaignFileDelete(campaignId, fileName) {
    if (window.confirm(`Are you sure you want to delete the file for this campaign?`)) {
    if (window.confirm(`Are you sure you want to delete the file for this campaign?`)) {
      try {
        const success = await backendActor.deleteCampaignFile(Principal.fromText(principal), campaignId, fileName);
        const success = await backendActor.deleteCampaignFile(Principal.fromText(principal), campaignId, fileName);
        if (success) {
          setAlert({ type: "success", message: "File deleted successfully!" });
          loadCampaigns();
        } else {
          setAlert({ type: "error", message: "Failed to delete file" });
        }
      } catch (error) {
        setAlert({
          type: "error",
          message: `Failed to delete file: ${error.message}`,
        });
      }
    }
  }

  async function handleCampaignFileDownload(campaignId, fileName) {
    try {
      const totalChunks = Number(await backendActor.getCampaignFileTotalChunks(campaignId));
      const totalChunks = Number(await backendActor.getCampaignFileTotalChunks(campaignId));
      console.log(totalChunks);
      const fileType = await backendActor.getCampaignFileType(campaignId);
      let chunks = [];

      for (let i = 0; i < totalChunks; i++) {
        const chunkBlob = await backendActor.getCampaignFileChunk(campaignId, i);
        const chunkBlob = await backendActor.getCampaignFileChunk(campaignId, i);
        if (chunkBlob) {
          chunks.push(chunkBlob[0]);
        } else {
          throw new Error(`Failed to retrieve chunk ${i}`);
        }
      }

      const data = new Blob(chunks, { type: fileType });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      setAlert({
        type: "success",
        message: `File ${fileName} downloaded successfully!`,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: `Failed to download ${fileName}: ${error.message}`,
      });
    }
  }

  useEffect(() => {
    loadCampaigns();
    console.log(campaigns);
    loadDonations();
  }, [principal]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 mt-6">
      <main className="container mx-auto px-6 py-8">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">👤 Profile</h2>
            <p className="bg-gray-100 rounded-md p-3 text-gray-600 font-mono">{principal}</p>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">👤 Profile</h2>
            <p className="bg-gray-100 rounded-md p-3 text-gray-600 font-mono">{principal}</p>

            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-4">🎯 Create a New Campaign</h3>
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
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                🚀 Create Campaign
              </button>
            </form>
          </section>

          <section className="space-y-8">
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📢 My Campaigns</h2>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📢 My Campaigns</h2>
              {campaigns.length === 0 ? (
                <p className="text-gray-500">No campaigns available.</p>
              ) : (
                <>
                  <ul>
                    {paginatedCampaigns.map((camp, index) => (
                      <li key={index} className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md mb-4">
                      <li key={index} className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md mb-4">
                        <p className="text-lg font-semibold">{camp.title}</p>
                        <p className="text-gray-600">{camp.description}</p>
                        <p className="text-sm text-gray-500">
                          <strong>Collected:</strong> {camp.collected.toString()} / {camp.target.toString()} ICP
                          <strong>Collected:</strong> {camp.collected.toString()} / {camp.target.toString()} ICP
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Date:</strong> {new Date(Number(camp.date) / 1_000_000).toLocaleDateString()}
                          <strong>Date:</strong> {new Date(Number(camp.date) / 1_000_000).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Status:</strong> {Object.keys(camp.status)[0]}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Owner:</strong> {camp.owner.toText()}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Proof:</strong> {camp.file?.[0]?.name ? camp.file[0].name : "no proof"}
                          <strong>Proof:</strong> {camp.file?.[0]?.name ? camp.file[0].name : "no proof"}
                        </p>
                        <div className="mt-4 flex items-center space-x-4">
                          <input
                            type="file"
                            onChange={(e) => handleCampaignFileUpload(camp.id, e)}
                            onChange={(e) => handleCampaignFileUpload(camp.id, e)}
                            className="text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                          />

                          {camp.file && (
                            <>
                              <button
                                onClick={() => handleCampaignFileDownload(camp.id, camp.file[0].name)}
                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600">
                                onClick={() => handleCampaignFileDownload(camp.id, camp.file[0].name)}
                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600">
                                Download File
                              </button>
                              <button
                                onClick={() => handleCampaignFileDelete(camp.id, camp.file[0].name)}
                                className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600">
                                onClick={() => handleCampaignFileDelete(camp.id, camp.file[0].name)}
                                className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600">
                                Delete File
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {campaigns.length > 2 && (
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => {
                          if (currentPageCampaigns > 1) setCurrentPageCampaigns(currentPageCampaigns - 1);
                        }}
                        disabled={currentPageCampaigns === 1}
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        Prev
                      </button>
                      <span>
                        Page {currentPageCampaigns} of {totalPagesCampaigns}
                      </span>
                      <button
                        onClick={() => {
                          if (currentPageCampaigns < totalPagesCampaigns) setCurrentPageCampaigns(currentPageCampaigns + 1);
                        }}
                        disabled={currentPageCampaigns === totalPagesCampaigns}
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">💰 My Donations</h2>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">💰 My Donations</h2>
              {donations.length === 0 ? (
                <p className="text-gray-500">No donations found for your account.</p>
                <p className="text-gray-500">No donations found for your account.</p>
              ) : (
                <>
                  <ul>
                    {paginatedDonations.map((don, index) => (
                      <li key={index} className="bg-gray-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md mb-4">
                      <li key={index} className="bg-gray-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Amount:</strong> {don.amount.toString()} ICP
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Timestamp:</strong> {new Date(Number(don.timestamp) / 1_000_000).toLocaleString()}
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
                        onClick={() => {
                          if (currentPageDonations > 1) setCurrentPageDonations(currentPageDonations - 1);
                        }}
                        disabled={currentPageDonations === 1}
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        Prev
                      </button>
                      <span>
                        Page {currentPageDonations} of {totalPagesDonations}
                      </span>
                      <button
                        onClick={() => {
                          if (currentPageDonations < totalPagesDonations) setCurrentPageDonations(currentPageDonations + 1);
                        }}
                        disabled={currentPageDonations === totalPagesDonations}
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
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
