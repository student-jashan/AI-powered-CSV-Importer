"use client";

import { useState } from "react";
import api from "@/services/api";

export default function TestConnection() {
  const [message, setMessage] = useState("");

  const testAPI = async () => {
    console.log("Button clicked");

    try {
      const response = await api.get("/");

      console.log("SUCCESS");
      console.log(response);

      setMessage("✅ Backend Connected");
    } catch (error) {
      console.log("ERROR");

      console.log(error);

      console.log("Response:", error.response);

      console.log("Request:", error.request);

      console.log("Message:", error.message);

      setMessage("❌ Backend Not Connected");
    }
  };

  return (
    <div>
      <button
        onClick={testAPI}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Test Backend
      </button>

      <p className="mt-4">{message}</p>
    </div>
  );
}