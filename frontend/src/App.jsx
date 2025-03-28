import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Profile from "./pages/Profile.jsx";
import Explore from "./pages/Explore.jsx";
import CampaignDetails from "./pages/campaign/CampaignDetails.jsx";

function About() {
  return <h1>About Page</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/campaign/:id" element={<CampaignDetails />} />
    </Routes>
  );
}
