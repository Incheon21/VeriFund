import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "../index.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./utils/auth.jsx";
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col w-full h-fit min-h-screen">
          <Navbar />
          <main className="flex-grow flex w-full items-center justify-center mt-20">
            <App />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
