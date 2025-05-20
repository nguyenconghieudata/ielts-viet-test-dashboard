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
import { useEffect, useState } from "react";
import ProductDescriptionEditor from "../quill";
import { DATA } from "@/utils/data";

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
  overall: string;
  teacher: string;
  comment: string;
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [overall, setOverall] = useState<string>(review?.overall || "");
  const [teacher, setTeacher] = useState<string>(review?.teacher || "");
  const [comment, setComment] = useState<string>(review?.comment || "");
  const [data, setData] = useState<Teacher[]>([]);

  const IELTS_SCORES = [
    { id: 1, value: "9.0", label: "9.0" },
    { id: 2, value: "8.5", label: "8.5" },
    { id: 3, value: "8.0", label: "8.0" },
    { id: 4, value: "7.5", label: "7.5" },
    { id: 5, value: "7.0", label: "7.0" },
    { id: 6, value: "6.5", label: "6.5" },
    { id: 7, value: "6.0", label: "6.0" },
    { id: 8, value: "5.5", label: "5.5" },
    { id: 9, value: "5.0", label: "5.0" },
    { id: 10, value: "4.5", label: "4.5" },
    { id: 11, value: "4.0", label: "4.0" },
  ];

  const validateForm = () => {
    if (!overall.trim()) {
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

    if (!comment.trim()) {
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
      setOverall(review.overall);
      setTeacher(review.teacher);
      setComment(review.comment);
    } else {
      setOverall("");
      setTeacher("");
      setComment("");
    }
  }, [review]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const reviewData: ReviewData = {
      task,
      overall,
      teacher,
      comment,
    };

    onReviewSubmit(reviewData);

    console.log("Review data submitted:", reviewData);

    setIsLoading(false);
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
          <div className="overflow-y-auto max-h-[70vh] scroll-bar-style">
            <div className="flex flex-col justify-start items-start gap-2 overflow-auto h-screen max-h-[80vh] scroll-bar-style">
              <Label htmlFor="overall" className="text-[16px] mt-2">
                Overall
              </Label>
              <div className="w-full grid items-center gap-4">
                <select
                  id="overall"
                  value={overall}
                  onChange={(e) => setOverall(e.target.value)}
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
                  value={comment}
                  onChange={setComment}
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
