import { API } from "@/utils/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let outputUrl = "";
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    // Parse the incoming request body
    const payload = await request.json();
    console.log(
      "Reading file AI request received with content length:",
      payload.content ? payload.content.length : "no content"
    );

    // Use the API constant instead of hardcoded URL
    console.log("Making request to:", API.READING_FILE_AI_PROCESS);
    const response = await fetch(API.READING_FILE_AI_PROCESS, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      return new Response(
        JSON.stringify({
          error: `API Error: ${response.status}`,
          details: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process successful response
    const result = await response.json();
    console.log("API response received:", result);

    if (!result || !result.data) {
      return new Response(
        JSON.stringify({ error: "Invalid response from AI service" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    outputUrl = result.data;
    return new Response(JSON.stringify({ outputUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("========= Error in reading-file-ai route:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
