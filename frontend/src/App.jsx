import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Profile from "./pages/Profile.jsx";

function About() {
  return <h1>About Page</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
