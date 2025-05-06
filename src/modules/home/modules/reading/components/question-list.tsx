import { Label } from "@/components/ui/label";

interface Question {
  q_type: "multiple_choice" | "fill_in_the_blank";
  question?: string;
  choices?: string[];
  answers?: string[];
  start_passage?: string;
  end_passage?: string;
}

interface QuestionListProps {
  questions: Question[];
}

export function QuestionList({ questions }: QuestionListProps) {
  return (
    <>
      {questions.length > 0 && (
        <div className="col-span-3 mt-4">
          <Label className="text-lg font-semibold">Danh sách câu hỏi</Label>
          <div className="mt-2 space-y-4">
            {questions.map((question, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                <h3 className="text-md font-medium text-indigo-600">
                  Câu hỏi {index + 1}:{" "}
                  {question.q_type === "multiple_choice"
                    ? "Trắc nghiệm"
                    : "Điền vào chỗ trống"}
                </h3>
                <div className="mt-2 space-y-2">
                  {question.q_type === "multiple_choice" ? (
                    <>
                      <p>
                        <strong>Câu hỏi:</strong>{" "}
                        {question.question || "Chưa nhập"}
                      </p>
                      <p>
                        <strong>Lựa chọn:</strong>{" "}
                        {question.choices?.length ? (
                          <ul className="list-disc pl-5">
                            {question.choices.map((choice, i) => (
                              <li key={i}>{choice || "Chưa nhập"}</li>
                            ))}
                          </ul>
                        ) : (
                          "Chưa có lựa chọn"
                        )}
                      </p>
                      <p>
                        <strong>Đáp án:</strong>{" "}
                        {question.answers?.length
                          ? question.answers.join(", ")
                          : "Chưa có đáp án"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Đoạn đầu:</strong>{" "}
                        {question.start_passage || "Chưa nhập"}
                      </p>
                      <p>
                        <strong>Đoạn cuối:</strong>{" "}
                        {question.end_passage || "Chưa nhập"}
                      </p>
                      <p>
                        <strong>Đáp án:</strong>{" "}
                        {question.answers?.length
                          ? question.answers.join(", ")
                          : "Chưa có đáp án"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
