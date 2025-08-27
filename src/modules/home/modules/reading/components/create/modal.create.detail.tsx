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
import { useEffect, useRef, useState } from "react";
import ProductDescriptionEditor from "../quill";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { ModalChooseQuestion } from "../modal.choose.question";
import { QuestionList } from "./question-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface PartDetails {
  image: string;
  content: string;
  part_num: number;
  questions: Question[];
  tempQuestions: Question[];
  selectedQuestionType: "MP" | "FB" | "MH" | "MF" | "TFNG" | null;
}

interface ModalCreateReadingDetailProps {
  parts: PartDetails[];
  onPartsUpdate: (updatedParts: PartDetails[]) => void;
  selectedTestType: string;
  onTestTypeChange: (value: string) => void;
}

export function ModalCreateReadingDetail({
  parts,
  onPartsUpdate,
  selectedTestType,
  onTestTypeChange,
}: ModalCreateReadingDetailProps) {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);

  const [activePart, setActivePart] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    q_type: "MP",
    choices: [""],
    answers: [],
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

  // Effect to handle AI-generated questions when parts change
  useEffect(() => {
    if (parts && parts.length > 0) {
      // Debug log to see the current state of parts
      console.log("Current parts state:", parts);

      // Check if any parts have questions that need to be processed
      const hasAiQuestions = parts.some(
        (part) =>
          part.questions &&
          part.questions.length > 0 &&
          part.tempQuestions.length === 0 &&
          part.selectedQuestionType === null
      );

      if (hasAiQuestions) {
        console.log("Found AI-generated questions to process");

        // Process each part with questions
        const updatedParts = parts.map((part) => {
          // Skip parts without questions or already processed parts
          if (
            !part.questions ||
            part.questions.length === 0 ||
            part.tempQuestions.length > 0 ||
            part.selectedQuestionType !== null
          ) {
            return part;
          }

          console.log(
            `Processing questions for part ${part.part_num}:`,
            part.questions
          );

          // Determine the question type from the first question if possible
          let detectedQuestionType: "MP" | "FB" | "MH" | "MF" | "TFNG" | null =
            null;
          if (part.questions.length > 0) {
            detectedQuestionType = part.questions[0].q_type || "MP";
          }

          return {
            ...part,
            selectedQuestionType: detectedQuestionType,
            // Move questions to the final questions array directly
            questions: [...part.questions],
            tempQuestions: [],
          };
        });

        console.log(
          "Updated parts after processing AI questions:",
          updatedParts
        );

        // Update parts with processed questions
        onPartsUpdate(updatedParts);

        // Show a toast notification to inform the user
        toast({
          title: "AI-generated questions loaded",
          description: "Questions from the PDF have been automatically loaded.",
        });
      }
    }
  }, [parts, onPartsUpdate, toast]);

  // Modified to initialize tempQuestions when a question type is selected
  const handleTestTypeChange = (value: string) => {
    onTestTypeChange(value);
    let numParts = 1;
    if (value === "test-part-2") numParts = 2;
    else if (value === "test-full") numParts = 3;
    onPartsUpdate(
      Array.from({ length: numParts }, (_, i) => ({
        image: "",
        content: "",
        part_num: i + 1,
        questions: [],
        tempQuestions: [],
        selectedQuestionType: null,
      }))
    );
  };

  // Modified to properly initialize the tempQuestions array when selecting a question type
  const handleQuestionTypeSelect = (
    type: "MP" | "FB" | "MH" | "MF" | "TFNG"
  ) => {
    console.log(`Selected question type: ${type}`);

    const updatedParts = parts.map((part) =>
      part.part_num === activePart
        ? {
            ...part,
            selectedQuestionType: type,
            // Initialize tempQuestions as empty array if it's undefined
            tempQuestions: part.tempQuestions || [],
          }
        : part
    );

    console.log("Updated parts after selecting question type:", updatedParts);
    onPartsUpdate(updatedParts);

    setCurrentQuestion({
      q_type: type,
      choices: type === "MP" ? [""] : undefined,
      answers: [],
      question: "",
      start_passage: "",
      end_passage: "",
      heading: "",
      options: type === "MH" || type === "MF" ? [""] : undefined,
      paragraph_id: "",
      feature: "",
      sentence: "",
    });

    setEditingQuestionIndex(null);
  };

  // const handleMainImageChange = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;
  //   if (file.size > 5 * 1024 * 1024) {
  //     toast({
  //       variant: "destructive",
  //       title: "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB",
  //     });
  //     return;
  //   }
  //   if (!file.type.startsWith("image/")) {
  //     toast({
  //       variant: "destructive",
  //       title: "Vui lòng chọn file hình ảnh",
  //     });
  //     return;
  //   }
  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setMainPreview(reader.result as string);
  //   };
  //   reader.readAsDataURL(file);
  // };

  // const validateForm = () => {
  //   if (!mainPreview) {
  //     toast({
  //       variant: "destructive",
  //       title: "Vui lòng chọn ảnh chính.",
  //     });
  //     return false;
  //   }
  //   if (!name.trim()) {
  //     toast({
  //       variant: "destructive",
  //       title: "Vui lòng nhập tên.",
  //     });
  //     return false;
  //   }
  //   if (!description.trim()) {
  //     toast({
  //       variant: "destructive",
  //       title: "Vui lòng nhập mô tả.",
  //     });
  //     return false;
  //   }
  //   return true;
  // };

  // const handleImageUpload = useCallback(async (file: File) => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   try {
  //     const uploadResponse = await UploadService.uploadToCloudinary([file]);
  //     return uploadResponse &&
  //       Array.isArray(uploadResponse) &&
  //       uploadResponse[0]
  //       ? uploadResponse[0]?.secure_url
  //       : "";
  //   } catch (error) {
  //     console.error("Image upload failed:", error);
  //     return "";
  //   }
  // }, []);

  // const extractBase64Images = (htmlContent: string) => {
  //   const imgTagRegex =
  //     /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
  //   return [...htmlContent.matchAll(imgTagRegex)].map((match) => match[1]);
  // };

  // const replaceBase64WithCloudUrls = async (
  //   htmlContent: string,
  //   uploadFunc: (file: File) => Promise<string>
  // ) => {
  //   const imgTagRegex =
  //     /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
  //   let updatedContent = htmlContent;
  //   const matches = [...htmlContent.matchAll(imgTagRegex)];
  //   for (const match of matches) {
  //     const base64String = match[1];
  //     const file = base64ToFile(base64String);
  //     const uploadedUrl = await uploadFunc(file);
  //     updatedContent = updatedContent.replace(base64String, uploadedUrl);
  //   }
  //   return updatedContent;
  // };

  // const base64ToFile = (base64String: string): File => {
  //   const arr = base64String.split(",");
  //   const mime = arr[0].match(/:(.*?);/)?.[1];
  //   const bstr = atob(arr[1]);
  //   let n = bstr.length;
  //   const u8arr = new Uint8Array(n);
  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n);
  //   }
  //   return new File([u8arr], "image.png", { type: mime });
  // };

  // const handleAddPart = () => {
  //   const updatedParts = [
  //     ...parts,
  //     {
  //       image: "",
  //       content: "",
  //       part_num: parts.length + 1,
  //       questions: [],
  //       tempQuestions: [],
  //       selectedQuestionType: null,
  //     },
  //   ];
  //   onPartsUpdate(updatedParts);
  // };

  // Ensure content is updated for the active passage and log for debugging

  const handleContentChange = (content: string) => {
    // console.log(`Updating content for Passage ${activePart}:`, content);
    const updatedParts = parts.map((part) =>
      part.part_num === activePart ? { ...part, content } : part
    );
    onPartsUpdate(updatedParts);
  };

  // const handleQuestionsSelected = (newQuestions: Question[]) => {
  //   const updatedParts = parts.map((part) =>
  //     part.part_num === activePart
  //       ? { ...part, questions: [...part.questions, ...newQuestions] }
  //       : part
  //   );
  //   onPartsUpdate(updatedParts);
  // };

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
      if (!currentQuestion.answers || currentQuestion.answers.length === 0) {
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
        !currentQuestion.answers ||
        currentQuestion.answers.length === 0 ||
        !currentQuestion.answers[0].trim()
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
        !currentQuestion.answer.trim() ||
        !currentQuestion.options?.includes(currentQuestion.answer)
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
        !currentQuestion.answer.trim() ||
        !currentQuestion.options?.includes(currentQuestion.answer)
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
      if (!currentQuestion.answer || !currentQuestion.answer.trim()) {
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
      setCurrentQuestion({
        ...currentQuestion,
        choices: currentQuestion.choices.filter((_, i) => i !== index),
        answers: currentQuestion.answers?.filter((ans) =>
          currentQuestion.choices?.includes(ans)
        ),
      });
    }
  };

  const handleAnswerToggle = (choice: string) => {
    const currentAnswers = currentQuestion.answers || [];
    if (currentAnswers.includes(choice)) {
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentAnswers.filter((ans) => ans !== choice),
      });
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        answers: [...currentAnswers, choice],
      });
    }
  };

  // Update the function to edit questions directly in the questions array
  const handleEditExistingQuestion = (index: number) => {
    // Get the question to edit from questions
    const questionToEdit = parts.find((part) => part.part_num === activePart)
      ?.questions[index];
    if (questionToEdit) {
      console.log(
        `Editing existing question at index ${index}:`,
        questionToEdit
      );

      // Set it as the current question for editing
      setCurrentQuestion({ ...questionToEdit });

      // Set the question type in the part and add to tempQuestions
      const updatedParts = parts.map((part) =>
        part.part_num === activePart
          ? {
              ...part,
              selectedQuestionType: questionToEdit.q_type,
              // Add to tempQuestions for tracking that we're editing
              tempQuestions: [
                ...part.tempQuestions,
                { ...questionToEdit, _editingIndex: index },
              ],
            }
          : part
      );

      console.log(
        "Updated parts after setting up question for editing:",
        updatedParts
      );
      onPartsUpdate(updatedParts);

      // Store the index of the question being edited
      setEditingQuestionIndex(index);

      toast({
        title: "Chỉnh sửa câu hỏi",
        description:
          "Bạn có thể chỉnh sửa câu hỏi và nhấn 'Thêm câu hỏi' để cập nhật.",
      });
    }
  };

  // Add a function to delete questions from the questions array
  const handleDeleteExistingQuestion = (index: number) => {
    console.log(`Deleting existing question at index ${index}`);

    const updatedParts = parts.map((part) =>
      part.part_num === activePart
        ? {
            ...part,
            questions: part.questions.filter((_, i) => i !== index),
          }
        : part
    );

    console.log("Updated parts after deleting question:", updatedParts);
    onPartsUpdate(updatedParts);
    toast({
      title: "Đã xóa câu hỏi",
      description: "Câu hỏi đã được xóa khỏi danh sách.",
    });
  };

  const handleSaveQuestions = () => {
    console.log("Saving questions, current parts state:", parts);

    const updatedParts = parts.map((part) => {
      // Since we're now adding questions directly to the questions array,
      // we just need to clear the tempQuestions array
      return {
        ...part,
        tempQuestions: [],
        selectedQuestionType: null,
      };
    });

    console.log("Updated parts after saving questions:", updatedParts);

    onPartsUpdate(updatedParts);
    toast({
      title: "Đã lưu câu hỏi",
      description: "Tất cả câu hỏi đã được lưu thành công.",
    });

    if (dialogCloseRef.current) {
      dialogCloseRef.current.click();
    }
  };

  const hasQuestions =
    (parts.find((part) => part.part_num === activePart)?.questions?.length ||
      0) > 0 ||
    (parts.find((part) => part.part_num === activePart)?.tempQuestions.length ||
      0) > 0;

  // Update the handleAddQuestion function to handle editing existing questions
  const handleAddQuestion = () => {
    const selectedQuestionType = parts.find(
      (part) => part.part_num === activePart
    )?.selectedQuestionType;
    if (!validateCurrentQuestion()) return;

    console.log("Adding/updating question with type:", selectedQuestionType);
    console.log("Current question data:", currentQuestion);
    console.log("Editing index:", editingQuestionIndex);

    const newQuestion = { ...currentQuestion, q_type: selectedQuestionType! };

    // Format the question based on its type for the final questions array
    let formattedQuestion: Question;
    if (selectedQuestionType === "MP") {
      formattedQuestion = {
        q_type: "MP",
        question: newQuestion.question || "",
        choices: newQuestion.choices || [],
        answers: newQuestion.answers || [],
      };
    } else if (selectedQuestionType === "FB") {
      formattedQuestion = {
        q_type: "FB",
        start_passage: newQuestion.start_passage || "",
        end_passage: newQuestion.end_passage || "",
        answers: newQuestion.answers || [],
      };
    } else if (selectedQuestionType === "MH") {
      formattedQuestion = {
        q_type: "MH",
        heading: newQuestion.heading || "",
        paragraph_id: newQuestion.paragraph_id || "",
        options: newQuestion.options || [],
        answer: newQuestion.answer || "",
      };
    } else if (selectedQuestionType === "MF") {
      formattedQuestion = {
        q_type: "MF",
        feature: newQuestion.feature || "",
        options: newQuestion.options || [],
        answer: newQuestion.answer || "",
      };
    } else if (selectedQuestionType === "TFNG") {
      formattedQuestion = {
        q_type: "TFNG",
        sentence: newQuestion.sentence || "",
        answer: newQuestion.answer || "",
      };
    } else {
      formattedQuestion = newQuestion; // Fallback
    }

    const updatedParts = parts.map((part) =>
      part.part_num === activePart
        ? {
            ...part,
            // Clear tempQuestions as we're done editing
            tempQuestions: [],
            // Update or add to questions array
            questions:
              editingQuestionIndex !== null
                ? part.questions.map((q, i) =>
                    i === editingQuestionIndex ? formattedQuestion : q
                  )
                : [...part.questions, formattedQuestion],
          }
        : part
    );

    console.log("Updated parts after adding/updating question:", updatedParts);

    onPartsUpdate(updatedParts);
    setCurrentQuestion({
      q_type: selectedQuestionType!,
      question: "",
      choices: selectedQuestionType === "MP" ? [""] : undefined,
      answers: [],
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          {!hasQuestions ? (
            <>
              <Plus size={16} className="mr-2" /> Tạo câu hỏi
            </>
          ) : (
            <>Chỉnh sửa câu hỏi</>
          )}
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Tạo câu hỏi</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Tạo đầy đủ nội dung và câu hỏi, sau đó nhấn{" "}
              <strong className="text-indigo-600">Lưu</strong>
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-3 gap-8">
          <div className="col-span-3 flex flex-row gap-5">
            <div className="mb-4">
              <Select
                value={selectedTestType}
                onValueChange={handleTestTypeChange}
              >
                <SelectTrigger className="!h-10 !w-[150px]">
                  <SelectValue placeholder="Chọn loại đề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test-part-1">Đề lẻ 1 phần</SelectItem>
                  <SelectItem value="test-part-2">Đề lẻ 2 phần</SelectItem>
                  <SelectItem value="test-full">Đề full</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedTestType !== "" &&
              parts.map((part) => (
                <button
                  key={part.part_num}
                  className={`border rounded-md px-5 h-10 ${
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
          {selectedTestType === "" && (
            <div className="col-span-3 h-full w-full flex justify-center items-center">
              Vui lòng chọn loại đề
            </div>
          )}
          {selectedTestType !== "" && (
            <div className="col-span-3">
              <div className="flex flex-col justify-start items-start gap-2 overflow-y-auto max-h-[60vh] pr-0 scroll-bar-style">
                <div className="w-full grid items-center gap-4">
                  <div className="w-full mt-2">
                    <ProductDescriptionEditor
                      key={`editor-${activePart}`} // Force re-render when activePart changes
                      value={
                        parts.find((part) => part.part_num === activePart)
                          ?.content || ""
                      }
                      onChange={handleContentChange}
                      title={`Nội dung bài đọc ${activePart}`}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <ModalChooseQuestion
                    onTypeSelected={(type) => {
                      handleQuestionTypeSelect(type);
                    }}
                  />
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
                              checked={currentQuestion.answers?.includes(
                                choice
                              )}
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
                        <div className="font-bold text-lg">
                          FILL IN THE BLANK
                        </div>
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
                          value={currentQuestion.answers?.[0] || ""}
                          onChange={(e) =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              answers: [e.target.value],
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
                        <div className="font-bold text-lg">
                          MATCHING HEADINGS
                        </div>
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
                            <div
                              key={index}
                              className="flex items-center gap-4"
                            >
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
                                checked={currentQuestion.answer === option}
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
                                    currentQuestion.answer === option
                                      ? ""
                                      : currentQuestion.answer || "";

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
                              options: [
                                ...(currentQuestion.options || [""]),
                                "",
                              ],
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
                        <div className="font-bold text-lg">
                          MATCHING FEATURES
                        </div>
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
                            <div
                              key={index}
                              className="flex items-center gap-4"
                            >
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
                                checked={currentQuestion.answer === option}
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
                                    currentQuestion.answer === option
                                      ? ""
                                      : currentQuestion.answer || "";

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
                              options: [
                                ...(currentQuestion.options || [""]),
                                "",
                              ],
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
                              checked={currentQuestion.answer === "TRUE"}
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
                              checked={currentQuestion.answer === "FALSE"}
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
                              checked={currentQuestion.answer === "NOT GIVEN"}
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
                        <>Cập nhật câu hỏi {editingQuestionIndex + 1} </>
                      ) : (
                        <>
                          <Plus /> Thêm câu hỏi
                        </>
                      )}
                    </button>
                    <div className="mt-4">
                      {/* Show all questions in a single list */}
                      <h3 className="font-bold text-lg mb-2">
                        Danh sách câu hỏi
                      </h3>
                      <QuestionList
                        questions={
                          // Use only the questions array since we're now adding to both arrays
                          parts.find((part) => part.part_num === activePart)
                            ?.questions || []
                        }
                        onEdit={handleEditExistingQuestion}
                        onDelete={handleDeleteExistingQuestion}
                      />
                    </div>
                  </div>
                )}
                {/* Remove the commented out QuestionList component */}
              </div>
            </div>
          )}
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
          {selectedTestType !== "" && (
            <button
              type="submit"
              onClick={handleSaveQuestions}
              className="flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-md text-sm !px-10 !text-[16px] py-2.5 text-center"
            >
              Lưu
              {isLoading && <Loader className="animate-spin" size={17} />}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
