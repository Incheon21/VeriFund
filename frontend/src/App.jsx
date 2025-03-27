import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function About() {
  return <h1>About Page</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
