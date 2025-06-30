import { API } from "@/utils/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let outputUrl = "";
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const payload = await request.json();
    const response = await fetch(
      "https://api.farmcode.io.vn/v1/ielts-viet/test/ask-chatgpt",
      {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const result = await response.json();
    outputUrl = result.data;
    return new Response(JSON.stringify({ outputUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("========= Error Create Reading File Ai:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
