const BASE_URL = "https://api.farmcode.io.vn/v1";
// const BASE_URL = 'http://localhost:8000/api/v1';

export const API = {
  // PRODUCT
  GET_ALL_PRODUCTS: `${BASE_URL}/inanhtructuyen/product`,
  CREATE_PRODUCT: `${BASE_URL}/inanhtructuyen/product`,
  UPDATE_PRODUCT: `${BASE_URL}/inanhtructuyen/product`,
  DELETE_PRODUCT: `${BASE_URL}/inanhtructuyen/product`,
  // BLOG
  GET_ALL_BLOGS: `${BASE_URL}/inanhtructuyen/blog`,
  CREATE_BLOG: `${BASE_URL}/inanhtructuyen/blog`,
  UPDATE_BLOG: `${BASE_URL}/inanhtructuyen/blog`,
  DELETE_BLOG: `${BASE_URL}/inanhtructuyen/blog`,
  // ACCOUNT
  GET_ALL_ACCOUNTS: `${BASE_URL}/inanhtructuyen/account/`,
  // ORDER
  GET_ALL_ORDERS: `${BASE_URL}/inanhtructuyen/order`,
  UPDATE_ORDER: `${BASE_URL}/inanhtructuyen/order`,
  DOWNLOAD_IMAGE: `${BASE_URL}/inanhtructuyen/download`,

  //READING
  GET_ALL_READING: `${BASE_URL}/ielts-viet/test/skill?type=reading`,
  GET_READING_PART_BY_ID: `${BASE_URL}/ielts-viet/test/skill`,

  //LATEST
  GET_ALL_LATEST: `${BASE_URL}/ielts-viet/test/skill`,

  //LISTENING
  GET_ALL_LISTENING: `${BASE_URL}/ielts-viet/test/skill?type=listening`,
  GET_LISTENING_PART_BY_ID: `${BASE_URL}/ielts-viet/test/skill`,

  //WRITING
  GET_ALL_WRITING: `${BASE_URL}/ielts-viet/test/skill?type=writing`,
  GET_WRITING_PART_BY_ID: `${BASE_URL}/ielts-viet/test/skill`,

  //FULLTEST
  GET_ALL_FULLTEST: `${BASE_URL}/ielts-viet/test`,
  GET_FULL_TEST_BY_ID: `${BASE_URL}/ielts-viet/test`,

  //GET QUESTIONS
  GET_QUESTIONS: `${BASE_URL}/ielts-viet/test/part`,
};
