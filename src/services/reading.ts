import { API } from "@/utils/api";

const getAll = async () => {
  try {
    const response = await fetch(API.GET_ALL_READING, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("========= Error Get All Products:", error);
    return false;
  }
};

const createReading = async (payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(API.CREATE_READING, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    return true;
  } catch (error: any) {
    console.error("========= Error Create Product:", error);
    return false;
  }
};

const updateReading = async (id: any, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API.UPDATE_READING}/${id}`, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) {
      console.log("check create: failed", response.status);
      throw new Error(`Failed - Status: ${response.status}`);
    }
    console.log("check create: success", response.status);
    return true;
  } catch (error: any) {
    console.error("========= Error Update Product:", error);
    return false;
  }
};

const deleteReading = async (id: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(`${API.DELETE_READING}/${id}`, {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    return true;
  } catch (error: any) {
    console.error("========= Error Delete Product:", error);
    return false;
  }
};

const getReadingById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_READING_PART_BY_ID}/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error("========= Error Get Blog By Id:", error);
    return false;
  }
};

const createReadingFileAi = async (payload: any) => {
  try {
    let outputUrl = "";
    const myHeaders = new Headers();
    console.log("========= payload", payload);

    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(
      // `https://api.farmcode.io.vn/v1/ielts-viet/test/ask-chatgpt`,
      API.READING_FILE_AI,
      {
        method: "POST",
        headers: myHeaders,
        body: payload,
      }
    );
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("========= data", data);
    if (data) {
      outputUrl = data.outputUrl;
    }
    return outputUrl;
  } catch (error: any) {
    console.error("========= Error Create Reading File Ai:", error);
    return false;
  }
};

export const ReadingService = {
  getAll,
  createReading,
  updateReading,
  deleteReading,
  getReadingById,
  createReadingFileAi,
};
