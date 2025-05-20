import { API } from "@/utils/api";

const getAll = async () => {
  try {
    const response = await fetch(API.GET_ALL_USER, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("========= Error Get All Users:", error);
    return false;
  }
};

const createUser = async (payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(API.CREATE_USER, {
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
    console.error("========= Error Create User:", error);
    return false;
  }
};

const updateUser = async (id: any, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    console.log("check update kkk: " + JSON.stringify(payload));

    const response = await fetch(`${API.UPDATE_USER}/${id}`, {
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
    console.error("========= Error Update User:", error);
    return false;
  }
};

const deleteUser = async (id: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(`${API.DELETE_USER}/${id}`, {
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
    console.error("========= Error Delete User:", error);
    return false;
  }
};

const getUserById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_USER_BY_ID}/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error("========= Error Get User By Id:", error);
    return false;
  }
};

const getUserAnswerById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_USER_ANSWER_BY_ID}/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error("========= Error Get User By Id:", error);
    return false;
  }
};

export const UserService = {
  getAll,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getUserAnswerById,
};
