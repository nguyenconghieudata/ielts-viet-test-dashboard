import { Label } from "@/components/ui/label";

interface Question {
  q_type: "MP" | "FB";
  question?: string;
  choices?: string[];
  answers?: string[];
  answer?: string[];
  start_passage?: string;
  end_passage?: string;
}

interface QuestionListProps {
  questions: Question[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function QuestionList({
  questions,
  onEdit,
  onDelete,
}: QuestionListProps) {
  const getQuestionTypeLabel = (q_type: Question["q_type"]) => {
    switch (q_type) {
      case "MP":
        return "Trắc nghiệm";
      case "FB":
        return "Điền vào chỗ trống";
      default:
        return "Không xác định";
    }
  };

  return (
    <>
      {questions.length > 0 && (
        <div className="col-span-3 w-full mt-4">
          <Label className="text-lg font-semibold">Danh sách câu hỏi</Label>
          <div className="mt-2 space-y-4">
            {questions.map((question, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium text-indigo-600">
                    Câu hỏi {index + 1}: {getQuestionTypeLabel(question.q_type)}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onEdit(index);
                        console.log("Edit question at index:", index);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(index)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {question.q_type === "MP" ? (
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
                              <li key={i}>
                                {choice || "Chưa nhập"}{" "}
                                {question.answer?.includes(choice) && (
                                  <span className="text-green-600">
                                    (Đáp án đúng)
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "Chưa có lựa chọn"
                        )}
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
                        {question.answer?.length
                          ? question.answer.join(", ")
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
