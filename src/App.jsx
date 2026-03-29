import React, { useState } from "react";

export default function App() {
  const [response, setResponse] = useState("");
  const handlecliick = async () => {
    try {
      const res = await fetch(
        "https://api.prostriver.me/api/admin/health-check",
        {
          method: "GET",
        },
      );
      const data = await res.text();
      setResponse(data);
    } catch (error) {
      console.log("something wentt worng", error);
    }
  };

  return (
    <div className="bg-amber-300">
      <button
        className="p-4 bg-red-300 text-black"
        onClick={() => {
          handlecliick();
        }}
      >
        click me to test
      </button>
      <p>{response}</p>
    </div>
  );
}
