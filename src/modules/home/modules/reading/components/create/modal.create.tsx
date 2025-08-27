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
import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { ReadingService } from "@/services/reading";
import { ModalCreateReadingDetail } from "./modal.create.detail";
import { log } from "console";

interface Question {
  q_type: "MP" | "FB" | "MH" | "MF" | "TFNG";
  question?: string;
  choices?: string[];
  answers?: string[];
  start_passage?: string;
  end_passage?: string;
  isMultiple?: boolean;
  image?: string;
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
  image: string;
  content: string;
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
    questions: Question[];
    part_num: number;
  }[];
  thumbnail?: string;
}

interface ModalCreateReadingProps {
  aiData?: AIGeneratedData | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ModalCreateReading({
  aiData,
  isOpen,
  onOpenChange,
}: ModalCreateReadingProps) {
  const { toast } = useToast();

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const secondaryImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [mainPreview, setMainPreview] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [time, setTime] = useState<number>(0);
  const [selectedTestType, setSelectedTestType] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const [parts, setParts] = useState<PartDetails[]>([
    {
      image: "",
      content: "",
      part_num: 1,
      questions: [],
      tempQuestions: [],
      selectedQuestionType: null,
    },
    {
      image: "",
      content: "",
      part_num: 2,
      questions: [],
      tempQuestions: [],
      selectedQuestionType: null,
    },
    {
      image: "",
      content: "",
      part_num: 3,
      questions: [],
      tempQuestions: [],
      selectedQuestionType: null,
    },
  ]);

  // Effect to populate form with AI data when provided
  useEffect(() => {
    if (aiData) {
      // Set name if available
      if (aiData.name) {
        setName(aiData.name);
      }

      // Set time if available
      if (aiData.time) {
        setTime(aiData.time);
      }

      // Set thumbnail if available
      if (aiData.thumbnail) {
        setMainPreview(aiData.thumbnail);
      }

      // Automatically set test type to "test-full" for AI-generated data
      setSelectedTestType("test-full");
    }
  }, [aiData]);

  // Effect to handle test type changes and initialize parts accordingly
  useEffect(() => {
    if (selectedTestType) {
      let numParts = 1;
      if (selectedTestType === "test-part-2") numParts = 2;
      else if (selectedTestType === "test-full") numParts = 3;

      // Create initial parts structure
      const initialParts = Array.from({ length: numParts }, (_, i) => ({
        image: "",
        content: "",
        part_num: i + 1,
        questions: [] as Question[],
        tempQuestions: [] as Question[],
        selectedQuestionType: null,
      }));

      // If we have AI data, merge it with the initial parts
      if (aiData && aiData.parts && aiData.parts.length > 0) {
        aiData.parts.forEach((aiPart, index) => {
          if (index < initialParts.length) {
            initialParts[index] = {
              ...initialParts[index],
              content: aiPart.content || "",
              questions: (aiPart.questions as Question[]) || [],
              part_num: aiPart.part_num || index + 1,
            };
          }
        });
      }

      // Update the parts state
      setParts(initialParts);
    }
  }, [selectedTestType, aiData]);

  // Handle open state from props
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Handle open state change
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
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

  const extractBase64Images = (htmlContent: string) => {
    const imgTagRegex =
      /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
    const matches = [...htmlContent.matchAll(imgTagRegex)];
    return matches.map((match) => match[1]);
  };

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

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const uploadMainImage: any = await UploadService.uploadToCloudinary([
      mainPreview,
    ]);

    const transformedParts = parts.map((part) => ({
      image: part.image,
      content: part.content,
      part_num: part.part_num,
      questions: part.questions.map((question) => {
        const transformedQuestion = {
          ...question,
          q_type: question.q_type,
        };
        if (question.q_type === "MP") {
          transformedQuestion.isMultiple = (question.answers?.length || 0) > 1;
        } else if (question.q_type === "FB") {
          transformedQuestion.image = "";
        } else if (question.q_type === "MH") {
          transformedQuestion.image = "";
          // Ensure options field is included
          if (!transformedQuestion.options) {
            transformedQuestion.options = [];
          }
        } else if (question.q_type === "MF") {
          transformedQuestion.image = "";
          // Ensure options field is included
          if (!transformedQuestion.options) {
            transformedQuestion.options = [];
          }
        } else if (question.q_type === "TFNG") {
          transformedQuestion.image = "";
        }
        return transformedQuestion;
      }),
    }));

    const body = {
      skill: "R",
      parts: transformedParts,
      name: name,
      thumbnail: uploadMainImage[0]?.url || "",
      time: time,
    };

    const response = await ReadingService.createReading(body);
    setIsLoading(false);
    window.location.href = "/?tab=reading";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          <Plus size={16} className="mr-2" /> Thêm bài đọc
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Thêm bài đọc mới</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Điền thông tin bài đọc và nhấn{" "}
              <strong className="text-indigo-600">Tạo bài đọc</strong> để tạo
              bài đọc mới.
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
                <ModalCreateReadingDetail
                  parts={parts}
                  onPartsUpdate={handlePartsUpdate}
                  selectedTestType={selectedTestType}
                  onTestTypeChange={setSelectedTestType}
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
            Tạo bài đọc
            {isLoading && <Loader className="animate-spin" size={17} />}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
