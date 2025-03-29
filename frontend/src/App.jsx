import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Profile from "./pages/Profile.jsx";
import Explore from "./pages/Explore.jsx";
import CampaignDetails from "./pages/campaign/CampaignDetails.jsx";
import Auditors from "./pages/Auditors.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/campaign/:id" element={<CampaignDetails />} />
      <Route path="/auditors" element={<Auditors  />} />
    </Routes>
  );
}
