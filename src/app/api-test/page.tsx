"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ApiTestPage() {
  const [healthResult, setHealthResult] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testHealthEndpoint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setHealthResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setHealthResult(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const testUploadEndpoint = async () => {
    if (!selectedFile) {
      setUploadResult("Please select a file first");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      try {
        const data = JSON.parse(responseText);
        setUploadResult(JSON.stringify(data, null, 2));
      } catch (e) {
        // If response is not JSON, show the raw text
        setUploadResult(
          `Raw response (status ${response.status}): ${responseText}`
        );
      }
    } catch (error) {
      setUploadResult(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Health Check</h2>
        <Button
          onClick={testHealthEndpoint}
          disabled={isLoading}
          className="mb-4"
        >
          Test Health Endpoint
        </Button>
        {healthResult && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {healthResult}
          </pre>
        )}
      </div>

      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">File Upload</h2>
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-2 block"
            accept="application/pdf"
          />
          <Button
            onClick={testUploadEndpoint}
            disabled={isLoading || !selectedFile}
          >
            Test Upload Endpoint
          </Button>
        </div>
        {uploadResult && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {uploadResult}
          </pre>
        )}
      </div>
    </div>
  );
}
