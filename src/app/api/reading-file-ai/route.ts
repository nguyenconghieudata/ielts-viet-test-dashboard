import { API } from "@/utils/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let outputUrl = "";
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(API.READING_FILE_AI_PROCESS, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(request.body),
      redirect: "follow",
    });
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
    return false;
  }
}
