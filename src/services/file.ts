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
        // Don't set Content-Type header when sending FormData
        // Browser will automatically set the correct multipart/form-data with boundary
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      // Include credentials if needed for cookies
      credentials: "same-origin",
    });
    console.log("========= response", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed - Status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("========= data", data);

    // Format the response to match the format expected by the client code
    return {
      file_id: data.file_id || "",
      message: data.message || "File uploaded successfully",
    };
  } catch (error: any) {
    console.error("========= Error Upload File:", error);
    throw new Error(error instanceof Error ? error.message : "Upload failed");
  }
};

const getFileById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_FILE_BY_ID}/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed - Status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log("========= file data", data);

    // Format the response to match what the client code expects
    const fileData = data.data || data;
    return {
      ...fileData,
      file_content: fileData.content || fileData.file_content || "",
    };
  } catch (error: any) {
    console.error("========= Error Get File By Id:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get file"
    );
  }
};

export const FileService = {
  uploadFile,
  getFileById,
};
