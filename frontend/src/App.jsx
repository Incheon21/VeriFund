import Home from "./pages/Home";
import Profile from "./pages/Profile.jsx";
import Explore from "./pages/Explore.jsx";
import CampaignDetails from "./pages/campaign/CampaignDetails.jsx";
import Auditors from "./pages/Auditors.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { AuthProvider } from "./utils/auth.jsx";
import { useState } from "react";

export default function App() {
  const [route, setRoute] = useState("/");

  return (
    <AuthProvider>
      <div className="flex flex-col w-full bg-white min-h-screen overflow-hidden">
        <div className="fixed top-0 left-0 w-128 h-128 bg-[#125fed] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 z-0"></div>

        <Navbar setRoute={setRoute} />
        <main className="relative flex-grow flex w-full items-center justify-center z-10">
          <>
            {route === "/" && <Home />}
            {route === "/profile" && <Profile />}
            {route === "/explore" && <Explore />}
            {route.startsWith("/campaign") && <CampaignDetails id={route.split("/")[2]} />}
            {route === "/auditors" && <Auditors />}
          </>
        </main>

        <div className="fixed bottom-0 right-0 w-128 h-128 bg-[#125fed] opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 z-0"></div>

        <Footer />
      </div>
    </AuthProvider>
  );
}
