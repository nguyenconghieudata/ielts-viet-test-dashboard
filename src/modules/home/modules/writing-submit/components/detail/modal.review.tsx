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
import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ProductDescriptionEditor from "../quill";
import { DATA } from "@/utils/data";
import { AccountService } from "@/services/account";

export interface Teacher {
  _id: string;
  teacher_name: string;
  teacher_avatar: string;
  role: string;
  login_code: string;
  latest_datetime_check_in: string;
  latest_datetime_check_out: string;
  latest_status: string;
  work_status: string;
  show_status: string;
}

export interface ReviewData {
  task: number;
  score: string;
  teacher: string;
  feedback: string;
}

interface ModalReviewProps {
  task: number;
  review?: ReviewData;
  onReviewSubmit: (review: ReviewData) => void;
}

export function ModalReview({
  task,
  review,
  onReviewSubmit,
}: ModalReviewProps) {
  const { toast } = useToast();

  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [score, setScore] = useState<string>(review?.score || "");
  const [teacher, setTeacher] = useState<string>(review?.teacher || "");
  const [feedback, setFeedback] = useState<string>(review?.feedback || "");
  const [data, setData] = useState<Teacher[]>([]);

  const init = async () => {
    try {
      const response = await AccountService.getAll();

      if (response) {
        setData(response);
      } else {
        toast({
          variant: "destructive",
          title: "Không thể lấy danh sách giáo viên.",
        });
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi lấy danh sách giáo viên.",
      });
    }
  };

  useEffect(() => {
    init();
  }, []);

  const validateForm = () => {
    if (!score.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn điểm Overall IELTS.",
      });
      return false;
    }

    if (!teacher.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn giáo viên.",
      });
      return false;
    }

    if (!feedback.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập nội dung đánh giá.",
      });
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (review) {
      setScore(review.score);
      setTeacher(review.teacher);
      setFeedback(review.feedback);
    } else {
      setScore("");
      setTeacher("");
      setFeedback("");
    }
  }, [review]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const reviewData: ReviewData = {
        task,
        score,
        teacher,
        feedback,
      };

      onReviewSubmit(reviewData);

      if (dialogCloseRef.current) {
        dialogCloseRef.current.click();
      }
      toast({
        title: `Đánh giá Writing Task ${task} đã được lưu và đóng.`,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi lưu đánh giá.",
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
          Đánh giá Writing Task {task}
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Đánh giá Writing Task {task}</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Điền thông tin đánh giá và nhấn{" "}
              <strong className="text-indigo-600">Lưu</strong> để lưu đánh giá.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-1 gap-8">
          <div className="overflow-y-auto max-h-[60vh] scroll-bar-style">
            <div className="flex flex-col justify-start items-start gap-2 overflow-auto h-screen max-h-[80vh] scroll-bar-style">
              <Label htmlFor="overall" className="text-[16px] mt-2">
                Score
              </Label>
              <div className="w-full grid items-center gap-4">
                <select
                  id="overall"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="col-span-3 p-2 border rounded"
                >
                  <option value="" disabled>
                    Chọn điểm Overall IELTS
                  </option>
                  {DATA.IELTS_SCORES.map((item) => (
                    <option key={item.id} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <Label htmlFor="teacher" className="text-[16px] mt-2">
                Giáo viên chấm điểm
              </Label>
              <div className="w-full grid items-center gap-4">
                <select
                  id="teacher"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="col-span-3 p-2 border rounded"
                >
                  <option value="" disabled>
                    Chọn giáo viên
                  </option>
                  {data.map((item) => (
                    <option key={item._id} value={item.teacher_name}>
                      {item.teacher_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full grid items-center gap-4 mt-2">
                <ProductDescriptionEditor
                  key={`editor-task-${task}`}
                  value={feedback}
                  onChange={setFeedback}
                  title={`Đánh giá cho Writing Task ${task}`}
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
              ref={dialogCloseRef}
            >
              Huỷ
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="!px-10 !text-[16px] bg-indigo-600"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Lưu
            {isLoading && <Loader className="animate-spin" size={48} />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
