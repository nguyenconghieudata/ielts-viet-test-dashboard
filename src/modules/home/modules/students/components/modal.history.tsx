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
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { HELPER } from "@/utils/helper";
import { useState } from "react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ResultData {
  type: string;
  part_id: string;
  user_answers: Object[];
  correct_count: number;
  incorrect_count: number;
  pass_count: number;
  is_complete: null;
}

interface SubmissionData {
  _id: string;
  user_id: string;
  user_email: string;
  test_id: string;
  test_type: string;
  correct_answer: number;
  incorrect_answer: number;
  result: ResultData[];
  score: number;
  user_avatar: string;
  user_name: string;
  test_name: string;
  created_at: string;
}

export function ModalHistoryUser({ data }: { data: SubmissionData[] }) {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [testType, setTestType] = useState<string | undefined>(undefined);

  const calculateScore = (correctCount: number): number => {
    if (correctCount >= 0 && correctCount <= 1) return 0;
    if (correctCount >= 2 && correctCount <= 3) return 1;
    if (correctCount >= 4 && correctCount <= 5) return 2;
    if (correctCount >= 5 && correctCount <= 6) return 3;
    if (correctCount >= 7 && correctCount <= 9) return 3.5;
    if (correctCount >= 10 && correctCount <= 12) return 4;
    if (correctCount >= 13 && correctCount <= 15) return 4.5;
    if (correctCount >= 16 && correctCount <= 19) return 5;
    if (correctCount >= 20 && correctCount <= 22) return 5.5;
    if (correctCount >= 23 && correctCount <= 26) return 6;
    if (correctCount >= 27 && correctCount <= 29) return 6.5;
    if (correctCount >= 30 && correctCount <= 32) return 7;
    if (correctCount >= 33 && correctCount <= 34) return 7.5;
    if (correctCount >= 35 && correctCount <= 36) return 8;
    if (correctCount >= 37 && correctCount <= 38) return 8.5;
    if (correctCount >= 39 && correctCount <= 40) return 9;
    return 0; // Default case
  };

  // Function to calculate totals and score for a single submission
  const getTestScore = (result: ResultData[]): { score: number } => {
    const totals = result.reduce(
      (acc, part) => ({
        correct: acc.correct + part.correct_count,
        incorrect: acc.incorrect + part.incorrect_count,
        unanswered: acc.unanswered + part.pass_count,
      }),
      { correct: 0, incorrect: 0, unanswered: 0 }
    );

    const score = calculateScore(totals.correct);
    return { score };
  };

  // Calculate test counts and average score
  const testCounts = data.reduce(
    (acc, item) => {
      switch (item.test_type) {
        case "W":
          acc.writing += 1;
          break;
        case "R":
          acc.reading += 1;
          break;
        case "L":
          acc.listening += 1;
          break;
        case "S":
          acc.speaking += 1;
          break;
        default:
          break;
      }
      // Only count score if it's a valid number
      if (typeof item.score === "number") {
        acc.totalScore += item.score;
        acc.scoreCount += 1;
      }
      return acc;
    },
    {
      writing: 0,
      reading: 0,
      listening: 0,
      speaking: 0,
      totalScore: 0,
      scoreCount: 0,
    }
  );

  const averageScore =
    testCounts.scoreCount > 0
      ? (testCounts.totalScore / testCounts.scoreCount).toFixed(2)
      : "0";

  // Filter data by test name, created_at, and test type
  const filteredData = data.filter((item) => {
    const matchesName = item.test_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDate = date ? item.created_at.slice(0, 10) === date : true;
    const matchesType = testType ? item.test_type === testType : true;
    return matchesName && matchesDate && matchesType;
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-1 flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Lịch sử học tập
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-3/4 max-h-[90vh] min-w-[1000px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Danh sách bài làm</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Thông tin chi tiết về bài làm của học viên
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-1 gap-6">
          <div className="flex gap-2 justify-end">
            <div>
              <input
                type="text"
                placeholder="Tìm kiếm tên bài test"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-w-[200px]"
              />
            </div>
            <div>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger className="!h-full !border !border-gray-300 min-w-[150px]">
                  <SelectValue placeholder="Chọn loại bài test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="R">Reading</SelectItem>
                  <SelectItem value="W">Writing</SelectItem>
                  <SelectItem value="L">Listening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-w-[150px]"
              />
            </div>
          </div>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-md text-gray-700 uppercase bg-gray-50 border dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="w-10 px-2 py-3 text-center">
                  Đã làm
                </th>
                <th scope="col" className="w-32 px-2 py-3 text-center">
                  Writing
                </th>
                <th scope="col" className="w-32 px-2 py-3 text-center">
                  Reading
                </th>
                <th scope="col" className="w-32 px-2 py-3 text-center">
                  Listening
                </th>

                <th scope="col" className="w-32 px-2 py-3 text-center">
                  Điểm trung bình
                </th>
              </tr>
            </thead>
            {filteredData.length !== 0 && (
              <tbody>
                <tr className="text-black border-b border-l border-r dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="w-10 px-5 py-2 gap-3 items-center text-center">
                    {filteredData.length}
                  </td>
                  <td className="w-32 px-4 py-2 text-center">
                    {testCounts.writing}
                  </td>
                  <td className="w-32 px-4 py-2 text-center">
                    {testCounts.reading}
                  </td>
                  <td className="w-32 px-4 py-2 text-center">
                    {testCounts.listening}
                  </td>

                  <td className="w-32 px-4 py-2 text-center">{averageScore}</td>
                </tr>
              </tbody>
            )}
          </table>
          {filteredData.length === 0 && (
            <div className="w-full text-center mb-0">
              Học viên chưa có bài tập.
            </div>
          )}
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-md text-gray-700 uppercase bg-gray-50 border dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="w-10 px-0 py-3 text-center">
                  STT
                </th>
                <th scope="col" className="w-32 px-4 py-3">
                  Tên bài test
                </th>
                <th scope="col" className="w-32 px-4 py-3 text-center">
                  Số câu đúng
                </th>
                <th scope="col" className="w-32 px-4 py-3 text-center">
                  Số câu sai
                </th>
                <th scope="col" className="w-32 px-4 py-3 text-center">
                  Điểm số
                </th>
                <th scope="col" className="w-32 px-4 py-3 text-center">
                  Thời gian nộp
                </th>
              </tr>
            </thead>
            {filteredData.length !== 0 && (
              <tbody>
                {filteredData.map((item: SubmissionData, index: number) => {
                  const { score } = getTestScore(item.result);
                  return (
                    <tr
                      key={index}
                      className="border-b border-l border-r dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="w-10 px-5 py-2 gap-3 items-center">
                        {index + 1}
                      </td>
                      <td className="w-full px-4 py-2 gap-3 items-center">
                        <span className="w-32 text-[14px] line-clamp-2 bg-primary-100 text-gray-900 font-medium py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                          {item?.test_name}
                        </span>
                      </td>
                      <td className="w-32 text-[14px] px-16 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item?.correct_answer}
                      </td>
                      <td className="w-32 text-[14px] px-16 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item?.incorrect_answer}
                      </td>
                      <td className="w-32 text-[14px] px-16 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item?.score}
                      </td>
                      <td className="w-32 text-[14px] px-16 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {HELPER.formatDate2(item?.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
          {filteredData.length === 0 && (
            <div className="w-full text-center mb-3">
              Học viên chưa có bài tập.
            </div>
          )}
        </div>
        <DialogFooter className="w-full flex !flex-row !justify-between !items-center">
          <div className=""></div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="!px-10 !text-[16px]"
              >
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
