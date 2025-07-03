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
import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { FullTestService } from "@/services/full-test";
import { QuestionList } from "./question-list";
import { ReadingService } from "@/services/reading";
import { ListeningService } from "@/services/listening";
import { WritingService } from "@/services/writing";
import { QuestionsService } from "@/services/questions";
import { read } from "fs";

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
  name: string;
  thumbnail: string;
  description: string;
  r_id: string;
  l_id: string;
  w_id: string;
  created_at: string;
}

interface ReadingTest {
  image: string;
  content: string;
  part_num: number;
  questions: Question[];
}

interface ListeningTest {
  audio: string;
  part_num: number;
  questions: Question[];
}

interface WritingTest {
  part_num: number;
  questions: Question[];
}

interface TestData {
  test: any; // Full test details from service
  parts: any[]; // Array of response objects for each part
}

export function ModalCreateFullTest() {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [readings, setReadings] = useState([]);
  const [listenings, setListenings] = useState([]);
  const [writings, setWritings] = useState([]);
  const [selectedReadingId, setSelectedReadingId] = useState<string>("");
  const [selectedListeningId, setSelectedListeningId] = useState<string>("");
  const [selectedWritingId, setSelectedWritingId] = useState<string>("");
  const [readingData, setReadingData] = useState<TestData | null>(null);
  const [listeningData, setListeningData] = useState<TestData | null>(null);
  const [writingData, setWritingData] = useState<TestData | null>(null);

  const [readingSubmitFormat, setReadingSubmitFormat] = useState<any>({
    skill: "R",
    parts: [{}],
    name: "",
    time: 60,
  });
  const [listeningSubmitFormat, setListeningSubmitFormat] = useState<any>({
    skill: "L",
    parts: [{}],
    name: "",
    time: 60,
  });
  const [writingSubmitFormat, setWritingSubmitFormat] = useState<any>({
    skill: "W",
    parts: [{}],
    name: "",
    time: 60,
  });

  const init = async () => {
    try {
      const resR = await ReadingService.getAll();
      const resL = await ListeningService.getAll();
      const resW = await WritingService.getAll();

      if (resR && resR?.data?.length > 0) {
        const filterResR = resR.data.filter(
          (item: any) => item.parts && item.parts.length === 3
        );
        setReadings(filterResR);
      } else {
        setReadings([]);
      }

      if (resL && resL?.data?.length > 0) {
        const filterResL = resL.data.filter(
          (item: any) => item.parts && item.parts.length === 4
        );
        setListenings(filterResL);
      } else {
        setListenings([]);
      }

      if (resW && resW?.data?.length > 0) {
        const filterResW = resW.data.filter(
          (item: any) => item.parts && item.parts.length === 2
        );
        setWritings(filterResW);
      } else {
        setWritings([]);
      }
    } catch (error) {
      console.error("Failed to fetch tests:", error);
      setReadings([]);
      setListenings([]);
      setWritings([]);
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

  const getDataFromExistedTest = async (
    rId: string,
    lId: string,
    wId: string
  ) => {
    if (!rId && !lId && !wId) {
      setReadingData(null);
      setListeningData(null);
      setWritingData(null);
      setReadingSubmitFormat({
        skill: "R",
        parts: [{}],
        name: "",
        time: 60,
      });
      setListeningSubmitFormat({
        skill: "L",
        parts: [{}],
        name: "",
        time: 60,
      });
      setWritingSubmitFormat({
        skill: "W",
        parts: [{}],
        name: "",
        time: 60,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Fetch Reading Test
      let readingTestData: TestData | null = null;
      if (rId) {
        const resR = await ReadingService.getReadingById(rId);
        if (resR) {
          const readingParts = await Promise.all(
            resR.parts.map(async (partId: string) => {
              try {
                const res = await QuestionsService.getQuestionsById(partId);
                return res || {};
              } catch (error) {
                console.error(
                  `Failed to fetch questions for part ${partId}:`,
                  error
                );
                return {};
              }
            })
          );
          readingTestData = {
            test: resR,
            parts: readingParts,
          };

          // Construct readingSubmitFormat
          const readingPartsFormatted = readingParts.map(
            (partResponse, index) => {
              const partQuestions = partResponse;
              if (!Array.isArray(partQuestions)) {
                return {
                  image: partResponse.image || "",
                  content: partResponse.content || "",
                  part_num: index + 1,
                  questions: Array.isArray(partQuestions.question)
                    ? partQuestions.question.map(
                        (q: {
                          _id: string;
                          part_id: string;
                          [key: string]: any;
                        }) => {
                          const { _id, part_id, ...rest } = q;
                          return rest;
                        }
                      )
                    : [],
                };
              }
            }
          );

          setReadingSubmitFormat({
            skill: "R",
            parts:
              readingPartsFormatted.length > 0 ? readingPartsFormatted : [{}],
            name: resR.name || "",
            time: resR.time || 60,
          });
        }
      }

      // Fetch Listening Test
      let listeningTestData: TestData | null = null;
      if (lId) {
        const resL = await ListeningService.getListeningById(lId);
        if (resL) {
          const listeningParts = await Promise.all(
            resL.parts.map(async (partId: string) => {
              try {
                const res = await QuestionsService.getQuestionsById(partId);
                return res || {};
              } catch (error) {
                console.error(
                  `Failed to fetch questions for listening part ${partId}:`,
                  error
                );
                return [];
              }
            })
          );
          listeningTestData = {
            test: resL,
            parts: listeningParts,
          };

          // Construct listeningSubmitFormat
          const listeningPartsFormatted = listeningParts.map(
            (partResponse, index) => {
              const partQuestions = partResponse;
              if (!Array.isArray(partQuestions)) {
                return {
                  audio: partResponse.audio || "",
                  part_num: index + 1,
                  questions: Array.isArray(partQuestions.question)
                    ? partQuestions.question.map(
                        (q: {
                          _id: string;
                          part_id: string;
                          [key: string]: any;
                        }) => {
                          const { _id, part_id, ...rest } = q;
                          return rest;
                        }
                      )
                    : [],
                };
              }
            }
          );

          setListeningSubmitFormat({
            skill: "L",
            parts:
              listeningPartsFormatted.length > 0
                ? listeningPartsFormatted
                : [{}],
            name: resL.name || "",
            time: resL.time || 60,
          });
        }
      }

      // Fetch Writing Test
      let writingTestData: TestData | null = null;
      if (wId) {
        const resW = await WritingService.getWritingById(wId);
        if (resW) {
          const writingParts = await Promise.all(
            resW.parts.map(async (partId: string) => {
              try {
                const res = await QuestionsService.getQuestionsById(partId);
                return res || {};
              } catch (error) {
                console.error(
                  `Failed to fetch questions for writing part ${partId}:`,
                  error
                );
                return [];
              }
            })
          );
          writingTestData = {
            test: resW,
            parts: writingParts,
          };

          // Construct writingSubmitFormat
          const writingPartsFormatted = writingParts.map(
            (partResponse, index) => {
              const partQuestions = partResponse;
              if (!Array.isArray(partQuestions)) {
                return {
                  part_num: index + 1,
                  questions: Array.isArray(partQuestions.question)
                    ? partQuestions.question.map(
                        (q: {
                          _id: string;
                          part_id: string;
                          [key: string]: any;
                        }) => {
                          const { _id, part_id, ...rest } = q;
                          return rest;
                        }
                      )
                    : [],
                };
              }
            }
          );

          setWritingSubmitFormat({
            skill: "W",
            parts:
              writingPartsFormatted.length > 0 ? writingPartsFormatted : [{}],
            name: resW.name || "",
            time: resW.time || 60,
          });
        }
      }

      // Update state with fetched data
      setReadingData(readingTestData);
      setListeningData(listeningTestData);
      setWritingData(writingTestData);

      // console.log("Fetched test data:", {
      //   reading: readingTestData,
      //   listening: listeningTestData,
      //   writing: writingTestData,
      // });
      console.log("Submit formats:", {
        readingSubmitFormat,
        listeningSubmitFormat,
        writingSubmitFormat,
      });
    } catch (error) {
      console.error("Failed to fetch test data:", error);
      setReadingData(null);
      setListeningData(null);
      setWritingData(null);
      setReadingSubmitFormat({
        skill: "R",
        parts: [{}],
        name: "",
        time: 60,
      });
      setListeningSubmitFormat({
        skill: "L",
        parts: [{}],
        name: "",
        time: 60,
      });
      setWritingSubmitFormat({
        skill: "W",
        parts: [{}],
        name: "",
        time: 60,
      });
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu bài test. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDataFromExistedTest(
      selectedReadingId,
      selectedListeningId,
      selectedWritingId
    );
  }, [selectedReadingId, selectedListeningId, selectedWritingId]);

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

    if (!selectedReadingId) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn bài đọc.",
      });
      return false;
    }

    if (!selectedListeningId) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn bài nghe.",
      });
      return false;
    }

    if (!selectedWritingId) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn bài viết.",
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
        name,
        thumbnail: thumbnailUrl,
        description:
          description ||
          "The Official Test with IELTS Reading and Listening test questions is designed in the format of a mock exam.",
        tests: [
          readingSubmitFormat,
          listeningSubmitFormat,
          writingSubmitFormat,
        ],
      };

      const response = await FullTestService.createFullTest(body);

      if (response) {
        toast({
          title: "Thành công",
          description: "Bài viết đã được tạo thành công.",
        });
        setMainPreview(null);
        setName("");
        setDescription("");
        setSelectedReadingId("");
        setSelectedListeningId("");
        setSelectedWritingId("");
      }

      window.location.href = "/?tab=full-test";
    } catch (error) {
      console.error("Failed to create FullTest:", error);
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
          <Plus size={16} className="mr-2" /> Thêm bài test
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Thêm bài test mới</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Điền thông tin bài test và nhấn{" "}
              <strong className="text-indigo-600">Tạo bài test</strong> để tạo
              bài test mới.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex flex-row justify-start items-center gap-2">
            <button
              className={`border rounded-xl px-5 py-1 border-indigo-600 bg-indigo-600 text-white`}
            >
              Ghép bài test
            </button>
            <button className={`border rounded-xl px-5 py-1 text-black`}>
              Tạo Full Test
            </button>
          </div>
        </div>
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
                <QuestionList
                  title="Đọc"
                  data={readings}
                  onSelect={setSelectedReadingId}
                  selectedId={selectedReadingId}
                />
                <QuestionList
                  title="Nghe"
                  data={listenings}
                  onSelect={setSelectedListeningId}
                  selectedId={selectedListeningId}
                />
                <QuestionList
                  title="Viết"
                  data={writings}
                  onSelect={setSelectedWritingId}
                  selectedId={selectedWritingId}
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
            Tạo bài test
            {isLoading && <Loader className="animate-spin" size={17} />}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
