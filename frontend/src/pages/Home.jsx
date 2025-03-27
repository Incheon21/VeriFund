import React from "react";
import { useAuth } from "../utils/auth.jsx";

// Reusable button component
const Button = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`bg-[#12A3ED] hover:bg-[#1292ed] text-white font-bold py-2 px-4 rounded-lg ${className}`}
  >
    {children}
  </button>
);

const Home = () => {
  const { isAuthenticated, principal, whoami } = useAuth();

  return (
    <div className="container w-[80%] flex flex-col items-center justify-center">
      <section className="relative flex w-full">
        <img
          src="/home.png"
          alt="CisliNinja Platform Banner"
          className="w-full h-auto rounded-lg shadow-md"
        />
        <div className="absolute bottom-0 right-0 text-center p-12">
          <h1 className="text-[48px] font-bold text-white mb-4">Empower Your Event, Amplify Your Cause</h1>
        </div>
      </section>
      <h1 className="text-2xl font-bold mb-4">Who Are You?</h1>
      <div className="bg-gray-100 p-4 mb-4 rounded-md">
        <div>
          <p className="mb-2">
            <i className="fas fa-info-circle"></i> A <strong>principal</strong>{" "}
            is a unique identifier in the Internet Computer ecosystem.
          </p>
          <p className="mb-2">
            It represents an entity (user, canister smart contract, or other)
            and is used for identification and authorization purposes.
          </p>
          <p className="mb-2">
            In this example, click "Whoami" to find out the principal ID with
            which you're interacting with the backend. If you're not signed in,
            you will see that you're using the so-called anonymous principal,
            "2vxsx-fae".
          </p>
          <p className="mb-2">
            After you've logged in with Internet Identity, you'll see a longer
            principal, which is unique to your identity and the dapp you're
            using.
          </p>
        </div>
      </div>

      <Button onClick={whoami} className="mb-4">
        Whoami
      </Button>

      {principal && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Your principal ID is:</h2>
          <h4 className="text-lg bg-gray-100 p-2 mt-2 rounded break-all">
            {principal}
          </h4>
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-bold">Authentication Status:</h3>
        <p>{isAuthenticated ? "Logged In" : "Not Logged In"}</p>
      </div>
    </div>
  );
};

export default Home;
