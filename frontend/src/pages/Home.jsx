import React, { useState } from "react";
import { useAuth } from "../utils/auth.jsx";

const Button = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow transition duration-300 ${className}`}>
    {children}
  </button>
);

const Home = () => {
  const { isAuthenticated, principal, whoami } = useAuth();

  return (
    <div className="w-full">
      <section className="w-full bg-gradient-to-r from-stone-200 to-stone-300 flex flex-col items-center py-16 text-center text-gray-800">
        <h1 className="text-5xl font-extrabold tracking-wide mb-6 drop-shadow-sm">VeriFund</h1>
        <p className="text-2xl font-light max-w-3xl mb-8 drop-shadow-sm">Empower Your Event, Amplify Your Cause</p>
        <div className="flex gap-6">
          <Button onClick={whoami}>Whoami</Button>
        </div>
      </section>

      <section className="w-full bg-amber-100 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Who Are You?</h2>
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-lg text-gray-700 mb-4">
              A <strong>principal</strong> is a unique identifier in the Internet Computer ecosystem. It represents an entity
              (user, canister smart contract, or other) used for identification and authorization.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Click "Whoami" to discover your principal ID. If you are not signed in, you'll see the anonymous principal,{" "}
              <span className="font-mono">2vxsx-fae</span>.
            </p>
            <p className="text-lg text-gray-700">
              After signing in with Internet Identity, you'll see a longer, unique principal ID specific to your identity and this
              dApp.
            </p>
          </div>
          {principal && (
            <div className="mt-6">
              <h3 className="text-2xl font-bold text-gray-800">Your Principal ID</h3>
              <p className="text-xl bg-gray-50 p-4 mt-2 rounded-md break-all text-gray-600">{principal}</p>
            </div>
          )}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800">Authentication Status</h3>
            <p className="text-lg text-gray-700">{isAuthenticated ? "Logged In" : "Not Logged In"}</p>
          </div>
        </div>
      </section>

      <section id="about-section" className="flex justify-center w-full bg-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-10">
          <h2 className="text-4xl font-bold text-gray-800 text-center">About VeriFund</h2>
          <div className="w-full flex flex-col">
            <p className="text-lg text-gray-700 leading-relaxed">
              <span className="font-bold">VeriFund</span> is a decentralized, trustless platform built to revolutionize how people
              give. Powered by the Internet Computer, VeriFund allows anyone to create or contribute to donation campaigns with
              transparency, verifiability, and global accessibility.
            </p>
            <p className="text-lg text-gray-700 mt-4 leading-relaxed">
              Every donation is stored on-chain, publicly auditable, and protected by smart contract rules — ensuring that funds
              are responsibly used. With a unique proof-of-donation and proof-of-usage model, VeriFund builds a culture of
              accountability without compromise.
            </p>
          </div>
          <div className="w-full flex flex-col">
            <h3 className="text-2xl font-bold text-gray-800">Vision</h3>
            <p className="text-lg text-gray-700 mt-2">
              To create a borderless, trustless, and transparent giving ecosystem where every donation is secure, verifiable, and
              meaningful.
            </p>
          </div>
          <div className="w-full flex flex-col">
            <h3 className="text-2xl font-bold text-gray-800">Mission</h3>
            <ul className="text-lg text-gray-700 list-disc list-inside mt-2 space-y-1">
              <li>Make donations verifiable</li>
              <li>Break down global donation barriers</li>
              <li>Establish trust through blockchain technology</li>
              <li>Reward responsible fundraisers and auditors</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;