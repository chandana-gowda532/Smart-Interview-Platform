import React, { useEffect, useState } from "react";

function History() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/results")
      .then((res) => res.json())
      .then((data) => setResults(data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Interview History</h1>

      <table
        border="1"
        cellPadding="10"
        style={{
          margin: "auto",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Username</th>
            <th>Topic</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {results.map((item) => (
            <tr key={item.id}>
              <td>{item.username}</td>
              <td>{item.topic}</td>
              <td>{item.score}</td>
              <td>{item.interview_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;