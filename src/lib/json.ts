import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function generateJson(fileContent: string): Promise<string> {
  try {
    const systemPrompt =
      "Bạn là một chuyên gia tạo metadata cho file. Nhiệm vụ của bạn là tạo một mô tả ngắn gọn cho nội dung của file được cung cấp. Mô tả này sẽ được sử dụng để hiểu nội dung của file mà không cần mở nó. Hãy chắc chắn rằng mô tả này có thể được sử dụng để tìm kiếm và phân loại file một cách hiệu quả. Lưu ý: format trả lời là 1 đoạn miêu tả liên tục, không xuống dòng.";
    const userPromptPrefix =
      "Hãy tạo metadata cho file này. Lưu ý: luôn luôn phải tạo được mô tả nội dung. Đây là nội dung file: \n";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `${userPromptPrefix}${fileContent}`,
        },
      ],
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content?.trim() || "null";
  } catch (error) {
    console.error(">>>>>>>>>> Error generating metadata:", error);
    return "null";
  }
}
