import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

import { get_encoding } from "tiktoken";

const MAX_TOTAL_TOKENS = 10000;
const MAX_COMPLETION_TOKENS = 6000;
const MAX_PROMPT_TOKENS = MAX_TOTAL_TOKENS - MAX_COMPLETION_TOKENS;

export async function generateJson(fileContent: string): Promise<string> {
  try {
    const encoding = get_encoding("cl100k_base");
    const systemPrompt =
      "Bạn là một chuyên gia tạo metadata cho file. Nhiệm vụ của bạn là tạo một mô tả ngắn gọn cho nội dung của file được cung cấp. Mô tả này sẽ được sử dụng để hiểu nội dung của file mà không cần mở nó. Hãy chắc chắn rằng mô tả này có thể được sử dụng để tìm kiếm và phân loại file một cách hiệu quả. Lưu ý: format trả lời là 1 đoạn miêu tả liên tục, không xuống dòng.";
    const userPromptPrefix =
      "Hãy tạo metadata cho file này. Lưu ý: luôn luôn phải tạo được mô tả nội dung. Đây là nội dung file: \n";
    const systemTokens = encoding.encode(systemPrompt).length;
    const prefixTokens = encoding.encode(userPromptPrefix).length;
    const availableTokensForFile =
      MAX_PROMPT_TOKENS - systemTokens - prefixTokens;
    const fileTokens = encoding.encode(fileContent);
    let trimmedFileContent: string;
    if (fileTokens.length > availableTokensForFile) {
      const trimmedTokens = fileTokens.slice(0, availableTokensForFile);
      trimmedFileContent = new TextDecoder().decode(
        encoding.decode(trimmedTokens)
      );
    } else {
      trimmedFileContent = fileContent;
    }
    encoding.free();
    console.error(">>>>>>>>>> Token metadata:", trimmedFileContent.length);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `${userPromptPrefix}${trimmedFileContent}`,
        },
      ],
      max_tokens: MAX_COMPLETION_TOKENS,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content?.trim() || "null";
  } catch (error) {
    console.error(">>>>>>>>>> Error generating metadata:", error);
    return "null";
  }
}
