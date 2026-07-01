import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import History from "./History";

function Home() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>AI Smart Interview Platform</h1>

      <Link to="/history">
        <button>View Interview History</button>
      </Link>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/history" element={<History />} />
    </Routes>
  );
}

export default App;