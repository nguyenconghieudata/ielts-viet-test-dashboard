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
import { Loader, SquarePen, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { ModalReview } from "./modal.review";
import { WritingService } from "@/services/writing";
import { QuestionsService } from "@/services/questions";

interface UserAnswers {
  question_id: string;
  answer: string[];
  topic: string;
  image: string;
}

interface ResultDetails {
  type: string;
  part_id: string;
  user_answers: UserAnswers[];
  is_complete: null;
}

interface ReadingData {
  _id: string;
  user_id: string;
  user_email: string;
  test_id: string;
  test_type: string;
  result: ResultDetails[];
  user_avatar: string;
  user_name: string;
  test_name: string;
  created_at: string;
}

interface ReviewData {
  task: number;
  score: string;
  teacher: string;
  feedback: string;
}

export function ModalUpdateReading({ data }: { data: ReadingData }) {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [isLoadingForDelete, setIsLoadingForDelete] = useState<boolean>(false);
  const [activePart, setActivePart] = useState<number>(1);
  const [reviews, setReviews] = useState<ReviewData[]>([]);

  const [parts, setParts] = useState<ResultDetails[]>([
    // {
    //   type: "W",
    //   part_id: "",
    //   user_answers: [
    //     {
    //       question_id: "",
    //       answer: [],
    //       topic: "",
    //       image: "",
    //     },
    //   ],
    //   is_complete: null,
    // },
    // {
    //   type: "W",
    //   part_id: "",
    //   user_answers: [
    //     {
    //       question_id: "",
    //       answer: [],
    //       topic: "",
    //       image: "",
    //     },
    //   ],
    //   is_complete: null,
    // },
  ]);

  const validateForm = () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập tên.",
      });
      return false;
    }
    return true;
  };

  const updateDOM = async (readingData: ReadingData) => {
    if (!readingData) return;

    setName(readingData.test_name);

    const partsPromises = readingData.result.map(async (resultItem) => {
      return await QuestionsService.getQuestionsById(resultItem.part_id);
    });

    const partsData = await Promise.all(partsPromises);

    const updatedParts: ResultDetails[] = partsData.map(
      (partData: any, index: number) => {
        const resultItem = readingData.result[index];
        return {
          type: resultItem?.type || "W",
          part_id: resultItem?.part_id || "",
          user_answers: resultItem?.user_answers?.map((answer: any) => ({
            question_id: answer.question_id || "",
            answer: answer.answer || [],
            topic: answer.topic || "",
            image: answer.image || "",
          })) || [
            {
              question_id: "",
              answer: [],
              topic: "",
              image: "",
            },
          ],
          is_complete: resultItem?.is_complete || null,
        };
      }
    );

    //   {
    //     type: readingData.result[1]?.type || "W",
    //     part_id: readingData.result[1]?.part_id || "",
    //     user_answers: readingData?.result[1]?.user_answers?.map(
    //       (answer: any) => ({
    //         question_id: answer.question_id || "",
    //         answer: answer.answer || [],
    //         topic: answer.topic || "",
    //         image: answer.image || "",
    //       })
    //     ) || [
    //       {
    //         question_id: "",
    //         answer: [],
    //         topic: "",
    //         image: "",
    //       },
    //     ],
    //     is_complete: readingData.result[1]?.is_complete || null,
    //   },
    // ];

    setParts(updatedParts);
  };

  const hasCompleteFeedback = () => {
    return (
      reviews.length === 2 &&
      reviews.some((r) => r.task === 1 && r.score && r.teacher && r.feedback) &&
      reviews.some((r) => r.task === 2 && r.score && r.teacher && r.feedback)
    );
  };

  const handleReviewSubmit = async (review: ReviewData) => {
    try {
      setIsLoading(true);

      let updatedReviews: ReviewData[] = [];
      setReviews((prev) => {
        const existingReviewIndex = prev.findIndex(
          (r) => r.task === review.task
        );

        if (existingReviewIndex !== -1) {
          updatedReviews = [...prev];
          updatedReviews[existingReviewIndex] = review;
        } else {
          updatedReviews = [...prev, review];
        }

        return updatedReviews;
      });

      toast({
        title: `Đánh giá Writing Task ${review.task} đã được lưu.`,
      });

      if (
        updatedReviews.length === 2 &&
        updatedReviews.some(
          (r) => r.task === 1 && r.score && r.teacher && r.feedback
        ) &&
        updatedReviews.some(
          (r) => r.task === 2 && r.score && r.teacher && r.feedback
        )
      ) {
        const feedbackJson = {
          test_id: data.test_id,
          user_id: data.user_id,
          test_name: data.test_name,
          user_email: data.user_email,
          writing_feedback: updatedReviews
            .sort((a, b) => a.task - b.task)
            .map((r) => ({
              score: r.score,
              teacher: r.teacher,
              feedback: r.feedback,
            })),
        };
        await WritingService.sendEmailWriting(feedbackJson);
        if (dialogCloseRef.current) {
          dialogCloseRef.current.click();
        }
        toast({
          title: "Đã gửi email đánh giá cho cả hai Writing Tasks.",
        });
      } else {
        toast({
          variant: "default",
          title:
            "Vui lòng hoàn thành đánh giá cho cả hai Writing Tasks để gửi email.",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi lưu hoặc gửi đánh giá.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!hasCompleteFeedback()) {
      toast({
        variant: "destructive",
        title:
          "Vui lòng hoàn thành đánh giá cho cả hai Writing Tasks trước khi gửi.",
      });
      return;
    }

    try {
      setIsLoading(true);

      const feedbackJson = {
        test_id: data.test_id,
        user_id: data.user_id,
        test_name: data.test_name,
        user_email: data.user_email,
        writing_feedback: reviews
          .sort((a, b) => a.task - b.task)
          .map((r) => ({
            score: r.score,
            teacher: r.teacher,
            feedback: r.feedback,
          })),
      };

      await WritingService.sendEmailWriting(feedbackJson);

      toast({
        title: "Đã gửi email đánh giá thành công.",
      });

      if (dialogCloseRef.current) {
        dialogCloseRef.current.click();
      }
    } catch (error) {
      console.error("Error sending feedback email:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi gửi email đánh giá.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateDOM(data);
  }, [data]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center text-black hover:text-white hover:bg-indigo-700 font-medium rounded-full text-sm p-2 text-center"
        >
          <SquarePen />
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">{data?.test_name}</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Thông tin bài nộp của học viên. Bấm{" "}
              <strong className="text-indigo-600">Gửi đánh giá</strong> để nhận
              xét bài làm.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row gap-2 mb-4">
          {parts.map((part, index) => (
            <button
              key={part.part_id}
              className={`border rounded-xl px-5 py-1 ${
                activePart === index + 1
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-200"
              }`}
              onClick={() => setActivePart(index + 1)}
            >
              Writing Task {index + 1}
            </button>
          ))}
        </div>
        <div className="w-full grid grid-cols-2 gap-8">
          <div className="">
            <div className="overflow-y-auto max-h-[60vh] scroll-bar-style">
              <div className="mb-6">
                <h1 className="text-[16px] font-bold mb-4">
                  Writing Task {activePart} Submission
                </h1>
                <div className="mb-4 text-sm lg:text-[17px] font-semibold border-double border-2 border-black p-4 text-justify w-full">
                  {activePart === 1 ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: (
                          parts[0]?.user_answers?.[0]?.topic || ""
                        ).replace(/\\/g, ""),
                      }}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: (
                          parts[1]?.user_answers?.[0]?.topic || ""
                        ).replace(/\\/g, ""),
                      }}
                    />
                  )}
                </div>
                <div>
                  {(activePart === 1
                    ? parts[0]?.user_answers?.[0]?.image
                    : parts[1]?.user_answers?.[0]?.image) && (
                    <Image
                      src={
                        activePart === 1
                          ? parts[0]?.user_answers?.[0]?.image
                          : parts[1]?.user_answers?.[0]?.image
                      }
                      alt=""
                      width={1000}
                      height={1000}
                      className="w-full h-full"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <div className="flex flex-col justify-start items-start gap-2 overflow-y-auto max-h-[60vh] pr-0 scroll-bar-style">
              <Label htmlFor={`time`} className="text-[14.5px]">
                Bài làm
              </Label>
              <div className="w-full grid items-center gap-4 mt-1">
                <textarea
                  id={`time`}
                  value={
                    activePart === 1
                      ? parts[0]?.user_answers?.[0]?.answer?.[0]
                      : parts[1]?.user_answers?.[0]?.answer?.[0]
                  }
                  placeholder="Bài làm học viên"
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                  rows={15}
                />
              </div>
              <div className="mt-2">
                <ModalReview
                  task={activePart}
                  review={reviews.find((r) => r.task === activePart)}
                  onReviewSubmit={handleReviewSubmit}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="w-full flex !flex-row !justify-between !items-center">
          <div className=""></div>
          <div className="flex gap-2">
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
              onClick={handleSendFeedback}
              disabled={!hasCompleteFeedback() || isLoading}
              className={`flex flex-row justify-center items-center gap-2 text-white font-medium rounded-md text-sm !px-10 !text-[16px] py-2.5 text-center ${
                hasCompleteFeedback() && !isLoading
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Gửi đánh giá
              {isLoading && <Loader className="animate-spin" size={17} />}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
