const BASE_URL = "https://api.farmcode.io.vn/v1";
// const BASE_URL = 'http://localhost:8000/api/v1';

// Determine if we're in a production environment
// const isProduction = process.env.NODE_ENV === "production";
// const APP_URL = isProduction ? "https://portal.ieltsviet.edu.vn" : "";

export const API = {
  // ACCOUNT
  GET_ALL_ACCOUNTS: `${BASE_URL}/ielts-viet/account/`,

  //READING
  GET_ALL_READING: `${BASE_URL}/ielts-viet/test/skill?type=reading`,
  GET_READING_PART_BY_ID: `${BASE_URL}/ielts-viet/test/skill`,
  CREATE_READING: `${BASE_URL}/ielts-viet/test/skill`,
  UPDATE_READING: `${BASE_URL}/ielts-viet/test/skill`,
  DELETE_READING: `${BASE_URL}/ielts-viet/test/skill`,

  //LATEST
  GET_ALL_LATEST: `${BASE_URL}/ielts-viet/test/skill`,

  //LISTENING
  GET_ALL_LISTENING: `${BASE_URL}/ielts-viet/test/skill?type=listening`,
  GET_LISTENING_PART_BY_ID: `${BASE_URL}/ielts-viet/test/skill`,
  UPDATE_LISTENING: `${BASE_URL}/ielts-viet/test/skill`,
  CREATE_LISTENING: `${BASE_URL}/ielts-viet/test/skill`,
  DELETE_LISTENING: `${BASE_URL}/ielts-viet/test/skill`,

  //WRITING
  GET_ALL_WRITING: `${BASE_URL}/ielts-viet/test/skill?type=writing`,
  GET_WRITING_PART_BY_ID: `${BASE_URL}/ielts-viet/test/skill`,
  UPDATE_WRITING: `${BASE_URL}/ielts-viet/test/skill`,
  CREATE_WRITING: `${BASE_URL}/ielts-viet/test/skill`,
  DELETE_WRITING: `${BASE_URL}/ielts-viet/test/skill`,
  GET_ALL_WRITING_SUBMISSIONS: `${BASE_URL}/ielts-viet/test/writing-answer`,
  SEND_EMAIL_WRITING: `${BASE_URL}/ielts-viet/send-email`,

  //FULLTEST
  GET_ALL_FULLTEST: `${BASE_URL}/ielts-viet/test`,
  GET_FULL_TEST_BY_ID: `${BASE_URL}/ielts-viet/test`,
  UPDATE_FULL_TEST: `${BASE_URL}/ielts-viet/test`,
  CREATE_FULL_TEST: `${BASE_URL}/ielts-viet/test`,
  DELETE_FULL_TEST: `${BASE_URL}/ielts-viet/test`,

  //TEST
  UPDATE_TEST: `${BASE_URL}/ielts-viet/test/skill`,

  //GET QUESTIONS
  GET_QUESTIONS: `${BASE_URL}/ielts-viet/test/part`,

  //USER
  GET_ALL_USER: `${BASE_URL}/ielts-viet/user/`,
  GET_USER_BY_ID: `${BASE_URL}/ielts-viet/user`,
  GET_USER_ANSWER_BY_ID: `${BASE_URL}/ielts-viet/test/user-answer`,
  UPDATE_USER: `${BASE_URL}/ielts-viet/user`,
  CREATE_USER: `${BASE_URL}/ielts-viet/user`,
  DELETE_USER: `${BASE_URL}/ielts-viet/user`,

  // FILE
  UPLOAD_FILE: "/api/upload",
  READING_FILE_AI: "/api/reading-file-ai",
  READING_FILE_AI_PROCESS: `${BASE_URL}/ielts-viet/test/ask-chatgpt`,
  GET_FILE_BY_ID: `${BASE_URL}/ielts-viet/file`,
};
