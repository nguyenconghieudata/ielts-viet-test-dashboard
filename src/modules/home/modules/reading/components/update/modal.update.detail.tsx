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
import { Loader, Plus, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ProductDescriptionEditor from "../quill";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { ModalChooseQuestion } from "../modal.choose.question";
import { QuestionList } from "./question-list";
import { UploadService } from "@/services/upload";

interface Question {
  _id: string;
  part_id: string;
  q_type: "MP" | "FB" | "MH" | "MF" | "TFNG";
  question?: string;
  choices?: string[];
  answer?: string | string[]; // Can be array for MP and string for others
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
}

interface PartDetails {
  _id: string;
  image: string;
  content: string;
  part_num: number;
  question: Question[];
  tempQuestions: Question[];
  selectedQuestionType: "MP" | "FB" | "MH" | "MF" | "TFNG" | null;
}

interface ModalUpdateReadingDetailProps {
  parts: PartDetails[];
  onPartsUpdate: (updatedParts: PartDetails[]) => void;
}

export function ModalUpdateReadingDetail({
  parts,
  onPartsUpdate,
}: ModalUpdateReadingDetailProps) {
  const { toast } = useToast();
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  const handleContentChange = (content: string) => {
    const updatedParts = parts.map((part) =>
      part.part_num === activePart ? { ...part, content } : part
    );

    console.log("updatedParts", updatedParts);
    onPartsUpdate(updatedParts);
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
    } else if (selectedQuestionType === "MH") {
      if (!currentQuestion.heading?.trim()) {
        toast({
          variant: "destructive",
          title: "Vui lòng nhập heading.",
        });
        return false;
      }
      if (!currentQuestion.paragraph_id?.trim()) {
        toast({
          variant: "destructive",
          title: "Vui lòng nhập paragraph ID.",
        });
        return false;
      }
      if (
        !currentQuestion.options ||
        currentQuestion.options.length < 2 ||
        currentQuestion.options.some((o) => !o.trim())
      ) {
        toast({
          variant: "destructive",
          title: "Vui lòng thêm ít nhất 2 options hợp lệ.",
        });
        return false;
      }
      if (
        !currentQuestion.answer ||
        (typeof currentQuestion.answer === "string" &&
          !currentQuestion.answer.trim()) ||
        !currentQuestion.options?.includes(
          typeof currentQuestion.answer === "string"
            ? currentQuestion.answer
            : Array.isArray(currentQuestion.answer) &&
              currentQuestion.answer.length > 0
            ? currentQuestion.answer[0]
            : ""
        )
      ) {
        toast({
          variant: "destructive",
          title: "Vui lòng chọn một đáp án từ danh sách options.",
        });
        return false;
      }
    } else if (selectedQuestionType === "MF") {
      if (!currentQuestion.feature?.trim()) {
        toast({
          variant: "destructive",
          title: "Vui lòng nhập feature.",
        });
        return false;
      }
      if (
        !currentQuestion.options ||
        currentQuestion.options.length < 2 ||
        currentQuestion.options.some((o) => !o.trim())
      ) {
        toast({
          variant: "destructive",
          title: "Vui lòng thêm ít nhất 2 options hợp lệ.",
        });
        return false;
      }
      if (
        !currentQuestion.answer ||
        (typeof currentQuestion.answer === "string" &&
          !currentQuestion.answer.trim()) ||
        !currentQuestion.options?.includes(
          typeof currentQuestion.answer === "string"
            ? currentQuestion.answer
            : Array.isArray(currentQuestion.answer) &&
              currentQuestion.answer.length > 0
            ? currentQuestion.answer[0]
            : ""
        )
      ) {
        toast({
          variant: "destructive",
          title: "Vui lòng chọn một đáp án từ danh sách options.",
        });
        return false;
      }
    } else if (selectedQuestionType === "TFNG") {
      if (!currentQuestion.sentence?.trim()) {
        toast({
          variant: "destructive",
          title: "Vui lòng nhập câu phát biểu.",
        });
        return false;
      }
      if (
        !currentQuestion.answer ||
        (typeof currentQuestion.answer === "string" &&
          !currentQuestion.answer.trim()) ||
        (Array.isArray(currentQuestion.answer) &&
          (currentQuestion.answer.length === 0 ||
            !currentQuestion.answer[0].trim()))
      ) {
        toast({
          variant: "destructive",
          title: "Vui lòng chọn một đáp án từ danh sách TRUE/FALSE/NOT GIVEN.",
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
      const choiceToRemove = currentQuestion.choices[index];
      const updatedChoices = currentQuestion.choices.filter(
        (_, i) => i !== index
      );

      // Handle answer update based on question type
      let updatedAnswer = currentQuestion.answer;
      if (
        currentQuestion.q_type === "MP" &&
        Array.isArray(currentQuestion.answer)
      ) {
        // For MP, filter out the removed choice from answers array
        updatedAnswer = currentQuestion.answer.filter(
          (ans) => ans !== choiceToRemove
        );
      } else if (currentQuestion.answer === choiceToRemove) {
        // For other types, if the answer matches the removed choice, clear it
        updatedAnswer = "";
      }

      setCurrentQuestion({
        ...currentQuestion,
        choices: updatedChoices,
        answer: updatedAnswer,
      });
    }
  };

  const handleAnswerToggle = (choice: string) => {
    if (currentQuestion.q_type === "MP") {
      // For MP, answer is an array
      const currentAnswers = Array.isArray(currentQuestion.answer)
        ? currentQuestion.answer
        : [];
      if (currentAnswers.includes(choice)) {
        setCurrentQuestion({
          ...currentQuestion,
          answer: currentAnswers.filter((ans: string) => ans !== choice),
        });
      } else {
        setCurrentQuestion({
          ...currentQuestion,
          answer: [...currentAnswers, choice],
        });
      }
    } else {
      // For other types, answer is a string
      setCurrentQuestion({
        ...currentQuestion,
        answer: choice,
      });
    }
  };

  const handleAddQuestion = () => {
    if (!validateCurrentQuestion()) return;

    const selectedQuestionType = parts.find(
      (part) => part.part_num === activePart
    )?.selectedQuestionType;

    if (!selectedQuestionType) {
      toast({ variant: "destructive", title: "Loại câu hỏi không hợp lệ." });
      return;
    }

    let questionData = {};

    if (selectedQuestionType === "MP") {
      questionData = {
        question: currentQuestion.question || "",
        choices: currentQuestion.choices || [],
        answer: currentQuestion.answer || [],
      };
    } else if (selectedQuestionType === "FB") {
      questionData = {
        start_passage: currentQuestion.start_passage || "",
        end_passage: currentQuestion.end_passage || "",
        answer: currentQuestion.answer || [],
      };
    } else if (selectedQuestionType === "MH") {
      questionData = {
        heading: currentQuestion.heading || "",
        paragraph_id: currentQuestion.paragraph_id || "",
        options: currentQuestion.options || [],
        answer: currentQuestion.answer || [],
      };
    } else if (selectedQuestionType === "MF") {
      questionData = {
        feature: currentQuestion.feature || "",
        options: currentQuestion.options || [],
        answer: currentQuestion.answer || [],
      };
    } else if (selectedQuestionType === "TFNG") {
      questionData = {
        sentence: currentQuestion.sentence || "",
        answer: currentQuestion.answer || [],
      };
    }

    const newQuestion: Question = {
      _id: currentQuestion._id || Math.random().toString(36).substr(2, 9),
      part_id: currentQuestion.part_id,
      q_type: selectedQuestionType,
      ...questionData,
    };

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

    onPartsUpdate(updatedParts);

    // Reset current question state
    setCurrentQuestion({
      _id: "",
      part_id: "",
      q_type: selectedQuestionType,
      question: "",
      choices: selectedQuestionType === "MP" ? [""] : undefined,
      answer: [],
      start_passage: "",
      end_passage: "",
      heading: "",
      options:
        selectedQuestionType === "MH" || selectedQuestionType === "MF"
          ? [""]
          : undefined,
      paragraph_id: "",
      feature: "",
      sentence: "",
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

    const selectedQuestionType =
      parts.find((part) => part.part_num === activePart)
        ?.selectedQuestionType || "MP";

    setCurrentQuestion({
      _id: "",
      part_id: "",
      q_type: selectedQuestionType,
      question: "",
      choices: selectedQuestionType === "MP" ? [""] : undefined,
      answer: [],
      start_passage: "",
      end_passage: "",
      heading: "",
      options:
        selectedQuestionType === "MH" || selectedQuestionType === "MF"
          ? [""]
          : undefined,
      paragraph_id: "",
      feature: "",
      sentence: "",
    });

    toast({
      title: "Đã xóa câu hỏi",
      description: "Câu hỏi đã được xóa khỏi danh sách.",
    });
  };

  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadResponse = await UploadService.uploadToCloudinary([file]);
      if (
        uploadResponse &&
        Array.isArray(uploadResponse) &&
        uploadResponse[0]
      ) {
        return uploadResponse[0]?.secure_url;
      } else {
        console.error("Upload failed or response is not as expected");
        return "";
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return "";
    }
  }, []);

  const replaceBase64WithCloudUrls = async (
    htmlContent: string,
    uploadFunc: (file: File) => Promise<string>
  ) => {
    const imgTagRegex =
      /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
    let updatedContent = htmlContent;

    const matches = [...htmlContent.matchAll(imgTagRegex)];
    for (const match of matches) {
      const base64String = match[1];
      const file = base64ToFile(base64String);
      const uploadedUrl = await uploadFunc(file);
      updatedContent = updatedContent.replace(base64String, uploadedUrl);
    }

    return updatedContent;
  };

  const base64ToFile = (base64String: string): File => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "image.png", { type: mime });
  };

  const handleSaveQuestions = async () => {
    setIsLoading(true);
    try {
      // Process each part sequentially
      const processedParts = [];

      for (const part of parts) {
        if (part.tempQuestions.length === 0) {
          processedParts.push(part);
          continue;
        }

        // Upload any base64 images in content to cloud
        const updatedContent = await replaceBase64WithCloudUrls(
          part.content,
          handleImageUpload
        );

        const formattedQuestions: Question[] = part.tempQuestions.map(
          (question) => {
            if (question.q_type === "MP") {
              return {
                _id: question._id || "",
                part_id: question.part_id || "",
                q_type: "MP",
                question: question.question || "",
                choices: question.choices || [],
                answer: Array.isArray(question.answer) ? question.answer : [],
              };
            } else if (question.q_type === "FB") {
              return {
                _id: question._id || "",
                part_id: question.part_id || "",
                q_type: "FB",
                start_passage: question.start_passage || "",
                end_passage: question.end_passage || "",
                answer: Array.isArray(question.answer)
                  ? question.answer
                  : [question.answer || ""],
              };
            } else if (question.q_type === "MH") {
              return {
                _id: question._id || "",
                part_id: question.part_id || "",
                q_type: "MH",
                heading: question.heading || "",
                paragraph_id: question.paragraph_id || "",
                options: question.options || [],
                answer:
                  typeof question.answer === "string" ? question.answer : "",
              };
            } else if (question.q_type === "MF") {
              return {
                _id: question._id || "",
                part_id: question.part_id || "",
                q_type: "MF",
                feature: question.feature || "",
                options: question.options || [],
                answer:
                  typeof question.answer === "string" ? question.answer : "",
              };
            } else if (question.q_type === "TFNG") {
              return {
                _id: question._id || "",
                part_id: question.part_id || "",
                q_type: "TFNG",
                sentence: question.sentence || "",
                answer:
                  typeof question.answer === "string" ? question.answer : "",
              };
            } else {
              return question;
            }
          }
        );

        processedParts.push({
          ...part,
          content: updatedContent, // Update with the processed content
          question: formattedQuestions,
          tempQuestions: [],
          selectedQuestionType: null,
        });
      }

      onPartsUpdate(processedParts);

      toast({
        title: "Đã lưu câu hỏi",
        description: "Tất cả câu hỏi đã được lưu thành công.",
      });

      if (dialogCloseRef.current) {
        dialogCloseRef.current.click();
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi lưu câu hỏi",
        description: "Đã xảy ra lỗi khi lưu câu hỏi. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                  <ProductDescriptionEditor
                    key={`editor-${activePart}`}
                    value={
                      parts.find((part) => part.part_num === activePart)
                        ?.content || ""
                    }
                    onChange={handleContentChange}
                    title={`Nội dung bài đọc ${activePart}`}
                  />
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
                  {parts.find((part) => part.part_num === activePart)
                    ?.selectedQuestionType === "MH" && (
                    <div className="flex flex-col gap-4">
                      <div className="font-bold text-lg">MATCHING HEADINGS</div>
                      <Label className="text-[14.5px]">Heading</Label>
                      <input
                        value={currentQuestion.heading || ""}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            heading: e.target.value,
                          })
                        }
                        placeholder="Nhập heading"
                        className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                      />
                      <Label className="text-[14.5px]">Paragraph ID</Label>
                      <input
                        value={currentQuestion.paragraph_id || ""}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            paragraph_id: e.target.value,
                          })
                        }
                        placeholder="Nhập paragraph ID"
                        className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                      />
                      <Label className="text-[14.5px]">Options</Label>
                      {(currentQuestion.options || [""]).map(
                        (option, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <input
                              value={option}
                              onChange={(e) => {
                                const updatedOptions = [
                                  ...(currentQuestion.options || [""]),
                                ];
                                updatedOptions[index] = e.target.value;
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  options: updatedOptions,
                                });
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500 flex-1"
                            />
                            <input
                              type="radio"
                              checked={
                                typeof currentQuestion.answer === "string"
                                  ? currentQuestion.answer === option
                                  : Array.isArray(currentQuestion.answer) &&
                                    currentQuestion.answer.length > 0 &&
                                    currentQuestion.answer[0] === option
                              }
                              onChange={() => {
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  answer: option,
                                });
                              }}
                              disabled={!option.trim()}
                            />
                            <button
                              onClick={() => {
                                const updatedOptions = (
                                  currentQuestion.options || []
                                ).filter((_, i) => i !== index);
                                // If the deleted option was the answer, clear the answer
                                const updatedAnswer =
                                  typeof currentQuestion.answer === "string" &&
                                  currentQuestion.answer === option
                                    ? ""
                                    : currentQuestion.answer;

                                setCurrentQuestion({
                                  ...currentQuestion,
                                  options: updatedOptions.length
                                    ? updatedOptions
                                    : [""],
                                  answer: updatedAnswer,
                                });
                              }}
                              className="bg-red-500 text-white p-2 rounded-full"
                              disabled={
                                (currentQuestion.options || []).length <= 1
                              }
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )
                      )}
                      <button
                        onClick={() => {
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: [...(currentQuestion.options || [""]), ""],
                          });
                        }}
                        className="p-2 flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-full text-sm !text-[16px] text-center w-[40px]"
                      >
                        <Plus />
                      </button>
                    </div>
                  )}
                  {parts.find((part) => part.part_num === activePart)
                    ?.selectedQuestionType === "MF" && (
                    <div className="flex flex-col gap-4">
                      <div className="font-bold text-lg">MATCHING FEATURES</div>
                      <Label className="text-[14.5px]">Feature</Label>
                      <input
                        value={currentQuestion.feature || ""}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            feature: e.target.value,
                          })
                        }
                        placeholder="Nhập feature"
                        className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                      />
                      <Label className="text-[14.5px]">Options</Label>
                      {(currentQuestion.options || [""]).map(
                        (option, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <input
                              value={option}
                              onChange={(e) => {
                                const updatedOptions = [
                                  ...(currentQuestion.options || [""]),
                                ];
                                updatedOptions[index] = e.target.value;
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  options: updatedOptions,
                                });
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500 flex-1"
                            />
                            <input
                              type="radio"
                              checked={
                                typeof currentQuestion.answer === "string"
                                  ? currentQuestion.answer === option
                                  : Array.isArray(currentQuestion.answer) &&
                                    currentQuestion.answer.length > 0 &&
                                    currentQuestion.answer[0] === option
                              }
                              onChange={() => {
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  answer: option,
                                });
                              }}
                              disabled={!option.trim()}
                            />
                            <button
                              onClick={() => {
                                const updatedOptions = (
                                  currentQuestion.options || []
                                ).filter((_, i) => i !== index);
                                // If the deleted option was the answer, clear the answer
                                const updatedAnswer =
                                  typeof currentQuestion.answer === "string" &&
                                  currentQuestion.answer === option
                                    ? ""
                                    : currentQuestion.answer;

                                setCurrentQuestion({
                                  ...currentQuestion,
                                  options: updatedOptions.length
                                    ? updatedOptions
                                    : [""],
                                  answer: updatedAnswer,
                                });
                              }}
                              className="bg-red-500 text-white p-2 rounded-full"
                              disabled={
                                (currentQuestion.options || []).length <= 1
                              }
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )
                      )}
                      <button
                        onClick={() => {
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: [...(currentQuestion.options || [""]), ""],
                          });
                        }}
                        className="p-2 flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-full text-sm !text-[16px] text-center w-[40px]"
                      >
                        <Plus />
                      </button>
                    </div>
                  )}
                  {parts.find((part) => part.part_num === activePart)
                    ?.selectedQuestionType === "TFNG" && (
                    <div className="flex flex-col gap-4">
                      <div className="font-bold text-lg">
                        TRUE / FALSE / NOT GIVEN
                      </div>
                      <Label className="text-[14.5px]">Sentence</Label>
                      <input
                        value={currentQuestion.sentence || ""}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            sentence: e.target.value,
                          })
                        }
                        placeholder="Nhập câu phát biểu"
                        className="p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                      />
                      <Label className="text-[14.5px]">Answer</Label>
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="true-option"
                            checked={
                              typeof currentQuestion.answer === "string"
                                ? currentQuestion.answer === "TRUE"
                                : Array.isArray(currentQuestion.answer) &&
                                  currentQuestion.answer.length > 0 &&
                                  currentQuestion.answer[0] === "TRUE"
                            }
                            onChange={() => {
                              setCurrentQuestion({
                                ...currentQuestion,
                                answer: "TRUE",
                              });
                            }}
                          />
                          <label
                            htmlFor="true-option"
                            className="cursor-pointer"
                          >
                            TRUE
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="false-option"
                            checked={
                              typeof currentQuestion.answer === "string"
                                ? currentQuestion.answer === "FALSE"
                                : Array.isArray(currentQuestion.answer) &&
                                  currentQuestion.answer.length > 0 &&
                                  currentQuestion.answer[0] === "FALSE"
                            }
                            onChange={() => {
                              setCurrentQuestion({
                                ...currentQuestion,
                                answer: "FALSE",
                              });
                            }}
                          />
                          <label
                            htmlFor="false-option"
                            className="cursor-pointer"
                          >
                            FALSE
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="not-given-option"
                            checked={
                              typeof currentQuestion.answer === "string"
                                ? currentQuestion.answer === "NOT GIVEN"
                                : Array.isArray(currentQuestion.answer) &&
                                  currentQuestion.answer.length > 0 &&
                                  currentQuestion.answer[0] === "NOT GIVEN"
                            }
                            onChange={() => {
                              setCurrentQuestion({
                                ...currentQuestion,
                                answer: "NOT GIVEN",
                              });
                            }}
                          />
                          <label
                            htmlFor="not-given-option"
                            className="cursor-pointer"
                          >
                            NOT GIVEN
                          </label>
                        </div>
                      </div>
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
