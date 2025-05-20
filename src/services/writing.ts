import { API } from "@/utils/api";

const getAll = async () => {
  try {
    const response = await fetch(API.GET_ALL_WRITING, {
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
const getAllSubmit = async () => {
  try {
    const response = await fetch(API.GET_ALL_WRITING_SUBMISSIONS, {
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

const createWriting = async (payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(API.CREATE_WRITING, {
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

const updateWriting = async (id: any, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    console.log("check update kkk: " + JSON.stringify(payload));

    const response = await fetch(`${API.UPDATE_WRITING}/${id}?type=writing`, {
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

const deleteWriting = async (id: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(`${API.DELETE_WRITING}/${id}`, {
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

const getWritingById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_WRITING_PART_BY_ID}/${id}`, {
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

export const WritingService = {
  getAll,
  createWriting,
  updateWriting,
  deleteWriting,
  getWritingById,
  getAllSubmit,
};
