"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ModalChooseQuestionProps {
  onTypeSelected: (type: "MP" | "FB") => void;
}

export function ModalChooseQuestion({
  onTypeSelected,
}: ModalChooseQuestionProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Chọn loại câu hỏi
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Chọn loại câu hỏi</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">Chọn một loại câu hỏi để tạo.</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row gap-5">
          <button
            className="cursor-pointer border rounded-xl px-5 py-1 border-indigo-600 bg-indigo-600 text-white"
            onClick={() => onTypeSelected("MP")}
          >
            Multiple Choice
          </button>
          <button
            className="cursor-pointer border rounded-xl px-5 py-1 border-indigo-600 bg-indigo-600 text-white"
            onClick={() => onTypeSelected("FB")}
          >
            Fill in the blank
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
