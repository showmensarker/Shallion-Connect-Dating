"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export default function TestPage() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    apiClient
      .get("/api/test/")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Connection failed");
      });
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>Frontend + Backend Test</h1>
      <p>{message}</p>
    </main>
  );
}