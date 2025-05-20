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
import { Loader, Plus, SquarePen, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { FullTestService } from "@/services/full-test";
import { QuestionList } from "./question-list";
import { ReadingService } from "@/services/reading";
import { ListeningService } from "@/services/listening";
import { WritingService } from "@/services/writing";
import { ModalUpdateReading } from "./reading/modal.update";
import { ModalUpdateListening } from "./listening/modal.update";
import { ModalUpdateWriting } from "./writing/modal.update";
import { QuestionsService } from "@/services/questions";
import { log } from "console";

interface Question {
  q_type: "MP" | "FB";
  question?: string;
  choices?: string[];
  answers?: string[];
  start_passage?: string;
  end_passage?: string;
  isMultiple?: boolean;
  image?: string;
  topic?: string;
}

interface FullTestDetails {
  _id: string;
  name: string;
  thumbnail: string;
  description: string;
  r_id: string;
  l_id: string;
  w_id: string;
  created_at: string;
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

interface ListeningData {
  created_at: string;
  name: string;
  parts: string[];
  thumbnail: string;
  time: number;
  type: string;
  _id: string;
}

interface WritingData {
  created_at: string;
  name: string;
  parts: string[];
  thumbnail: string;
  time: number;
  type: string;
  _id: string;
}

export function ModalUpdateFullTest({
  fullTestData,
}: {
  fullTestData: FullTestDetails;
}) {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDOM, setIsLoadingDOM] = useState<boolean>(true);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [readings, setReadings] = useState<any>({});
  const [listenings, setListenings] = useState<any>({});
  const [writings, setWritings] = useState<any>({});
  const [readingUpdateData, setReadingUpdateData] = useState<any>(null);
  const [listeningUpdateData, setListeningUpdateData] = useState<any>(null);
  const [writingUpdateData, setWritingUpdateData] = useState<any>(null);
  const [isLoadingForDelete, setIsLoadingForDelete] = useState<boolean>(false);

  const init = async () => {
    try {
      const resR = await ReadingService.getReadingById(fullTestData.r_id);
      const resL = await ListeningService.getListeningById(fullTestData.l_id);
      const resW = await WritingService.getWritingById(fullTestData.w_id);

      if (resR) {
        setReadings(resR);
      } else {
        setReadings({} as ReadingData);
      }

      if (resL) {
        setListenings(resL);
      } else {
        setListenings({} as ListeningData);
      }

      if (resW) {
        setWritings(resW);
      } else {
        setWritings({} as WritingData);
      }
    } catch (error) {
      console.error("Failed to fetch tests:", error);
      setReadings({} as ReadingData);
      setListenings({} as ListeningData);
      setWritings({} as WritingData);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách bài test.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handleReadingUpdate = (body: any) => {
    // console.log("Reading update data:", body);

    setReadingUpdateData(body);
  };
  const handleListeningUpdate = (body: any) => {
    setListeningUpdateData(body);
  };

  const handleWritingUpdate = (body: any) => {
    setWritingUpdateData(body);
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

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const thumbnailUrl = await handleImageUpload(mainPreview!);

      const body = {
        name: name,
        thumbnail: thumbnailUrl || mainPreview,
        description: description || "",
        tests: [
          {
            _id: fullTestData.r_id,
            skill: "R",
            parts: readingUpdateData!.parts,
            name: readingUpdateData!.name,
            thumbnail: readingUpdateData!.thumbnail,
            time: readingUpdateData!.time,
          },
          {
            _id: fullTestData.l_id,
            skill: "L",
            parts: listeningUpdateData!.parts,
            name: listeningUpdateData!.name,
            thumbnail: listeningUpdateData!.thumbnail,
            time: listeningUpdateData!.time,
          },
          {
            _id: fullTestData.w_id,
            skill: "W",
            parts: writingUpdateData!.parts,
            name: writingUpdateData!.name,
            thumbnail: writingUpdateData!.thumbnail,
            time: writingUpdateData!.time,
          },
        ],
      };

      // console.log("FullTest body:", body);

      // console.log("FullTest data JSON:", JSON.stringify(body));

      const response = await FullTestService.updateFullTest(
        fullTestData._id,
        body
      );

      if (response) {
        toast({
          title: "Thành công",
          description: "Bài viết đã được cập nhật thành công.",
        });
        setMainPreview(null);
        setName("");
        setDescription("");
      }

      window.location.href = "/?tab=full-test";
    } catch (error) {
      console.error("Failed to create FullTest:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo bài test. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoadingForDelete(true);
    const response = await FullTestService.deleteFullTest(fullTestData?._id);
    setIsLoadingForDelete(false);
    window.location.href = "/?tab=full-test";
  };

  const updateDOM = async (fullTestData: FullTestDetails) => {
    if (fullTestData) {
      setName(fullTestData.name);
      setDescription(fullTestData.description);
      setMainPreview(fullTestData.thumbnail);
    }
  };

  const updateDOMReading = async (readingData: ReadingData) => {
    if (!readingData || !readingData.parts) {
      setListeningUpdateData(null);
      return;
    }
    try {
      const [readingParts1, readingParts2, readingParts3] = await Promise.all([
        QuestionsService.getQuestionsById(readingData.parts[0]),
        QuestionsService.getQuestionsById(readingData.parts[1]),
        QuestionsService.getQuestionsById(readingData.parts[2]),
      ]);

      if (!readingParts1 || !readingParts2 || !readingParts3) {
        throw new Error("Failed to fetch one or more reading parts.");
      }

      const updatedParts = [
        {
          _id: readingParts1._id || "",
          image: readingParts1.image || "",
          content: readingParts1.content || "",
          part_num: 1,
          question: (readingParts1.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          tempQuestions: (readingParts1.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          selectedQuestionType: null,
        },
        {
          _id: readingParts2._id || "",
          image: readingParts2.image || "",
          content: readingParts2.content || "",
          part_num: 2,
          question: (readingParts2.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          tempQuestions: (readingParts2.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          selectedQuestionType: null,
        },
        {
          _id: readingParts3._id || "",
          image: readingParts3.image || "",
          content: readingParts3.content || "",
          part_num: 3,
          question: (readingParts3.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          tempQuestions: (readingParts3.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          selectedQuestionType: null,
        },
      ];

      // Transform questions for each part
      const transformedParts = updatedParts.map((part) => ({
        _id: part._id,
        image: part.image,
        content: part.content,
        part_num: part.part_num,
        question: part.question.map((question: any) => {
          const transformedQuestion = { ...question };
          if (question.q_type === "MP") {
            transformedQuestion.isMultiple = (question.answer?.length || 0) > 1;
          } else if (question.q_type === "FB") {
            transformedQuestion.image = "";
          }
          return transformedQuestion;
        }),
      }));

      // Prepare the body for updating reading data
      const body = {
        parts: transformedParts,
        name: readingData.name || "",
        thumbnail: readingData.thumbnail || "",
        time: readingData.time || 60,
        _id: readingData._id || "",
      };

      // Update state with transformed data
      setReadingUpdateData(body);
    } catch (error) {
      console.error("Error in updateDOMReading:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu bài đọc. Vui lòng thử lại.",
      });
      setReadingUpdateData(null);
    }
  };

  const updateDOMListening = async (listeningData: ListeningData) => {
    if (!listeningData || !listeningData.parts) {
      setListeningUpdateData(null);
      return;
    }

    try {
      // Fetch questions for each part concurrently
      const [listeningParts1, listeningParts2, listeningParts3, listeningParts4] = await Promise.all([
        QuestionsService.getQuestionsById(listeningData.parts[0]),
        QuestionsService.getQuestionsById(listeningData.parts[1]),
        QuestionsService.getQuestionsById(listeningData.parts[2]),
        QuestionsService.getQuestionsById(listeningData.parts[3]),
      ]);

      // Validate fetched data
      if (!listeningParts1 || !listeningParts2 || !listeningParts3 || !listeningParts4) {
        throw new Error("Failed to fetch one or more listening parts.");
      }

      // Transform parts data
      const updatedParts = [
        {
          _id: listeningParts1._id || "",
          image: listeningParts1.image || "",
          audio: listeningParts1.audio || "",
          part_num: 1,
          question: (listeningParts1.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          tempQuestions: (listeningParts1.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          selectedQuestionType: null,
        },
        {
          _id: listeningParts2._id || "",
          image: listeningParts2.image || "",
          audio: listeningParts2.audio || "",
          part_num: 2,
          question: (listeningParts2.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          tempQuestions: (listeningParts2.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          selectedQuestionType: null,
        },
        {
          _id: listeningParts3._id || "",
          image: listeningParts3.image || "",
          audio: listeningParts3.audio || "",
          part_num: 3,
          question: (listeningParts3.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          tempQuestions: (listeningParts3.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          selectedQuestionType: null,
        },
        {
          _id: listeningParts4._id || "",
          image: listeningParts4.image || "",
          audio: listeningParts4.audio || "",
          part_num: 4,
          question: (listeningParts4.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          tempQuestions: (listeningParts4.question || []).map((q: any) => ({
            ...q,
            answer: q.answer || q.answers || [],
          })),
          selectedQuestionType: null,
        },
      ];

      // Transform questions for each part
      const transformedParts = updatedParts.map((part) => ({
        _id: part._id,
        image: part.image,
        audio: part.audio,
        part_num: part.part_num,
        question: part.question.map((question: any) => {
          const transformedQuestion = { ...question };
          if (question.q_type === "MP") {
            transformedQuestion.isMultiple = (question.answer?.length || 0) > 1;
          } else if (question.q_type === "FB") {
            transformedQuestion.image = "";
          }
          return transformedQuestion;
        }),
      }));

      // Prepare the body for updating listening data
      const body = {
        parts: transformedParts,
        name: listeningData.name || "",
        thumbnail: listeningData.thumbnail || "",
        time: listeningData.time || 60,
        _id: listeningData._id || "",
      };

      // Update state with transformed data
      setListeningUpdateData(body);
    } catch (error) {
      console.error("Error in updateDOMListening:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu bài nghe. Vui lòng thử lại.",
      });
      setListeningUpdateData(null);
    }
  };

  const updateDOMWriting = async (writingData: WritingData) => {
    if (!writingData || !writingData.parts) {
      setListeningUpdateData(null);
      return;
    }

    try {
      const [writingParts1, writingParts2] = await Promise.all([
        QuestionsService.getQuestionsById(writingData.parts[0]),
        QuestionsService.getQuestionsById(writingData.parts[1]),
      ]);

      const updatedParts = [
        {
          _id: writingData.parts[0] || "",
          image: writingParts1.image || "",
          content:
            writingParts1.content || writingParts1.question?.[0]?.content || "",
          part_num: 1,
          questions: (writingParts1.question || []).map((q: any) => ({
            _id: q._id || "",
            q_type: "W" as const,
            image: q.image || "",
            topic: q.topic || "",
          })),
          tempQuestions: [],
        },
        {
          _id: writingData.parts[1] || "",
          image: writingParts2.image || "",
          content:
            writingParts2.content || writingParts2.question?.[0]?.content || "",
          part_num: 2,
          questions: (writingParts2.question || []).map((q: any) => ({
            _id: q._id || "",
            q_type: "W" as const,
            image: q.image,
            topic: q.topic || "",
          })),
          tempQuestions: [],
        },
      ];

      const transformedParts = await Promise.all(
        updatedParts.map(async (part) => {
          const transformedQuestions = await Promise.all(
            part.questions.map(async (question: any) => ({
              _id: question._id,
              part_id: part._id,
              q_type: "W" as const,
              image: question.image,
              topic: question.topic,
            }))
          );

          return {
            _id: part._id,
            part_num: part.part_num,
            question: transformedQuestions,
          };
        })
      );

      const body = {
        // skill: "W",
        parts: transformedParts,
        name: writingData.name || "",
        thumbnail: writingData.thumbnail || "",
        time: writingData.time || 60,
        _id: writingData._id || "",
      };

      // Update state with transformed data
      setWritingUpdateData(body);
      setIsLoadingDOM(false);
      console.log("Writing update data:", body);

    } catch (error) {
      console.error("Failed to fetch writing parts:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu phần bài viết.",
      });
    }
  };

  useEffect(() => {
    updateDOM(fullTestData);
    updateDOMReading(readings);
    updateDOMListening(listenings);
    updateDOMWriting(writings);
  }, [fullTestData, readings, listenings, writings]);


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
            <span className="!text-[20px]">Chỉnh sửa bài test</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Sửa thông tin bài test và nhấn{" "}
              <strong className="text-indigo-600">Lưu bài test</strong> để lưu
              thông tin mới.
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
                Tên bài test
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên bài test"
                  className="col-span-3 p-2 border border-[#CFCFCF] placeholder-custom rounded"
                ></textarea>
              </div>
              <Label htmlFor="description" className="text-[14.5px]">
                Mô tả bài test
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả bài test"
                  className="col-span-3 p-2 border border-[#CFCFCF] placeholder-custom rounded"
                ></textarea>
              </div>
              <div className="mt-2 flex flex-row items-start gap-2">
                <ModalUpdateReading
                  data={readings}
                  onUpdate={handleReadingUpdate}
                />
                <ModalUpdateListening
                  data={listenings}
                  onUpdate={handleListeningUpdate}
                />
                <ModalUpdateWriting
                  data={writings}
                  onUpdate={handleWritingUpdate}
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
              disabled={isLoading}
            >
              Lưu bài test
              {isLoading && <Loader className="animate-spin" size={17} />}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}
