"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader, Plus, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { QuestionList } from "./question-list";
import { UploadService } from "@/services/upload";

interface Question {
  _id: string;
  part_id: string;
  q_type: "MP" | "FB";
  question?: string;
  choices?: string[];
  answer?: string[];
  start_passage?: string;
  end_passage?: string;
}

interface PartDetails {
  _id: string;
  image: string;
  audio: string;
  part_num: number;
  question: Question[];
  tempQuestions: Question[];
  selectedQuestionType: "MP" | "FB" | null;
}

interface ModalUpdateListeningDetailProps {
  parts: PartDetails[];
  onPartsUpdate: (updatedParts: PartDetails[]) => void;
}

export function ModalUpdateListeningDetail({
  parts,
  onPartsUpdate,
}: ModalUpdateListeningDetailProps) {
  const { toast } = useToast();
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);

  const [activePart, setActivePart] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    _id: "",
    part_id: "",
    q_type: "MP",
    choices: [""],
    answer: [],
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

  const handleAudioUpload = useCallback(
    async (file: File, partNum: number) => {
      try {
        setIsAudioLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await UploadService.uploadAudioToCloudinary([
          file,
        ]);
        if (
          uploadResponse &&
          Array.isArray(uploadResponse) &&
          uploadResponse[0]
        ) {
          const audioUrl = uploadResponse[0]?.secure_url;
          const updatedParts = parts.map((part) =>
            part.part_num === partNum ? { ...part, audio: audioUrl } : part
          );
          onPartsUpdate(updatedParts);
          setIsAudioLoading(false);
          toast({
            title: "Audio uploaded successfully",
            description: `Audio file has been uploaded for Passage ${partNum}`,
          });
          return audioUrl;
        } else {
          toast({
            variant: "destructive",
            title: "Audio upload failed",
            description: "Failed to upload audio file",
          });
          return null;
        }
      } catch (error) {
        console.error("Audio upload failed:", error);
        toast({
          variant: "destructive",
          title: "Audio upload failed",
          description: "An error occurred while uploading the audio",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [parts, onPartsUpdate, toast]
  );

  const handleAudioFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an audio file",
        });
        return;
      }
      await handleAudioUpload(file, activePart);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  const validateCurrentQuestion = () => {
    const selectedQuestionType = parts.find(
      (part) => part.part_num === activePart
    )?.selectedQuestionType;
    if (!selectedQuestionType) {
      toast({ variant: "destructive", title: "Vui lòng chọn loại câu hỏi." });
      return false;
    }
    if (selectedQuestionType === "MP") {
      if (!currentQuestion.question?.trim()) {
        toast({
          variant: "destructive",
          title: "Vui lòng nhập câu hỏi trắc nghiệm.",
        });
        return false;
      }
      if (
        !currentQuestion.choices ||
        currentQuestion.choices.length < 2 ||
        currentQuestion.choices.some((c) => !c.trim())
      ) {
        toast({
          variant: "destructive",
          title: "Vui lòng thêm ít nhất 2 lựa chọn hợp lệ cho câu trắc nghiệm.",
        });
        return false;
      }
      if (!currentQuestion.answer || currentQuestion.answer.length === 0) {
        toast({
          variant: "destructive",
          title: "Vui lòng chọn ít nhất một đáp án đúng cho câu trắc nghiệm.",
        });
        return false;
      }
    } else if (selectedQuestionType === "FB") {
      if (
        !currentQuestion.start_passage?.trim() ||
        !currentQuestion.end_passage?.trim()
      ) {
        toast({
          variant: "destructive",
          title:
            "Vui lòng nhập đầy đủ đoạn đầu và đoạn cuối cho câu điền vào chỗ trống.",
        });
        return false;
      }
      if (
        !currentQuestion.answer ||
        currentQuestion.answer.length === 0 ||
        !currentQuestion.answer[0].trim()
      ) {
        toast({
          variant: "destructive",
          title: "Vui lòng nhập đáp án cho câu điền vào chỗ trống.",
        });
        return false;
      }
    }
    return true;
  };

  const handleAddChoice = () => {
    setCurrentQuestion({
      ...currentQuestion,
      choices: [...(currentQuestion.choices || []), ""],
    });
  };

  const handleChoiceChange = (index: number, value: string) => {
    const updatedChoices = [...(currentQuestion.choices || [])];
    updatedChoices[index] = value;
    setCurrentQuestion({ ...currentQuestion, choices: updatedChoices });
  };

  const handleRemoveChoice = (index: number) => {
    if (currentQuestion.choices && currentQuestion.choices.length > 1) {
      setCurrentQuestion({
        ...currentQuestion,
        choices: currentQuestion.choices.filter((_, i) => i !== index),
        answer: currentQuestion.answer?.filter((ans) =>
          currentQuestion.choices?.includes(ans)
        ),
      });
    }
  };

  const handleAnswerToggle = (choice: string) => {
    const currentAnswers = currentQuestion.answer || [];
    if (currentAnswers.includes(choice)) {
      setCurrentQuestion({
        ...currentQuestion,
        answer: currentAnswers.filter((ans) => ans !== choice),
      });
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        answer: [...currentAnswers, choice],
      });
    }
  };

  const handleAddQuestion = () => {
    if (!validateCurrentQuestion()) return;

    // Get the selected question type for the active part
    const selectedQuestionType = parts.find(
      (part) => part.part_num === activePart
    )?.selectedQuestionType;

    if (!selectedQuestionType) {
      toast({ variant: "destructive", title: "Loại câu hỏi không hợp lệ." });
      return;
    }

    // Create a new question object with the selected type
    const newQuestion: Question = {
      _id: currentQuestion._id || "",
      part_id: currentQuestion.part_id || "",
      q_type: selectedQuestionType,
      ...(selectedQuestionType === "MP"
        ? {
            question: currentQuestion.question || "",
            choices: currentQuestion.choices || [],
            answer: currentQuestion.answer || [],
          }
        : {
            start_passage: currentQuestion.start_passage || "",
            end_passage: currentQuestion.end_passage || "",
            answer: currentQuestion.answer || [],
          }),
    };

    // Update the parts state
    const updatedParts = parts.map((part) =>
      part.part_num === activePart
        ? {
            ...part,
            question:
              editingQuestionIndex !== null
                ? part.question.map((q, i) =>
                    i === editingQuestionIndex ? newQuestion : q
                  )
                : [...part.question, newQuestion],
            tempQuestions:
              editingQuestionIndex !== null
                ? part.tempQuestions.map((q, i) =>
                    i === editingQuestionIndex ? newQuestion : q
                  )
                : [...part.tempQuestions, newQuestion],
            selectedQuestionType: null, // Hide question management form
          }
        : part
    );

    // Update the parent component's state
    onPartsUpdate(updatedParts);

    // Reset the form
    setCurrentQuestion({
      _id: "",
      part_id: "",
      q_type: selectedQuestionType,
      question: "",
      choices: selectedQuestionType === "MP" ? [""] : undefined,
      answer: [],
      start_passage: "",
      end_passage: "",
    });

    setEditingQuestionIndex(null);
    toast({
      title:
        editingQuestionIndex !== null
          ? "Câu hỏi đã được cập nhật"
          : "Câu hỏi đã được thêm",
      description:
        editingQuestionIndex !== null
          ? "Câu hỏi đã được sửa thành công."
          : "Câu hỏi mới đã được thêm vào danh sách.",
    });
  };

  const handleEditQuestion = (index: number) => {
    const questionToEdit = parts.find((part) => part.part_num === activePart)
      ?.question[index];
    if (questionToEdit) {
      setCurrentQuestion(questionToEdit);
      setEditingQuestionIndex(index);
      const updatedParts = parts.map((part) =>
        part.part_num === activePart
          ? { ...part, selectedQuestionType: questionToEdit.q_type }
          : part
      );
      onPartsUpdate(updatedParts);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedParts = parts.map((part) =>
      part.part_num === activePart
        ? {
            ...part,
            tempQuestions: part.tempQuestions.filter((_, i) => i !== index),
          }
        : part
    );
    onPartsUpdate(updatedParts);
    setEditingQuestionIndex(null);
    setCurrentQuestion({
      _id: "",
      part_id: "",
      q_type:
        parts.find((part) => part.part_num === activePart)
          ?.selectedQuestionType || "MP",
      question: "",
      choices: [""],
      answer: [],
      start_passage: "",
      end_passage: "",
    });
    toast({
      title: "Đã xóa câu hỏi",
      description: "Câu hỏi đã được xóa khỏi danh sách.",
    });
  };

  const handleSaveQuestions = () => {
    const updatedParts = parts.map((part) => {
      if (part.tempQuestions.length === 0) {
        return part;
      }

      const formattedQuestions: Question[] = part.tempQuestions.map(
        (question) => {
          if (question.q_type === "MP") {
            return {
              _id: question._id || "",
              part_id: question.part_id || "",
              q_type: "MP",
              question: question.question || "",
              choices: question.choices || [],
              answer: question.answer || [],
            };
          } else {
            return {
              _id: question._id || "",
              part_id: question.part_id || "",
              q_type: "FB",
              image: part.image || "",
              start_passage: question.start_passage || "",
              end_passage: question.end_passage || "",
              answer: question.answer || [],
            };
          }
        }
      );

      return {
        ...part,
        question: formattedQuestions, // Replace old question list with new tempQuestions
        tempQuestions: [],
        selectedQuestionType: null,
      };
    });

    onPartsUpdate(updatedParts);

    toast({
      title: "Đã lưu câu hỏi",
      description: "Tất cả câu hỏi đã được lưu thành công.",
    });

    if (dialogCloseRef.current) {
      dialogCloseRef.current.click();
    }
  };

  const currentPart = parts.find((part) => part.part_num === activePart);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Chỉnh sửa câu hỏi
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Chỉnh sửa câu hỏi</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Chỉnh sửa nội dung và câu hỏi, sau đó nhấn{" "}
              <strong className="text-indigo-600">Lưu</strong>
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-3 gap-8">
          <div className="col-span-3 flex flex-row gap-5">
            {parts.map((part) => (
              <button
                key={part.part_num}
                className={`border rounded-xl px-5 py-1 ${
                  activePart === part.part_num
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-200"
                }`}
                onClick={() => setActivePart(part.part_num)}
              >
                Passage {part.part_num}
              </button>
            ))}
          </div>
          <div className="col-span-3">
            <div className="flex flex-col justify-start items-start gap-2 overflow-y-auto max-h-[60vh] pr-0 scroll-bar-style">
              <div className="w-full grid items-center gap-4">
                <div className="w-full mt-2">
                  <Label className="text-[14.5px] mb-2 block">
                    Audio for Passage {activePart}
                  </Label>
                  <div className="flex flex-col gap-4">
                    {currentPart?.audio ? (
                      <div className="flex flex-col gap-2">
                        <audio
                          controls
                          src={currentPart.audio}
                          className="w-full max-w-md"
                        >
                          Your browser does not support the audio element.
                        </audio>
                        <Button
                          variant="outline"
                          onClick={() => audioInputRef.current?.click()}
                          disabled={isLoading}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Replace Audio
                          {isAudioLoading && (
                            <Loader className="ml-2 animate-spin" size={16} />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => audioInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Audio
                        {isAudioLoading && (
                          <Loader className="ml-2 animate-spin" size={16} />
                        )}
                      </Button>
                    )}
                    <input
                      type="file"
                      ref={audioInputRef}
                      onChange={handleAudioFileChange}
                      accept="audio/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              {parts.find((part) => part.part_num === activePart)
                ?.selectedQuestionType && (
                <div className="col-span-3 w-full flex flex-col gap-4 mt-4">
                  {parts.find((part) => part.part_num === activePart)
                    ?.selectedQuestionType === "MP" && (
                    <div className="flex flex-col gap-4">
                      <div className="font-bold text-lg">MULTIPLE CHOICE</div>
                      <Label className="text-[14.5px]">
                        Câu hỏi trắc nghiệm
                      </Label>
                      <input
                        value={currentQuestion.question || ""}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            question: e.target.value,
                          })
                        }
                        placeholder="Nhập câu hỏi"
                        className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                      />
                      <Label className="text-[14.5px]">Lựa chọn</Label>
                      {currentQuestion.choices?.map((choice, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <input
                            value={choice}
                            onChange={(e) =>
                              handleChoiceChange(index, e.target.value)
                            }
                            placeholder={`Lựa chọn ${index + 1}`}
                            className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500 flex-1"
                          />
                          <input
                            type="checkbox"
                            checked={currentQuestion.answer?.includes(choice)}
                            onChange={() => handleAnswerToggle(choice)}
                            disabled={!choice}
                          />
                          <button
                            onClick={() => handleRemoveChoice(index)}
                            className="bg-red-500 text-white p-2 rounded-full"
                            disabled={currentQuestion.choices?.length === 1}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddChoice}
                        className="p-2 flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-full text-sm !text-[16px] text-center w-[40px]"
                      >
                        <Plus />
                      </button>
                    </div>
                  )}
                  {parts.find((part) => part.part_num === activePart)
                    ?.selectedQuestionType === "FB" && (
                    <div className="flex flex-col gap-4">
                      <div className="font-bold text-lg">FILL IN THE BLANK</div>
                      <Label className="text-[14.5px]">Đoạn đầu</Label>
                      <input
                        value={currentQuestion.start_passage || ""}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            start_passage: e.target.value,
                          })
                        }
                        placeholder="Nhập đoạn đầu"
                        className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                      />
                      <Label className="text-[14.5px]">Đoạn cuối</Label>
                      <input
                        value={currentQuestion.end_passage || ""}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            end_passage: e.target.value,
                          })
                        }
                        placeholder="Nhập đoạn cuối"
                        className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                      />
                      <Label className="text-[14.5px]">Đáp án</Label>
                      <input
                        value={currentQuestion.answer?.[0] || ""}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            answer: [e.target.value],
                          })
                        }
                        placeholder="Nhập đáp án"
                        className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleAddQuestion}
                    className="p-2 flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm !text-[16px] text-center"
                  >
                    {editingQuestionIndex !== null ? (
                      <>Cập nhật câu hỏi {editingQuestionIndex + 1}</>
                    ) : (
                      <>
                        <Plus /> Thêm câu hỏi
                      </>
                    )}
                  </button>
                </div>
              )}
              <QuestionList
                questions={
                  parts.find((part) => part.part_num === activePart)
                    ?.question || []
                }
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="!px-10 !text-[16px]"
              ref={dialogCloseRef}
            >
              Huỷ
            </Button>
          </DialogClose>
          <button
            type="submit"
            onClick={handleSaveQuestions}
            className="flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-md text-sm !px-10 !text-[16px] py-2.5 text-center"
          >
            Lưu
            {isLoading && <Loader className="animate-spin" size={17} />}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
