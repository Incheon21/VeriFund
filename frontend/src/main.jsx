import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "../index.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./utils/auth.jsx";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col h-screen w-[100vw] bg-white">
          <Navbar />
          <main className="flex-grow flex items-center justify-center pt-32">
            <App />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
