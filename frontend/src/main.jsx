import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "../index.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./utils/auth.jsx";
import { BrowserRouter } from "react-router";
import Footer from "./components/Footer.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col w-full bg-white min-h-screen overflow-hidden">
          <div className="fixed top-0 left-0 w-128 h-128 bg-[#125fed] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 z-0"></div>

          <Navbar />
          <main className="relative flex-grow flex w-full items-center justify-center z-10">
            <App />
          </main>

          <div className="fixed bottom-0 right-0 w-128 h-128 bg-[#125fed] opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 z-0"></div>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
