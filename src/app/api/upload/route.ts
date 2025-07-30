import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { generateJson } from "@/lib/json";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

interface PDFPageContent {
  page_number: number;
  content: string;
  word_count: number;
  character_count: number;
}

async function extractPDFContent(fileBuffer: ArrayBuffer): Promise<{
  content: string;
  pages: PDFPageContent[];
}> {
  try {
    const buffer = Buffer.from(fileBuffer);
    // const blob = new Blob([buffer], { type: "application/pdf" });
    const blob = new Blob([fileBuffer], { type: "application/pdf" });
    const loader = new PDFLoader(blob as any);
    const docs = await loader.load();
    const pages: PDFPageContent[] = docs.map((doc, index) => {
      const content = doc.pageContent.trim();
      return {
        page_number: doc.metadata.page || index + 1,
        content,
        word_count: content.split(/\s+/).filter((word) => word.length > 0)
          .length,
        character_count: content.length,
      };
    });
    const fullContent = pages.map((page) => page.content).join("\n\n");
    console.log(
      `>>>>>>>>>> PDF processed: ${pages.length} pages, ${fullContent.length} characters`
    );
    return {
      content: fullContent,
      pages,
    };
  } catch (langchainError) {
    console.log(`>>>>>>>>>> langchainError <<<<<<<<<<`);
    return {
      content: "",
      pages: [],
    };
  }
}

function validatePDFFile(fileType: string): boolean {
  return fileType === "application/pdf";
}

// Add this OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    console.log("========= file", file);

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
    const fileBuffer = await file.arrayBuffer();
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;
    if (!validatePDFFile(fileType)) {
      return new Response(
        JSON.stringify({
          error: "Invalid file type. Only PDF files are allowed",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }
    const { content, pages } = await extractPDFContent(fileBuffer);
    if (!content || pages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Unable to extract content from PDF file",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }
    const fileJson = await generateJson(content);
    const documentData = {
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      file_metadata: fileJson,
      file_content: content,
      pages,
      total_pages: pages.length,
      created_at: new Date(),
    };
    const filesCollection = await getCollection("ieltsviet_files");
    const result = await filesCollection.insertOne(documentData);
    const fileId = result.insertedId.toString();
    const responseData = {
      message: "PDF uploaded and processed successfully",
      file_id: fileId,
    };
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error(">>>>>>>>>> PDF Upload Error:", error);
    return new Response(
      JSON.stringify({
        error: "PDF upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}
