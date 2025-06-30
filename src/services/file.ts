import { API } from "@/utils/api";

const uploadFile = async (formData: any) => {
  try {
    const response = await fetch(API.UPLOAD_FILE, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
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
    return data.data;
  } catch (error: any) {
    console.error("========= Error Get File By Id:", error);
    return false;
  }
};

export const FileService = {
  uploadFile,
  getFileById,
};
