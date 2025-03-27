import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "../index.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./utils/auth.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <div className="flex flex-col h-screen w-[100vw]">
        <Navbar />
        <main className="flex-grow">
          <App />
        </main>
      </div>
    </AuthProvider>
  </React.StrictMode>
);
