import React from "react";
import { useAuth } from "../utils/auth.jsx";

// Reusable button component
const Button = ({ onClick, children, className }) => (
  <button onClick={onClick} className={`bg-[#12A3ED] hover:bg-[#1292ed] text-white font-bold py-2 px-4 rounded-lg ${className}`}>
    {children}
  </button>
);

const Home = () => {
  const { isAuthenticated, principal, whoami } = useAuth();

  return (
    <div className="w-full max-w-full flex h-full flex-col items-center">
      <section className="w-full h-[650px] max-h-[650px] flex justify-center relative">
        <div className="w-full h-full absolute top-0 left-0">
          <div className="w-full h-full relative">
            <img src="/home.png" alt="CisliNinja Platform Banner" className="w-full h-full object-cover" />
            <div className="bg-gradient-to-t from-black to-black/0 via-black/60 absolute top-0 left-0 w-full h-full" />
          </div>
        </div>
        <div className="relative w-full h-full max-w-[1000px] mx-auto flex flex-col items-end justify-end gap-2 py-10 px-4">
          <h1 className="text-6xl font-bold tracking-widest relative">VeriFund</h1>
          <p className="">Empower Your Event, Amplify Your Cause</p>
        </div>
      </section>
      <section className="w-full flex justify-center min-h-fit py-10 bg-[#080808]">
        <div className="flex max-w-[1000px] mx-auto flex-col">
          <h2 className="text-2xl font-bold mb-4">Who Are You?</h2>
          <div className="p-4 mb-4 rounded-md">
            <div>
              <p className="mb-2">
                <i className="fas fa-info-circle"></i> A <strong>principal</strong> is a unique identifier in the Internet
                Computer ecosystem.
              </p>
              <p className="mb-2">
                It represents an entity (user, canister smart contract, or other) and is used for identification and authorization
                purposes.
              </p>
              <p className="mb-2">
                In this example, click "Whoami" to find out the principal ID with which you're interacting with the backend. If
                you're not signed in, you will see that you're using the so-called anonymous principal, "2vxsx-fae".
              </p>
              <p className="mb-2">
                After you've logged in with Internet Identity, you'll see a longer principal, which is unique to your identity and
                the dapp you're using.
              </p>
            </div>
          </div>

          <Button onClick={whoami} className="mb-4">
            Whoami
          </Button>

          {principal && (
            <div className="mt-4">
              <h3 className="text-xl font-bold">Your principal ID is:</h3>
              <p className="text-lg p-2 mt-2 rounded break-all">{principal}</p>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-bold">Authentication Status:</h3>
            <p>{isAuthenticated ? "Logged In" : "Not Logged In"}</p>
          </div>
        </div>
      </section>

      <section id="about-section" className="flex justify-center w-full py-10 bg-[#080808]">
        <div className="about-section  py-20 w-full max-w-[1000px] flex flex-col items-center gap-10 px-6">
          <h2 className="text-4xl font-bold">About VeriFund</h2>
          <div className="w-full flex flex-col">
            <p>
              <span className="font-bold">VeriFund</span> is a decentralized, trustless platform built to revolutionize how people
              give. Powered by the Internet Computer, VeriFund allows anyone to create or contribute to donation campaigns with
              transparency, verifiability, and global accessibility.
            </p>
            <p>
              Every donation is stored on-chain, publicly auditable, and protected by smart contract rules — ensuring that funds
              are not only received, but responsibly used. With a unique proof-of-donation and proof-of-usage model, VeriFund
              builds a culture of accountability without compromise.
            </p>
          </div>
          <div className="w-full flex flex-col">
            <h3 className="text-2xl">Vision</h3>
            <p>
              To create a borderless, trustless, and transparent giving ecosystem where every donation is secure, verifiable, and
              meaningful.
            </p>
          </div>
          <div className="w-full flex flex-col">
            <h3 className="text-2xl">Mission</h3>
            <p>1. Make donations verifiable</p>
            <p>2. Break down global donation barriers</p>
            <p>3. Establish trust through blockchain technology</p>
            <p>4. Reward responsible fundraisers and auditors</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
