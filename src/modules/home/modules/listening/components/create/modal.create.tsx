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
import { UploadService } from "@/services/upload";
import { Loader, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState, useEffect } from "react";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { ListeningService } from "@/services/listening";
import { ModalCreateListeningDetail } from "./modal.create.detail";

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
  // Additional properties
  image?: string;
  isMultiple?: boolean;
}

interface PartDetails {
  image: string;
  audio: string;
  part_num: number;
  questions: Question[];
  tempQuestions: Question[];
  selectedQuestionType: "MP" | "FB" | "MH" | "MF" | "TFNG" | null;
}

interface AIGeneratedData {
  name?: string;
  time?: number;
  parts?: {
    content: string;
    questions: any[];
    part_num: number;
  }[];
  thumbnail?: string;
}

interface ModalCreateListeningProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  aiGeneratedData?: AIGeneratedData | null;
  aiFormattedOutput?: any;
}

export function ModalCreateListening({
  isOpen = false,
  onOpenChange,
  aiGeneratedData,
  aiFormattedOutput,
}: ModalCreateListeningProps) {
  const { toast } = useToast();

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const secondaryImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [mainPreview, setMainPreview] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [time, setTime] = useState<number>(0);

  const [parts, setParts] = useState<PartDetails[]>([
    {
      image: "",
      audio: "",
      part_num: 1,
      questions: [],
      tempQuestions: [],
      selectedQuestionType: null,
    },
    {
      image: "",
      audio: "",
      part_num: 2,
      questions: [],
      tempQuestions: [],
      selectedQuestionType: null,
    },
    {
      image: "",
      audio: "",
      part_num: 3,
      questions: [],
      tempQuestions: [],
      selectedQuestionType: null,
    },
    {
      image: "",
      audio: "",
      part_num: 4,
      questions: [],
      tempQuestions: [],
      selectedQuestionType: null,
    },
  ]);

  const [selectedTestType, setSelectedTestType] = useState<string>("");

  // Effect to populate form with AI generated data when available
  useEffect(() => {
    if (aiGeneratedData) {
      // Set name and time from AI data
      if (aiGeneratedData.name) setName(aiGeneratedData.name);
      if (aiGeneratedData.time) setTime(aiGeneratedData.time);

      // If we have parts data, update the parts state
      if (aiGeneratedData.parts && aiGeneratedData.parts.length > 0) {
        // Determine how many parts we need
        const numParts = aiGeneratedData.parts.length;
        setSelectedTestType(
          numParts === 1
            ? "test-part-1"
            : numParts === 2
            ? "test-part-2"
            : numParts === 3
            ? "test-part-3"
            : "test-full"
        );

        // Create updated parts with questions from AI data
        const updatedParts = Array.from({ length: numParts }, (_, i) => {
          const aiPart = aiGeneratedData.parts?.[i];

          // Map the AI questions to the expected format
          const questions = aiPart?.questions || [];

          return {
            image: "",
            audio: "",
            part_num: i + 1,
            questions: [],
            tempQuestions: questions,
            selectedQuestionType: null,
          };
        });

        setParts(updatedParts);
      }
    }
  }, [aiGeneratedData]);

  // Function to add a new question to a specific part
  const addNewQuestionToPart = (
    partNum: number,
    questionType: "MP" | "FB" | "MH" | "MF" | "TFNG"
  ) => {
    const updatedParts = [...parts];
    const partIndex = updatedParts.findIndex(
      (part) => part.part_num === partNum
    );

    if (partIndex !== -1) {
      // Set the selected question type for the part
      updatedParts[partIndex].selectedQuestionType = questionType;

      setParts(updatedParts);
    }
  };

  // Function to add a new part
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

    setParts([...parts, newPart]);

    // Update test type based on new number of parts
    const newTestType =
      newPartNum === 1
        ? "test-part-1"
        : newPartNum === 2
        ? "test-part-2"
        : newPartNum === 3
        ? "test-part-3"
        : "test-full";

    setSelectedTestType(newTestType);

    toast({
      title: "Đã thêm phần mới",
      description: `Phần ${newPartNum} đã được thêm vào bài nghe.`,
    });
  };

  const handlePartsUpdate = (updatedParts: PartDetails[]) => {
    setParts(updatedParts);
  };

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateMainImage = () => {
    mainImageInputRef.current?.click();
  };

  const validateForm = () => {
    if (!mainPreview) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn ảnh chính.",
      });
      return false;
    }

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập tên.",
      });
      return false;
    }

    return true;
  };

  const handleTestTypeChange = (value: string) => {
    setSelectedTestType(value);
    let numParts = 1;
    if (value === "test-part-2") numParts = 2;
    else if (value === "test-part-3") numParts = 3;
    else if (value === "test-full") numParts = 4;
    setParts(
      Array.from({ length: numParts }, (_, i) => ({
        image: "",
        audio: "",
        part_num: i + 1,
        questions: [],
        tempQuestions: [],
        selectedQuestionType: null,
      }))
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Validate that all parts have audio
      const partsWithoutAudio = parts.filter((part) => !part.audio);
      if (partsWithoutAudio.length > 0) {
        toast({
          variant: "destructive",
          title: "Missing audio",
          description: `Please upload audio files for Passage ${partsWithoutAudio
            .map((p) => p.part_num)
            .join(", ")}`,
        });
        setIsLoading(false);
        return;
      }

      // Transform parts similar to reading module
      const transformedParts = parts.map((part) => ({
        image: part.image,
        audio: part.audio,
        part_num: part.part_num,
        questions: part.questions.map((question) => {
          const transformedQuestion: any = {
            ...question,
            q_type: question.q_type,
          };

          if (question.q_type === "MP") {
            transformedQuestion.isMultiple =
              (question.answers?.length || 0) > 1;
            // Ensure these fields are explicitly set
            transformedQuestion.question = question.question;
            transformedQuestion.choices = question.choices;
            transformedQuestion.answer = question.answers;
          } else if (question.q_type === "FB") {
            // Ensure these fields are explicitly set
            transformedQuestion.start_passage = question.start_passage;
            transformedQuestion.end_passage = question.end_passage;
            transformedQuestion.answer = question.answers;
          } else if (question.q_type === "MH") {
            transformedQuestion.image = "";
            // Ensure these fields are explicitly set
            transformedQuestion.heading = question.heading;
            transformedQuestion.paragraph_id = question.paragraph_id;
            transformedQuestion.options = question.options || [];
            transformedQuestion.answer = question.answer;
          } else if (question.q_type === "MF") {
            transformedQuestion.image = "";
            // Ensure these fields are explicitly set
            transformedQuestion.feature = question.feature;
            transformedQuestion.options = question.options || [];
            transformedQuestion.answer = question.answer;
          } else if (question.q_type === "TFNG") {
            transformedQuestion.image = "";
            // Ensure these fields are explicitly set
            transformedQuestion.sentence = question.sentence;
            transformedQuestion.answer = question.answer;
          }

          return transformedQuestion;
        }),
      }));

      const uploadMainImage: any = await UploadService.uploadToCloudinary([
        mainPreview,
      ]);

      const body = {
        skill: "L",
        parts: transformedParts,
        name: name,
        thumbnail: uploadMainImage[0]?.url || "",
        time: time,
      };

      const response = await ListeningService.createListening(body);

      toast({
        title: "Listening created",
        description: "Listening created successfully!",
      });

      window.location.href = "/?tab=listening";
    } catch (error) {
      console.error("Error creating listening:", error);
      toast({
        variant: "destructive",
        title: "Failed to create listening",
        description: "There was an error creating the listening.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          <Plus size={16} className="mr-2" /> Thêm bài nghe
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Thêm bài nghe mới</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Điền thông tin bài nghe và nhấn{" "}
              <strong className="text-indigo-600">Tạo bài nghe</strong> để tạo
              bài nghe mới.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="overflow-y-auto max-h-[70vh] scroll-bar-style">
              <div className="mb-6">
                <Label htmlFor="thumbnail" className="text-right !text-[16px]">
                  Hình chính
                </Label>
                <div className="mt-2">
                  {!mainPreview && (
                    <div
                      onClick={handleUpdateMainImage}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-16 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                    >
                      <div className="flex flex-col items-center">
                        <span>+ Tải hình lên</span>
                        <span className="text-xs text-gray-500">
                          hoặc kéo thả file vào đây
                        </span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={mainImageInputRef}
                    onChange={handleMainImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {mainPreview && (
                    <div className="mt-2">
                      <div className="relative group w-full h-80">
                        <div className="absolute top-0 left-0 right-0 bottom-0 group-hover:bg-black rounded-md opacity-25 z-0 transform duration-200"></div>
                        <div className="cursor-pointer absolute top-[43%] left-[43%] hidden group-hover:flex z-10 transform duration-200">
                          <div className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full">
                            <Upload
                              onClick={handleUpdateMainImage}
                              color="white"
                              size={30}
                            />
                          </div>
                        </div>
                        <Image
                          src={mainPreview}
                          alt="main-preview"
                          className="w-full h-full object-cover rounded-md mt-2 border border-gray-200"
                          width={1000}
                          height={1000}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex flex-col justify-start items-start gap-2 overflow-y-auto max-h-[70vh] pr-0 scroll-bar-style">
              <Label htmlFor="description" className="text-[14.5px]">
                Tên bài đọc
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên sản phẩm"
                  className="col-span-3 p-2 border border-[#CFCFCF] placeholder-custom rounded"
                ></textarea>
              </div>
              <Label htmlFor={`time`} className="text-[14.5px]">
                Thời gian làm bài
              </Label>
              <div className="w-full grid items-center gap-4 mt-1">
                <input
                  id={`time`}
                  value={time}
                  type="number"
                  min={0}
                  max={60}
                  onChange={(e) => setTime(Number(e.target.value))}
                  placeholder="Thời gian làm bài"
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                />
              </div>

              <div className="mt-2">
                <ModalCreateListeningDetail
                  parts={parts}
                  onPartsUpdate={handlePartsUpdate}
                  selectedTestType={selectedTestType}
                  onTestTypeChange={handleTestTypeChange}
                  aiFormattedOutput={aiFormattedOutput}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="!px-10 !text-[16px]"
            >
              Huỷ
            </Button>
          </DialogClose>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-md text-sm !px-10 !text-[16px] py-2.5 text-center"
          >
            Tạo bài nghe
            {isLoading && <Loader className="animate-spin" size={17} />}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
