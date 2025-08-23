import { Label } from "@/components/ui/label";

interface Question {
  q_type: "MP" | "FB" | "MH" | "MF" | "TFNG";
  question?: string;
  choices?: string[];
  answers?: string[];
  start_passage?: string;
  end_passage?: string;
  // MH specific properties
  heading?: string;
  options?: string[];
  paragraph_id?: string;
  // MF specific properties
  feature?: string;
  // TFNG specific properties
  sentence?: string;
  // For MH, MF, TFNG - single answer
  answer?: string;
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
        <div className="col-span-12 mt-4">
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
                      : question.q_type === "FB"
                      ? "Điền vào chỗ trống"
                      : question.q_type === "MH"
                      ? "Matching Headings"
                      : question.q_type === "MF"
                      ? "Matching Features"
                      : "True/False/Not Given"}
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
                  ) : question.q_type === "FB" ? (
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
                  ) : question.q_type === "MH" ? (
                    <>
                      <p>
                        <strong>Heading:</strong>{" "}
                        {question.heading || "Chưa nhập"}
                      </p>
                      <p>
                        <strong>Paragraph ID:</strong>{" "}
                        {question.paragraph_id || "Chưa nhập"}
                      </p>
                      <p>
                        <strong>Options:</strong>{" "}
                        {question.options?.length ? (
                          <ul className="list-disc pl-5">
                            {question.options.map((option, i) => (
                              <li key={i}>
                                {option || "Chưa nhập"}{" "}
                                {question.answer === option && (
                                  <span className="text-green-600">
                                    (Đáp án đúng)
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "Chưa có options"
                        )}
                      </p>
                    </>
                  ) : question.q_type === "MF" ? (
                    <>
                      <p>
                        <strong>Feature:</strong>{" "}
                        {question.feature || "Chưa nhập"}
                      </p>
                      <p>
                        <strong>Options:</strong>{" "}
                        {question.options?.length ? (
                          <ul className="list-disc pl-5">
                            {question.options.map((option, i) => (
                              <li key={i}>
                                {option || "Chưa nhập"}{" "}
                                {question.answer === option && (
                                  <span className="text-green-600">
                                    (Đáp án đúng)
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "Chưa có options"
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Sentence:</strong>{" "}
                        {question.sentence || "Chưa nhập"}
                      </p>
                      <p>
                        <strong>Answer:</strong>{" "}
                        <span
                          className={`font-medium ${
                            question.answer === "TRUE"
                              ? "text-green-600"
                              : question.answer === "FALSE"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {question.answer || "Chưa chọn"}
                        </span>
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
