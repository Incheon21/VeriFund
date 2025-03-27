import { MemoryRouter, Routes, Route, useNavigate } from "react-router";
import Home from "./pages/Home";

function About() {
  return <h1>About Page</h1>;
}

export default function App() {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </MemoryRouter>
  );
}
