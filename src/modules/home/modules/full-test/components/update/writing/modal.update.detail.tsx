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
import { Loader, Plus, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ProductDescriptionEditor from "../../quill";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import Image from "next/image";
import { UploadService } from "@/services/upload";

interface Question {
  _id: string;
  q_type: "W";
  image: string;
  topic: string;
}

interface PartDetails {
  _id: string;
  image: string;
  content: string;
  part_num: number;
  questions: Question[];
  tempQuestions: Question[];
}

interface ModalUpdateWritingDetailProps {
  parts: PartDetails[];
  onPartsUpdate: (updatedParts: PartDetails[]) => void;
}

export function ModalUpdateWritingDetail({
  parts,
  onPartsUpdate,
}: ModalUpdateWritingDetailProps) {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);
  const [activePart, setActivePart] = useState<number>(1);

  const handleContentChange = useCallback(
    (content: string) => {
      const updatedParts = parts.map((part) =>
        part.part_num === activePart
          ? {
              ...part,
              content,
              questions: part.questions.length
                ? [
                    {
                      ...part.questions[0],
                      image: part.questions[0].image,
                      q_type: "W" as const,
                      topic: content,
                    } as Question,
                  ]
                : [
                    {
                      q_type: "W" as const,
                      image: part.questions[0].image,
                      topic: content,
                    } as Question,
                  ],
            }
          : part
      );

      onPartsUpdate(updatedParts);
    },
    [activePart, parts, onPartsUpdate]
  );

  const handleImageUpload = useCallback(
    async (dataUrl: string) => {
      if (!dataUrl.startsWith("data:image")) return dataUrl;
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

  const replaceBase64WithCloudUrls = async (
    htmlContent: string,
    uploadFunc: (dataUrl: string) => Promise<string>
  ) => {
    const imgTagRegex =
      /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
    let updatedContent = htmlContent;

    const matches = [...htmlContent.matchAll(imgTagRegex)];
    for (const match of matches) {
      const base64String = match[1];
      const uploadedUrl = await uploadFunc(base64String);
      if (uploadedUrl) {
        updatedContent = updatedContent.replace(base64String, uploadedUrl);
      }
    }

    return updatedContent;
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
      const imageData = reader.result as string;
      if (activePart === 1) {
        setImage1Preview(imageData);
      } else if (activePart === 2) {
        setImage2Preview(imageData);
      }
      const updatedParts = parts.map((part) =>
        part.part_num === activePart
          ? {
              ...part,
              image: imageData,
              questions: part.questions.length
                ? [
                    {
                      ...part.questions[0],
                      image: imageData,
                      q_type: "W" as const,
                    } as Question,
                  ]
                : [
                    {
                      q_type: "W" as const,
                      image: imageData,
                      topic: part.content,
                    } as Question,
                  ],
            }
          : part
      );
      onPartsUpdate(updatedParts);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateMainImage = () => {
    mainImageInputRef.current?.click();
  };

  const handleSaveQuestions = async () => {
    setIsLoading(true);
    try {
      let updatedParts = [...parts];

      // Process each part
      for (const part of updatedParts) {
        let partImageUrl = part.questions[0].image;
        let partContent = part.content;

        // Upload main image if preview exists
        if (part.part_num === 1 && image1Preview) {
          partImageUrl = await handleImageUpload(image1Preview);
        } else if (part.part_num === 2 && image2Preview) {
          partImageUrl = await handleImageUpload(image2Preview);
        }

        // Process content for embedded images
        if (part.content) {
          partContent = await replaceBase64WithCloudUrls(
            part.content,
            handleImageUpload
          );
        }

        // Create or update question
        const newQuestion: Question = {
          _id: part.questions[0]?._id,
          q_type: "W",
          image: partImageUrl || "",
          topic: partContent || "",
        };

        // Update questions array
        updatedParts = updatedParts.map((p) =>
          p.part_num === part.part_num
            ? {
                ...p,
                image: partImageUrl,
                content: partContent,
                questions: [newQuestion],
                tempQuestions: [],
              }
            : p
        );
      }

      onPartsUpdate(updatedParts);

      toast({
        title: "Đã lưu câu hỏi",
        description: "Tất cả câu hỏi và hình ảnh đã được lưu thành công.",
      });

      console.log("Updated parts:", updatedParts);

      if (dialogCloseRef.current) {
        dialogCloseRef.current.click();
      }
    } catch (error) {
      console.error("Error during save:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi lưu dữ liệu.",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasQuestions =
    (parts.find((part) => part.part_num === activePart)?.questions?.length ||
      0) > 0 ||
    parts.find((part) => part.part_num === activePart)?.content ||
    (activePart === 1 ? image1Preview : image2Preview);

  const currentPart = parts.find((part) => part.part_num === activePart);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          {hasQuestions ? (
            <>Chỉnh sửa đề bài</>
          ) : (
            <>
              <Plus size={16} className="mr-2" /> Tạo đề bài
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Cập nhật đề bài</span>
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
            <div className="grid grid-cols-12 gap-5 justify-start items-start overflow-y-auto max-h-[60vh] pr-0 scroll-bar-style">
              <div className="mt-2 col-span-4">
                <div className="mb-6">
                  <Label
                    htmlFor="thumbnail"
                    className="text-right !text-[16px]"
                  >
                    Ảnh mô tả
                  </Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      ref={mainImageInputRef}
                      onChange={handleMainImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {(activePart === 1 ? !image1Preview : !image2Preview) &&
                    !currentPart?.image &&
                    !currentPart?.questions[0]?.image ? (
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
                    ) : (
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
                            src={
                              activePart === 1
                                ? image1Preview ||
                                  currentPart?.image ||
                                  currentPart?.questions[0]?.image ||
                                  ""
                                : image2Preview ||
                                  currentPart?.image ||
                                  currentPart?.questions[0]?.image ||
                                  ""
                            }
                            alt="main-preview"
                            className="w-full h-full object-cover rounded-md mt-2 border border-gray-200"
                            width={1000}
                            height={1000}
                            onError={() =>
                              toast({
                                variant: "destructive",
                                title: "Lỗi",
                                description: "Không thể tải hình ảnh.",
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full grid items-center gap-4 col-span-8">
                <div className="w-full mt-2">
                  <ProductDescriptionEditor
                    key={`editor-${activePart}`}
                    value={
                      currentPart?.content ||
                      currentPart?.questions[0]?.topic ||
                      ""
                    }
                    onChange={handleContentChange}
                    title={`Đề bài viết ${activePart}`}
                  />
                </div>
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
              ref={dialogCloseRef}
            >
              Huỷ
            </Button>
          </DialogClose>
          <button
            type="submit"
            onClick={handleSaveQuestions}
            className="flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-md text-sm !px-10 !text-[16px] py-2.5 text-center"
            disabled={isLoading}
          >
            Lưu
            {isLoading && <Loader className="animate-spin ml-2" size={17} />}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
