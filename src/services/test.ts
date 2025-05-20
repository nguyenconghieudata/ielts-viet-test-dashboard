import { API } from "@/utils/api";

const updateReading = async (id: any, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API.UPDATE_TEST}/${id}?type=reading`, {
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

const updateListening = async (id: any, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API.UPDATE_TEST}/${id}?type=listening`, {
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

const updateWriting = async (id: any, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API.UPDATE_TEST}/${id}?type=writing`, {
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

export const TestService = {
  updateListening,
  updateWriting,
  updateReading,
};
