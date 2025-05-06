import { API } from "@/utils/api";

const getQuestionsById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_QUESTIONS}/${id}`, {
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

export const QuestionsService = {
  getQuestionsById,
};
