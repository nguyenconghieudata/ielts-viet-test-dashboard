import { API } from "@/utils/api";

const uploadFile = async (formData: any) => {
  try {
    // Create a new FormData with the structure expected by the external API
    const apiFormData = new FormData();

    // Get the file from the original FormData
    const file = formData.get("file");

    // Add file to the new FormData with the key expected by the API
    apiFormData.append("file", file);

    const response = await fetch(API.UPLOAD_FILE, {
      method: "POST",
      body: apiFormData,
      headers: {
        // Remove Content-Type header to let the browser set it correctly with the boundary for FormData
      },
    });

    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }

    const data = await response.json();

    // Format the response to match the format expected by the client code
    return {
      file_id: data.data?.id || data.id || "",
      message: data.message || "File uploaded successfully",
    };
  } catch (error: any) {
    console.error("========= Error Upload File:", error);
    return false;
  }
};

const getFileById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_FILE_BY_ID}/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();

    // Format the response to match what the client code expects
    const fileData = data.data || data;
    return {
      ...fileData,
      file_content: fileData.content || fileData.file_content || "",
    };
  } catch (error: any) {
    console.error("========= Error Get File By Id:", error);
    return false;
  }
};

export const FileService = {
  uploadFile,
  getFileById,
};
