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
import { useCallback, useRef, useState, useEffect } from "react";
import ProductDescriptionEditor from "../quill";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { ModalChooseQuestion } from "../modal.choose.question";
import { QuestionList } from "./question-list";
import { UploadService } from "@/services/upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  q_type: "MP" | "FB" | "MH" | "MF" | "TFNG";
  part_num?: number;
  image?: string;
  audio?: string;
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
  audio: string;
  part_num: number;
  questions: Question[];
  tempQuestions: Question[];
  selectedQuestionType: "MP" | "FB" | "MH" | "MF" | "TFNG" | null;
}

interface ModalCreateListeningDetailProps {
  parts: PartDetails[];
  onPartsUpdate: (updatedParts: PartDetails[]) => void;
  selectedTestType: string;
  onTestTypeChange: (value: string) => void;
  aiFormattedOutput?: any;
}

export function ModalCreateListeningDetail({
  parts,
  onPartsUpdate,
  selectedTestType,
  onTestTypeChange,
  aiFormattedOutput,
}: ModalCreateListeningDetailProps) {
  const { toast } = useToast();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const dataProcessedRef = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);

  const [activePart, setActivePart] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    q_type: "MP",
    choices: [""],
    answers: [],
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

  // Effect to populate questions from AI generated data when available
  useEffect(() => {
    // Skip if no data or already processed
    if (!aiFormattedOutput || !parts || dataProcessedRef.current) {
      return;
    }

    // Try to extract questions from different possible formats in the AI output
    let aiParts: any[] = [];

    if (
      aiFormattedOutput.passages &&
      Array.isArray(aiFormattedOutput.passages)
    ) {
      aiParts = aiFormattedOutput.passages;
    } else if (
      aiFormattedOutput.parts &&
      Array.isArray(aiFormattedOutput.parts)
    ) {
      aiParts = aiFormattedOutput.parts;
    } else if (
      aiFormattedOutput.sections &&
      Array.isArray(aiFormattedOutput.sections)
    ) {
      aiParts = aiFormattedOutput.sections;
    }

    // If we found parts with questions, update our parts
    if (aiParts.length > 0) {
      // Check if we already have questions in tempQuestions
      const hasExistingQuestions = parts.some(
        (part) => part.tempQuestions && part.tempQuestions.length > 0
      );

      if (!hasExistingQuestions) {
        const updatedParts = [...parts];
        let hasChanges = false;

        // For each part we have, try to find corresponding AI part and extract questions
        for (let i = 0; i < updatedParts.length && i < aiParts.length; i++) {
          const aiPart = aiParts[i];
          const questions = aiPart.questions || [];

          // Format the questions to match our expected format
          const formattedQuestions = formatQuestionsFromAI(questions);

          if (formattedQuestions.length > 0) {
            // Update the part with the formatted questions
            updatedParts[i] = {
              ...updatedParts[i],
              tempQuestions: formattedQuestions,
            };
            hasChanges = true;
          }
        }

        if (hasChanges) {
          onPartsUpdate(updatedParts);
        }
      }

      // Mark as processed to prevent infinite loops
      dataProcessedRef.current = true;
    }
  }, [aiFormattedOutput]);

  // Helper function to format questions from AI output to our expected format
  const formatQuestionsFromAI = (questions: any[]): Question[] => {
    if (!Array.isArray(questions)) return [];

    return questions.map((q) => {
      // Try to determine the question type
      let questionType = q.q_type || q.type || "MP"; // Default to multiple choice

      // Normalize question type to expected format
      if (
        questionType.toUpperCase().includes("MULTIPLE") ||
        questionType.toUpperCase().includes("MC")
      ) {
        questionType = "MP";
      } else if (
        questionType.toUpperCase().includes("FILL") ||
        questionType.toUpperCase().includes("FB")
      ) {
        questionType = "FB";
      } else if (
        questionType.toUpperCase().includes("HEADING") ||
        questionType.toUpperCase().includes("MH")
      ) {
        questionType = "MH";
      } else if (
        questionType.toUpperCase().includes("FEATURE") ||
        questionType.toUpperCase().includes("MF")
      ) {
        questionType = "MF";
      } else if (
        questionType.toUpperCase().includes("TRUE") ||
        questionType.toUpperCase().includes("TFNG")
      ) {
        questionType = "TFNG";
      }

      // Format the question based on its type
      switch (questionType) {
        case "MP":
          return {
            q_type: "MP",
            question: q.question || q.text || "",
            choices: q.choices || q.options || [],
            answers: q.answers || (q.answer ? [q.answer] : []),
          };
        case "FB":
          return {
            q_type: "FB",
            start_passage: q.start_passage || q.start || "",
            end_passage: q.end_passage || q.end || "",
            answers: q.answers || (q.answer ? [q.answer] : []),
          };
        case "MH":
          return {
            q_type: "MH",
            heading: q.heading || "",
            paragraph_id: q.paragraph_id || q.paragraph || "",
            options: q.options || [],
            answer: q.answer || "",
          };
        case "MF":
          return {
            q_type: "MF",
            feature: q.feature || "",
            options: q.options || [],
            answer: q.answer || "",
          };
        case "TFNG":
          return {
            q_type: "TFNG",
            sentence: q.sentence || q.text || "",
            answer: q.answer || "",
          };
        default:
          return {
            q_type: "MP",
            question: q.question || "",
            choices: q.choices || [],
            answers: q.answers || [],
          };
      }
    });
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

  const handleAddPart = () => {
    if (parts.length >= 4) {
      toast({
        variant: "destructive",
        title: "Số lượng phần tối đa",
        description: "Bạn đã đạt đến số lượng phần tối đa (4 phần).",
      });
      return;
    }

    const newPartNum = parts.length + 1;
    const newPart: PartDetails = {
      image: "",
      audio: "",
      part_num: newPartNum,
      questions: [],
      tempQuestions: [],
      selectedQuestionType: null,
    };

    const updatedParts = [...parts, newPart];
    onPartsUpdate(updatedParts);

    // Update test type based on new number of parts
    const newTestType =
      newPartNum === 1
        ? "test-part-1"
        : newPartNum === 2
        ? "test-part-2"
        : newPartNum === 3
        ? "test-part-3"
        : "test-full";

    onTestTypeChange(newTestType);

    toast({
      title: "Đã thêm phần mới",
      description: `Phần ${newPartNum} đã được thêm vào bài nghe.`,
    });
  };

  // Ensure content is updated for the active passage and log for debugging

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
      if (
        !currentQuestion.answer ||
        !currentQuestion.answer.trim() ||
        !["TRUE", "FALSE", "NOT GIVEN"].includes(currentQuestion.answer)
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

  const handleAddQuestion = () => {
    if (!validateCurrentQuestion()) return;

    const selectedQuestionType = parts.find(
      (part) => part.part_num === activePart
    )?.selectedQuestionType;

    if (!selectedQuestionType) {
      toast({ variant: "destructive", title: "Loại câu hỏi không hợp lệ." });
      return;
    }

    let newQuestion: Question = {
      q_type: selectedQuestionType,
    };

    if (selectedQuestionType === "MP") {
      newQuestion = {
        ...newQuestion,
        question: currentQuestion.question || "",
        choices: currentQuestion.choices || [],
        answers: currentQuestion.answers || [],
      };
    } else if (selectedQuestionType === "FB") {
      newQuestion = {
        ...newQuestion,
        start_passage: currentQuestion.start_passage || "",
        end_passage: currentQuestion.end_passage || "",
        answers: currentQuestion.answers || [],
      };
    } else if (selectedQuestionType === "MH") {
      newQuestion = {
        ...newQuestion,
        heading: currentQuestion.heading || "",
        paragraph_id: currentQuestion.paragraph_id || "",
        options: currentQuestion.options || [],
        answer: currentQuestion.answer || "",
      };
    } else if (selectedQuestionType === "MF") {
      newQuestion = {
        ...newQuestion,
        feature: currentQuestion.feature || "",
        options: currentQuestion.options || [],
        answer: currentQuestion.answer || "",
      };
    } else if (selectedQuestionType === "TFNG") {
      newQuestion = {
        ...newQuestion,
        sentence: currentQuestion.sentence || "",
        answer: currentQuestion.answer || "",
      };
    }

    // Add the required fields to the question
    const currentPart = parts.find((part) => part.part_num === activePart);
    const questionWithFields = {
      ...newQuestion,
      part_num: activePart,
      image: currentPart?.image || "",
      audio: currentPart?.audio || "",
    };

    const updatedParts = parts.map((part) => {
      if (part.part_num === activePart) {
        if (editingQuestionIndex !== null) {
          // Update existing question
          const updatedTempQuestions = [...part.tempQuestions];
          updatedTempQuestions[editingQuestionIndex] = questionWithFields;

          return {
            ...part,
            tempQuestions: updatedTempQuestions,
          };
        } else {
          // Add new question
          return {
            ...part,
            questions: [...part.questions, questionWithFields],
            tempQuestions: [...part.tempQuestions, questionWithFields],
          };
        }
      }
      return part;
    });

    onPartsUpdate(updatedParts);

    // Reset current question state but maintain the same question type
    setCurrentQuestion({
      q_type: selectedQuestionType,
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
      answer: "",
    });

    // Reset editing index after saving
    setEditingQuestionIndex(null);

    toast({
      title:
        editingQuestionIndex !== null
          ? "Câu hỏi đã được cập nhật"
          : "Câu hỏi đã được thêm",
      description:
        editingQuestionIndex !== null
          ? "Câu hỏi đã được cập nhật thành công."
          : "Câu hỏi mới đã được thêm vào danh sách.",
    });
  };

  const handleEditQuestion = (index: number) => {
    const questionToEdit = parts.find((part) => part.part_num === activePart)
      ?.tempQuestions[index];
    if (questionToEdit) {
      // Preserve all fields including part_num, image, and audio
      setCurrentQuestion({ ...questionToEdit });
      setEditingQuestionIndex(index);

      // Update the selected question type in the parts array
      const updatedParts = parts.map((part) =>
        part.part_num === activePart
          ? { ...part, selectedQuestionType: questionToEdit.q_type }
          : part
      );
      onPartsUpdate(updatedParts);

      // Scroll to the question form
      setTimeout(() => {
        const questionForm = document.querySelector(".question-form-section");
        if (questionForm) {
          questionForm.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

      toast({
        title: "Chỉnh sửa câu hỏi",
        description: `Đang chỉnh sửa câu hỏi ${index + 1}`,
      });
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedParts = parts.map((part) =>
      part.part_num === activePart
        ? {
            ...part,
            tempQuestions: part.tempQuestions.filter((_, i) => i !== index),
            // Also remove from the questions array if it exists there
            questions: part.questions.filter((q, i) => {
              // If the question is in both arrays at the same index, remove it
              // This is a simple approach; for more complex scenarios, you might need a unique ID
              if (i < part.tempQuestions.length && i === index) {
                return false;
              }
              return true;
            }),
          }
        : part
    );
    onPartsUpdate(updatedParts);

    // If we're currently editing this question, reset the editing state
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
      setCurrentQuestion({
        q_type: "MP",
        choices: [""],
        answers: [],
      });
    }

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
          let formattedQuestion: Question;

          if (question.q_type === "MP") {
            formattedQuestion = {
              q_type: "MP",
              question: question.question || "",
              choices: question.choices || [],
              answers: question.answers || [],
            };
          } else if (question.q_type === "FB") {
            formattedQuestion = {
              q_type: "FB",
              start_passage: question.start_passage || "",
              end_passage: question.end_passage || "",
              answers: question.answers || [],
            };
          } else if (question.q_type === "MH") {
            formattedQuestion = {
              q_type: "MH",
              heading: question.heading || "",
              paragraph_id: question.paragraph_id || "",
              options: question.options || [],
              answer: question.answer || "",
            };
          } else if (question.q_type === "MF") {
            formattedQuestion = {
              q_type: "MF",
              feature: question.feature || "",
              options: question.options || [],
              answer: question.answer || "",
            };
          } else if (question.q_type === "TFNG") {
            formattedQuestion = {
              q_type: "TFNG",
              sentence: question.sentence || "",
              answer: question.answer || "",
            };
          } else {
            formattedQuestion = question;
          }

          // Add the required fields to each question
          return {
            ...formattedQuestion,
            part_num: part.part_num,
            image: part.image || "",
            audio: part.audio || "",
          };
        }
      );

      return {
        ...part,
        questions: formattedQuestions, // Replace old question list with new tempQuestions
        tempQuestions: [],
        // Keep the selected question type to keep the form visible
      };
    });

    onPartsUpdate(updatedParts);

    console.log("Updated parts:", updatedParts);

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

  const currentPart = parts.find((part) => part.part_num === activePart);

  return (
    <>
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
                  onValueChange={onTestTypeChange}
                >
                  <SelectTrigger className="!h-10 !w-[150px]">
                    <SelectValue placeholder="Chọn loại đề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test-part-1">Đề lẻ 1 phần</SelectItem>
                    <SelectItem value="test-part-2">Đề lẻ 2 phần</SelectItem>
                    <SelectItem value="test-part-3">Đề lẻ 3 phần</SelectItem>
                    <SelectItem value="test-full">Đề full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedTestType !== "" && (
                <div className="col-span-3 flex flex-row gap-5 h-10">
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
                  {parts.length < 4 && (
                    <button
                      onClick={handleAddPart}
                      className="border border-dashed border-indigo-400 rounded-xl px-5 py-1 flex items-center justify-center text-indigo-600 hover:bg-indigo-50"
                    >
                      <Plus size={16} className="mr-1" /> Thêm phần
                    </button>
                  )}
                </div>
              )}
            </div>

            {selectedTestType === "" ? (
              <div className="col-span-3 h-full w-full flex justify-center items-center">
                Vui lòng chọn loại đề
              </div>
            ) : (
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
                                <Loader
                                  className="ml-2 animate-spin"
                                  size={16}
                                />
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
                  <div className="mt-2">
                    <ModalChooseQuestion
                      onTypeSelected={(type) => {
                        const updatedParts = parts.map((part) =>
                          part.part_num === activePart
                            ? { ...part, selectedQuestionType: type }
                            : part
                        );
                        onPartsUpdate(updatedParts);
                        setCurrentQuestion({
                          q_type: type,
                          choices: type === "MP" ? [""] : undefined,
                          answers: [],
                          question: "",
                          start_passage: "",
                          end_passage: "",
                        });
                        setEditingQuestionIndex(null);
                      }}
                    />
                  </div>

                  {/* Question Form Section */}
                  {parts.find((part) => part.part_num === activePart)
                    ?.selectedQuestionType && (
                    <div className="col-span-3 w-full flex flex-col gap-4 mt-4 border-b pb-6 mb-6 question-form-section">
                      <h3 className="text-lg font-bold">
                        {editingQuestionIndex !== null
                          ? `Chỉnh sửa câu hỏi ${editingQuestionIndex + 1}`
                          : "Thêm câu hỏi mới"}
                      </h3>
                      {parts.find((part) => part.part_num === activePart)
                        ?.selectedQuestionType === "MP" && (
                        <div className="flex flex-col gap-4">
                          <div className="font-bold text-lg">
                            MULTIPLE CHOICE
                          </div>
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
                            <div
                              key={index}
                              className="flex items-center gap-4"
                            >
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
                          <>Cập nhật câu hỏi</>
                        ) : (
                          <>
                            <Plus /> Thêm câu hỏi
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Question Lists Section - Always visible */}
                  <div className="col-span-3 w-full">
                    {(() => {
                      const currentPart = parts.find(
                        (part) => part.part_num === activePart
                      );
                      return (
                        <>
                          {currentPart &&
                            currentPart.tempQuestions &&
                            currentPart.tempQuestions.length > 0 && (
                              <QuestionList
                                title="Danh sách chỉnh sửa câu hỏi"
                                questions={currentPart.tempQuestions}
                                onEdit={handleEditQuestion}
                                onDelete={handleDeleteQuestion}
                              />
                            )}

                          {/* {currentPart &&
                            currentPart.questions &&
                            currentPart.questions.length > 0 && (
                              <QuestionList
                                title="Danh sách câu hỏi đã lưu"
                                questions={currentPart.questions}
                              />
                            )} */}
                        </>
                      );
                    })()}
                  </div>
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
    </>
  );
}
