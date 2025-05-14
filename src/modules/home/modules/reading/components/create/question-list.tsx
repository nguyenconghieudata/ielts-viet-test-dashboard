import { Label } from "@/components/ui/label";

interface Question {
  q_type: "MP" | "FB";
  question?: string;
  choices?: string[];
  answers?: string[];
  start_passage?: string;
  end_passage?: string;
}

interface QuestionListProps {
  questions: Question[];
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
}

export function QuestionList({
  questions,
  onEdit,
  onDelete,
}: QuestionListProps) {
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
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium text-indigo-600">
                    Câu hỏi {index + 1}:{" "}
                    {question.q_type === "MP"
                      ? "Trắc nghiệm"
                      : "Điền vào chỗ trống"}
                  </h3>
                  {(onEdit || onDelete) && (
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(index)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Sửa
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(index)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  )}
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
                                {question.answers?.includes(choice) && (
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
