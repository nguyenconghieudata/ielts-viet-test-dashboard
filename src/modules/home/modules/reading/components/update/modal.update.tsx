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
import { Loader, SquarePen, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { ReadingService } from "@/services/reading";
import { ModalUpdateReadingDetail } from "./modal.update.detail";
import { QuestionsService } from "@/services/questions";
import { TestService } from "@/services/test";

interface Question {
  _id: string;
  part_id: string;
  q_type: "MP" | "FB";
  question?: string;
  choices?: string[];
  answer?: string[];
  start_passage?: string;
  end_passage?: string;
  isMultiple?: boolean;
  image?: string;
}

interface PartDetails {
  _id: string;
  image: string;
  content: string;
  part_num: number;
  question: Question[];
  tempQuestions: Question[];
  selectedQuestionType: "MP" | "FB" | null;
}

interface ReadingData {
  created_at: string;
  name: string;
  parts: string[];
  thumbnail: string;
  time: number;
  type: string;
  _id: string;
}

export function ModalUpdateReading({ data }: { data: ReadingData }) {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDOM, setIsLoadingDOM] = useState<boolean>(true);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [time, setTime] = useState<number>(0);
  const [isLoadingForDelete, setIsLoadingForDelete] = useState<boolean>(false);

  const [parts, setParts] = useState<PartDetails[]>([]);

  const handlePartsUpdate = (updatedParts: PartDetails[]) => {
    setParts(updatedParts);
  };

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB",
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn file hình ảnh",
      });
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
      _id: part._id,
      image: part.image,
      content: part.content,
      part_num: part.part_num,
      question: part.question.map((question) => {
        const transformedQuestion = { ...question };
        if (question.q_type === "MP") {
          transformedQuestion.isMultiple = (question.answer?.length || 0) > 1;
        } else if (question.q_type === "FB") {
          transformedQuestion.image = "";
        }
        return transformedQuestion;
      }),
    }));

    const body = {
      parts: transformedParts,
      name: name,
      thumbnail: uploadMainImage[0]?.url || "",
      time: time,
    };

    const response = await TestService.updateReading(data?._id, body);

    setIsLoading(false);
    window.location.href = "/?tab=reading";
  };

  const handleDelete = async () => {
    setIsLoadingForDelete(true);
    const response = await ReadingService.deleteReading(data?._id);
    setIsLoadingForDelete(false);
    window.location.href = "/?tab=reading";
  };

  const updateDOM = async (readingData: ReadingData) => {
    if (readingData) {
      setName(readingData.name);
      setTime(readingData.time);
      setMainPreview(readingData.thumbnail);

      // Dynamically fetch all parts based on the actual data
      const partsPromises = readingData.parts.map(async (partId: string) => {
        return await QuestionsService.getQuestionsById(partId);
      });

      const partsData = await Promise.all(partsPromises);

      // Create parts array dynamically based on actual data
      const updatedParts: PartDetails[] = partsData.map((partData, index) => ({
        _id: partData._id,
        image: partData.image || "",
        content: partData.content || "",
        part_num: index + 1,
        question: (partData.question || []).map((q: any) => ({
          ...q,
          answer: q.answer || q.answers || [],
        })),
        tempQuestions: (partData.question || []).map((q: any) => ({
          ...q,
          answer: q.answer || q.answers || [],
        })),
        selectedQuestionType: null,
      }));

      setParts(updatedParts);
      setIsLoadingDOM(false);
    }
  };

  useEffect(() => {
    updateDOM(data);
  }, [data]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isLoadingDOM ? (
          <div className="px-5 text-center pointer-events-none">
            <Loader className="animate-spin" size={17} />
          </div>
        ) : (
          <button
            type="button"
            className="mx-3 flex items-center justify-center text-black hover:text-white hover:bg-indigo-700 font-medium rounded-full text-sm p-2 text-center"
          >
            <SquarePen />
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Cập nhật bài đọc</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Điền thông tin bài đọc và nhấn{" "}
              <strong className="text-indigo-600">Cập nhật bài đọc</strong> để
              lưu thay đổi.
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
                  placeholder="Tên bài đọc"
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
                <ModalUpdateReadingDetail
                  parts={parts}
                  onPartsUpdate={handlePartsUpdate}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="w-full flex !flex-row !justify-between !items-center">
          <Button
            onClick={handleDelete}
            type="submit"
            className="!px-8 !text-[16px] text-red-600 bg-white border-2 border-red-600 hover:bg-red-600 hover:text-white"
          >
            <Trash2 />
            Xoá
            {isLoadingForDelete && (
              <Loader className="animate-spin" size={48} />
            )}
          </Button>
          <div className="flex gap-2">
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
              Cập nhật bài đọc
              {isLoading && <Loader className="animate-spin" size={17} />}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
