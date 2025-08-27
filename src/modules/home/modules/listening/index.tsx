/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import { ModalCreateListening } from "./components/create/modal.create";
import { useEffect, useRef, useState } from "react";
import { FileUp, Loader } from "lucide-react";
import { IMAGES } from "@/utils/image";
import { ModalUpdateListening } from "./components/update/modal.update";
import { ListeningService } from "@/services/listening";
import { FileService } from "@/services/file";
import { ReadingService } from "@/services/reading";
import { ModalCreateListeningDetail } from "./components/create/modal.create.detail";

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

export default function Listening() {
  const COUNT = 5;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(0);
  const [currenPage, setCurrenPage] = useState(1);
  const [currenData, setCurrenData] = useState([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>(
    {}
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // State for AI generated data and modal control
  const [aiGeneratedData, setAiGeneratedData] =
    useState<AIGeneratedData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCreateDetailModalOpen, setIsCreateDetailModalOpen] =
    useState<boolean>(false);
  const [aiFormattedOutput, setAiFormattedOutput] = useState<any>(null);

  const selectPage = (pageSelected: any) => {
    setCurrenPage(pageSelected);
    const start = (pageSelected - 1) * COUNT;
    const end = pageSelected * COUNT;
    setCurrenData(data.slice(start, end));
  };

  const prevPage = () => {
    if (currenPage > 1) {
      selectPage(currenPage - 1);
    }
  };

  const nextPage = () => {
    if (currenPage < totalPage) {
      selectPage(currenPage + 1);
    }
  };

  const render = (rawData: any) => {
    const filteredData = rawData.filter(
      (item: any) => item.thumbnail !== "" && !item.deleted_at
    );
    setData(filteredData);
    setTotalPage(Math.ceil(filteredData.length / COUNT));
    setCurrenPage(1);
    setCurrenData(filteredData.slice(0, COUNT));
  };

  const handleUploadFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Parse AI response and format it for the create modal
  const parseAIResponse = (outputUrl: any): AIGeneratedData => {
    let formattedData: AIGeneratedData = {
      name: "",
      time: 60, // Default time
      parts: [],
    };

    try {
      // If outputUrl is already an object
      if (typeof outputUrl === "object" && outputUrl !== null) {
        // Extract title/name from various possible formats
        formattedData.name =
          outputUrl.title ||
          outputUrl.name ||
          outputUrl.reading_title ||
          "New Reading Test";

        // Extract time from various possible formats
        formattedData.time =
          outputUrl.time || outputUrl.duration || outputUrl.reading_time || 60;

        // Process parts based on different possible structures
        if (outputUrl.passages && Array.isArray(outputUrl.passages)) {
          // Format: { passages: [{ text, questions }] }
          formattedData.parts = outputUrl.passages.map(
            (passage: any, index: number) => ({
              content: passage.text || passage.content || "",
              part_num: passage.part_num || index + 1,
              questions: formatQuestions(passage.questions || []),
            })
          );
        } else if (outputUrl.parts && Array.isArray(outputUrl.parts)) {
          // Format: { parts: [{ content, questions }] }
          formattedData.parts = outputUrl.parts.map(
            (part: any, index: number) => ({
              content: part.content || part.text || "",
              part_num: part.part_num || index + 1,
              questions: formatQuestions(part.questions || []),
            })
          );
        } else if (outputUrl.sections && Array.isArray(outputUrl.sections)) {
          // Format: { sections: [{ content, questions }] }
          formattedData.parts = outputUrl.sections.map(
            (section: any, index: number) => ({
              content: section.content || section.text || "",
              part_num: section.part_num || index + 1,
              questions: formatQuestions(section.questions || []),
            })
          );
        } else if (outputUrl.content || outputUrl.text) {
          // Single passage format
          formattedData.parts = [
            {
              content: outputUrl.content || outputUrl.text || "",
              part_num: 1,
              questions: formatQuestions(outputUrl.questions || []),
            },
          ];
        }
      }

      return formattedData;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return formattedData;
    }
  };

  // Helper function to format questions based on their type
  const formatQuestions = (questions: any[]): any[] => {
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
          return q;
      }
    });
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const formData = new FormData();
    console.log("========= file", file);
    formData.append("file", file);
    setIsUploading(true);
    try {
      // Check if file is a PDF
      if (file.type !== "application/pdf") {
        throw new Error("Only PDF files are supported");
      }

      // console.log("Starting file upload process...");
      const result = await FileService.uploadFile(formData);
      // console.log("========= upload result", result);

      if (!result || !result.file_id) {
        throw new Error("Failed to upload file: No file ID returned");
      }

      // console.log("File uploaded successfully, retrieving content...");
      const fileData = await FileService.getFileById(result.file_id);
      // console.log(
      //   "========= file data retrieved, length:",
      //   fileData?.file_content?.length || 0
      // );

      if (!fileData || !fileData.file_content) {
        throw new Error("Failed to get file content");
      }

      // console.log("Processing file with AI...");
      const body = {
        test_type: "L",
        content: fileData.file_content,
      };

      console.log("========= body", body);

      const outputUrl = await ReadingService.createReadingFileAi(
        JSON.stringify(body)
      );

      console.log("========= outputUrl", outputUrl);

      // Format outputUrl to correct JSON form
      let formattedOutput;
      try {
        // Check if outputUrl is already a JSON object
        if (typeof outputUrl === "object" && outputUrl !== null) {
          formattedOutput = outputUrl;
        }
        // Check if it's a JSON string
        else if (typeof outputUrl === "string") {
          try {
            formattedOutput = JSON.parse(outputUrl);
          } catch (parseError) {
            // If it's not valid JSON, try to clean it up
            // Remove any leading/trailing non-JSON characters
            let jsonString = outputUrl.trim();

            // Find the first { and last } to extract valid JSON
            const firstBrace = jsonString.indexOf("{");
            const lastBrace = jsonString.lastIndexOf("}");

            if (
              firstBrace !== -1 &&
              lastBrace !== -1 &&
              lastBrace > firstBrace
            ) {
              jsonString = jsonString.substring(firstBrace, lastBrace + 1);
              try {
                formattedOutput = JSON.parse(jsonString);
              } catch (nestedError) {
                // If still not valid, try to fix common JSON issues
                // Replace single quotes with double quotes
                jsonString = jsonString.replace(/'/g, '"');
                // Fix unquoted keys
                jsonString = jsonString.replace(/(\w+):/g, '"$1":');
                formattedOutput = JSON.parse(jsonString);
              }
            } else {
              throw new Error(
                "Could not find valid JSON structure in response"
              );
            }
          }
        } else {
          throw new Error("Invalid response format");
        }

        console.log("========= formatted output", formattedOutput);
        setAiFormattedOutput(formattedOutput);

        // If we successfully parsed the JSON but it's still not in the right format,
        // try to extract the relevant data
        if (formattedOutput && typeof formattedOutput === "object") {
          // If the response contains nested JSON as a string, parse that too
          if (
            typeof formattedOutput.outputUrl === "string" &&
            formattedOutput.outputUrl.includes("{")
          ) {
            try {
              const nestedJson = JSON.parse(formattedOutput.outputUrl);
              formattedOutput = nestedJson;
              setAiFormattedOutput(nestedJson);
            } catch (nestedError) {
              // If nested parsing fails, keep the original parsed object
              console.warn(
                "Failed to parse nested JSON in outputUrl",
                nestedError
              );
            }
          }
        }

        // Parse AI response and open create modal
        const parsedData = parseAIResponse(formattedOutput);
        setAiGeneratedData(parsedData);
        setIsCreateModalOpen(true);
      } catch (jsonError) {
        console.error(
          "Failed to parse response as JSON:",
          jsonError,
          "Original response:",
          outputUrl
        );
        throw new Error("Failed to parse response from server");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload file:", error);

      alert(
        "Failed to upload file: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Function to open the create detail modal with AI generated data
  const openCreateDetailModal = () => {
    setIsCreateDetailModalOpen(true);
  };

  const init = async () => {
    try {
      setIsLoading(true);
      const res = await ListeningService.getAll();
      if (res && res?.data?.length > 0) {
        render(res.data);
      } else {
        setData([]);
        setCurrenData([]);
        setQuestionCounts({});
      }
    } catch (error) {
      console.error("Failed to fetch listening:", error);
      setData([]);
      setCurrenData([]);
      setQuestionCounts({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <section className="p-4">
      <div className="relative overflow-hidden">
        <div className="flex">
          <div className="flex items-center flex-1">
            <h5>
              <span className="text-gray-800 text-[20px] font-bold">
                DANH SÁCH BÀI NGHE{" "}
                <span className="text-indigo-600">({data?.length})</span>
              </span>
            </h5>
          </div>
          <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
            <ModalCreateListening
              isOpen={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              aiGeneratedData={aiGeneratedData}
              aiFormattedOutput={aiFormattedOutput}
            />
            <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
              <button
                type="button"
                onClick={handleUploadFile}
                disabled={isUploading}
                className="flex items-center justify-center text-indigo-600 bg-white border border-indigo-600 hover:opacity-80 disabled:bg-gray-400 font-medium rounded-lg text-md px-5 py-2 text-center"
              >
                {isUploading ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" /> Đang xử
                    lý nội dung ...
                  </>
                ) : (
                  <>
                    <FileUp size={16} className="mr-2" /> Tải file lên
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="*/*"
              />
            </div>
          </div>
        </div>
        <div className="h-[640px] flex flex-col justify-between">
          {isLoading ? (
            <div className="w-full flex justify-center items-center pt-72">
              <Loader className="animate-spin text-indigo-600" size={36} />
            </div>
          ) : currenData.length === 0 ? (
            <div className="col-span-2 text-center w-full flex justify-center items-center py-4">
              <p className="text-gray-500 text-lg">
                Không tìm thấy bài đọc nào.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-md text-gray-700 uppercase bg-gray-50 border dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="w-64 px-4 py-3">
                        Tên bài nghe
                      </th>
                      <th scope="col" className="w-32 px-4 py-3">
                        Passage
                      </th>
                      <th scope="col" className="w-32 px-4 py-3">
                        Câu hỏi
                      </th>
                      <th scope="col" className="w-32 px-4 py-3">
                        Thời gian làm bài
                      </th>
                      <th scope="col" className="w-32 px-4 py-3">
                        Đã làm
                      </th>
                      <th scope="col" className="w-24 px-4 py-3">
                        Chi tiết
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currenData.map((item: any, index: number) => (
                      <tr
                        key={index}
                        className="border-b border-l border-r dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="w-full px-4 py-2 grid grid-cols-12 gap-3 items-center">
                          <Image
                            src={item?.thumbnail || IMAGES.LOGO}
                            alt="img"
                            className="w-32 h-20 rounded-md object-cover col-span-3 border border-gray-300"
                            width={100}
                            height={100}
                          />
                          <span className="w-full col-span-9 text-[14px] line-clamp-2 bg-primary-100 text-gray-900 font-medium py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                            {item?.name}
                          </span>
                        </td>
                        <td className="w-32 px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {item.parts.length} phần
                        </td>
                        <td className="w-32 px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {item.number_of_questions} câu
                        </td>
                        <td className="w-32 px-14 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {item.time} phút
                        </td>
                        <td className="w-24 text-[14px] px-9 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          0
                        </td>
                        <td className="w-24 text-[14px] px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <ModalUpdateListening data={item} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <nav
                className="flex flex-col items-start justify-center mt-4 p-4 space-y-3 md:flex-row md:items-center md:space-y-0"
                aria-label="Table navigation"
              >
                <ul className="inline-flex items-stretch -space-x-px">
                  <li>
                    <button
                      onClick={prevPage}
                      disabled={currenPage === 1}
                      className="cursor-pointer flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </li>
                  {Array.from({ length: totalPage }, (_, i) => i + 1).map(
                    (item, index) => (
                      <li key={index} onClick={() => selectPage(item)}>
                        <a
                          href="#"
                          className={`${
                            item === currenPage
                              ? "bg-indigo-50 hover:bg-indigo-100 text-gray-700"
                              : "bg-white"
                          } flex items-center justify-center px-3 py-2 text-sm leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700`}
                        >
                          {item}
                        </a>
                      </li>
                    )
                  )}
                  <li>
                    <button
                      onClick={nextPage}
                      disabled={currenPage === totalPage}
                      className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
