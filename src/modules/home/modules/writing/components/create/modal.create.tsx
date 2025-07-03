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
import { Loader, Plus, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { ModalCreateWritingDetail } from "./modal.create.detail";
import { WritingService } from "@/services/writing";

interface Question {
  q_type: "W";
  image: string;
  topic: string;
}

interface PartDetails {
  image: string;
  content: string;
  part_num: number;
  questions: Question[];
  tempQuestions: Question[];
}

export function ModalCreateWriting() {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [time, setTime] = useState<number>(0);

  const [parts, setParts] = useState<PartDetails[]>([
    {
      image: "",
      content: "",
      part_num: 1,
      questions: [],
      tempQuestions: [],
    },
    {
      image: "",
      content: "",
      part_num: 2,
      questions: [],
      tempQuestions: [],
    },
  ]);

  const [selectedTestType, setSelectedTestType] = useState<string>("");

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
        title: "Vui lòng nhập tên bài viết.",
      });
      return false;
    }

    if (time <= 0) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập thời gian làm bài hợp lệ.",
      });
      return false;
    }

    return true;
  };

  const handleTestTypeChange = (value: string) => {
    setSelectedTestType(value);
    let numParts = 1;
    if (value === "test-part-1") numParts = 1;
    else if (value === "test-full") numParts = 2;
    setParts(
      Array.from({ length: numParts }, (_, i) => ({
        image: "",
        content: "",
        part_num: i + 1,
        questions: [],
        tempQuestions: [],
      }))
    );
  };

  const handleImageUpload = useCallback(
    async (dataUrl: string) => {
      if (!dataUrl.startsWith("data:image")) return "";
      const file = base64ToFile(dataUrl);
      try {
        const uploadResponse = await UploadService.uploadToCloudinary([file]);
        if (
          uploadResponse &&
          Array.isArray(uploadResponse) &&
          uploadResponse[0]
        ) {
          return uploadResponse[0]?.secure_url || "";
        }
        throw new Error("Upload failed");
      } catch (error) {
        console.error("Image upload failed:", error);
        toast({
          variant: "destructive",
          title: "Lỗi khi tải ảnh lên.",
        });
        return "";
      }
    },
    [toast]
  );

  const base64ToFile = (base64String: string): File => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
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

    try {
      const thumbnailUrl = await handleImageUpload(mainPreview!);

      const transformedParts = await Promise.all(
        parts.map(async (part) => {
          const transformedQuestions = await Promise.all(
            part.questions.map(async (question) => ({
              q_type: "W" as const,
              image: question.image,
              topic: question.topic,
            }))
          );

          return {
            part_num: part.part_num,
            questions: transformedQuestions,
          };
        })
      );

      const body = {
        skill: "W",
        parts: transformedParts,
        name: name,
        thumbnail: thumbnailUrl,
        time: time,
      };

      const response = await WritingService.createWriting(body);
      if (response) {
        toast({
          title: "Thành công",
          description: "Bài viết đã được tạo thành công.",
        });
        setMainPreview(null);
        setName("");
        setTime(0);
        setParts([
          {
            image: "",
            content: "",
            part_num: 1,
            questions: [],
            tempQuestions: [],
          },
          {
            image: "",
            content: "",
            part_num: 2,
            questions: [],
            tempQuestions: [],
          },
        ]);
      }

      window.location.href = "/?tab=writing";
    } catch (error) {
      console.error("Failed to create writing:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo bài viết. Vui lòng thử lại.",
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
          <Plus size={16} className="mr-2" /> Thêm bài viết
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Thêm bài viết mới</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Điền thông tin bài viết và nhấn{" "}
              <strong className="text-indigo-600">Tạo bài viết</strong> để tạo
              bài viết mới.
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
                Tên bài viết
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên bài viết"
                  className="col-span-3 p-2 border border-[#CFCFCF] placeholder-custom rounded"
                ></textarea>
              </div>
              <Label htmlFor={`time`} className="text-[14.5px]">
                Thời gian làm bài (phút)
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
                <ModalCreateWritingDetail
                  parts={parts}
                  onPartsUpdate={handlePartsUpdate}
                  selectedTestType={selectedTestType}
                  onTestTypeChange={handleTestTypeChange}
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
            disabled={isLoading}
          >
            Tạo bài viết
            {isLoading && <Loader className="animate-spin" size={17} />}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
