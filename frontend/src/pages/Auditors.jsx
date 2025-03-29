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

export default function Auditors() {
  const { principal } = useAuth();
  const [stake, setStake] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState(null);
  
  const itemsPerPage = 3;
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const paginatedCampaigns = campaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Load stake amount and pending campaigns
  const loadData = async () => {
    if (!principal) return;
    
    setIsLoading(true);
    try {
      // Get user's stake and pending campaigns in parallel
      const [userStake, pendingCampaigns] = await Promise.all([
        backendActor.getMyStake(Principal.fromText(principal)),
        backendActor.getPendingReviewCampaigns(),
      ]);
      
      // Convert BigInt to Number for display
      setStake(Number(userStake));
      
      // Filter out campaigns the user owns
      const filteredCampaigns = pendingCampaigns.filter(
        campaign => campaign.owner.toText() !== principal
      );

      console.log("Filtered campaigns:", filteredCampaigns);
      
      setCampaigns(filteredCampaigns);
    } catch (error) {
      console.error("Error loading data:", error);
      setAlert({ type: "error", message: "Failed to load auditor data." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle staking tokens
  const handleStake = async (e) => {
    e.preventDefault();
    setAlert(null);
    
    if (!stakeAmount || parseInt(stakeAmount) <= 0) {
      return setAlert({ type: "error", message: "Please enter a valid stake amount." });
    }
    
    try {
      const result = await backendActor.stakeAsAuditor(Principal.fromText(principal),BigInt(stakeAmount));
      if (result) {
        setAlert({ type: "success", message: `Successfully staked ${stakeAmount} tokens!` });
        setStakeAmount("");
        
        // Update stake directly
        const newStake = await backendActor.getMyStake(Principal.fromText(principal));
        // Explicitly convert BigInt to Number
        setStake(Number(newStake));
      }
    } catch (error) {
      console.error("Error staking:", error);
      setAlert({ type: "error", message: "Failed to stake tokens." });
    }
  };

  // Download campaign file and select campaign for review
  const handleDownloadFile = async (campaign) => {
    if (!campaign.file) {
      return setAlert({ type: "error", message: "No file attached to this campaign." });
    }
    
    try {
      const totalChunks = Number(await backendActor.getCampaignFileTotalChunks(campaign.id));
      const fileType = await backendActor.getCampaignFileType(campaign.id);
      let chunks = [];

      for (let i = 0; i < totalChunks; i++) {
        const chunkBlob = await backendActor.getCampaignFileChunk(campaign.id, i);
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
      link.download = campaign.file.name;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      setAlert({
        type: "success",
        message: `File ${campaign.file.name} downloaded successfully!`
      });
    } catch (error) {
      console.error("File download error:", error);
      setAlert({ type: "error", message: "Failed to download campaign proof file." });
    }
  };

  // Handle auditor decision (approve/reject)
  const handleAuditorDecision = async (campaign, approve) => {
    if (!campaign) return;
    
    try {
      const result = await backendActor.releaseDecision(
        Principal.fromText(principal),
        campaign.id,
        approve
      );
      
      if (result) {
        setAlert({
          type: "success",
          message: approve 
            ? "Campaign approved successfully! Funds are released." 
            : "Campaign rejected. Campaign returned to active status."
        });
        
        // Reload campaigns
        loadData();
      } else {
        throw new Error("Decision couldn't be processed");
      }
    } catch (error) {
      console.error("Error making decision:", error);
      setAlert({ type: "error", message: "Failed to process your decision." });
    }
  };

  // Change page for pagination
  const changePage = (delta) => {
    setCurrentPage(prevPage => 
      Math.max(1, Math.min(totalPages, prevPage + delta))
    );
  };

  // Initial data load
  useEffect(() => {
    if (principal) loadData();
  }, [principal]);


  return (
    <div className="w-full text-gray-900 pt-6">
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🕵️‍♂️ Auditor Dashboard
        </h1>
        
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        
        {/* Stake section */}
        <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            🔐 Your Stake
          </h2>
          
          <div className="mb-6">
            <p className="text-lg mb-2">
              Current Stake: <span className="font-semibold">{stake} tokens</span>
            </p>
            
            {stake === 0 && (
              <p className="text-gray-600 italic mb-4">
                You need to stake tokens to become an auditor and review campaigns.
              </p>
            )}
            
            <form onSubmit={handleStake} className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-gray-600 font-medium mb-2">
                  Stake Amount
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={e => setStakeAmount(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Enter amount to stake"
                  min="1"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
              >
                Stake Tokens
              </button>
            </form>
          </div>
        </section>
        
        {/* Campaigns section */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            📋 Campaigns Pending Review
          </h2>
          
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading campaigns...</p>
          ) : stake === 0 ? (
            <p className="text-gray-500 italic">
              You must stake tokens before reviewing campaigns.
            </p>
          ) : campaigns.length === 0 ? (
            <p className="text-gray-500 italic">
              No campaigns are currently pending for review.
            </p>
          ) : (
            <>
              <ul className="space-y-6">
                {paginatedCampaigns.map(campaign => (
                  <li
                    key={campaign.id}
                    className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{campaign.title}</h3>
                      <div className="text-sm font-medium text-gray-500">
                        {new Date(Number(campaign.date) / 1_000_000).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{campaign.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <strong>Target Amount:</strong> {campaign.target.toString()} ICP
                      </div>
                      <div>
                        <strong>Collected:</strong> {campaign.collected.toString()} ICP
                        {Number(campaign.collected) >= Number(campaign.target) && (
                          <span className="ml-2 text-green-600 font-semibold">✓ Target reached</span>
                        )}
                      </div>
                      <div>
                        <strong>Status:</strong> {Object.keys(campaign.status)[0].replace("_", " ")}
                      </div>
                      <div>
                        <strong>Owner:</strong>{" "}
                        <span className="font-mono text-xs">
                          {campaign.owner.toText().substring(0, 15)}...
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-200">
                      {campaign.file ? (
                        <button 
                          onClick={() => handleDownloadFile(campaign)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                        >
                          📥 Download Proof
                        </button>
                      ) : (
                        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                          ⚠️ No proof attached
                        </div>
                      )}
                      
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={() => handleAuditorDecision(campaign, false)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                        >
                          ❌ Reject
                        </button>
                        <button
                          onClick={() => handleAuditorDecision(campaign, true)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                        >
                          ✅ Approve
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Pagination controls */}
              {campaigns.length > itemsPerPage && (
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => changePage(-1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => changePage(1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}