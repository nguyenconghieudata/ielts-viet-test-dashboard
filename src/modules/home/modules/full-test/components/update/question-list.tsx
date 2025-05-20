import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Selection from "@/components/selection";
import { useState, useRef } from "react";

interface QuestionListProps {
  title: string;
  data: any[];
  onSelect: (id: string) => void;
  selectedId: string;
}

export function QuestionList({
  title,
  data,
  onSelect,
  selectedId,
}: QuestionListProps) {
  const [tempSelectedId, setTempSelectedId] = useState<string>(selectedId);
  const [open, setOpen] = useState<boolean>(false);
  const dialogRef = useRef<HTMLButtonElement>(null);

  const handleSave = () => {
    if (tempSelectedId) {
      onSelect(tempSelectedId);
      setOpen(false);
      console.log("Closing dialog");
    }
  };

  const handleCancel = () => {
    setTempSelectedId(selectedId); // Reset to initial selection
    setOpen(false); // Close dialog
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {tempSelectedId ? (
          <button
            type="button"
            className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Chỉnh sửa bài {title}
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Chọn bài {title}
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-5/6 max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Danh sách bài {title}</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Chọn bài {title.toLowerCase()} và nhấn{" "}
              <strong className="text-indigo-600">Lưu</strong> để lưu lựa chọn.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Label className="text-lg font-semibold">
            Chọn bài {title.toLowerCase()}
          </Label>
          <div className="mt-2 space-y-4 overflow-y-auto max-h-[60vh]">
            <Selection
              data={data}
              onSelect={setTempSelectedId}
              selectedId={tempSelectedId}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="!px-10 !text-[16px]"
            onClick={handleCancel}
          >
            Huỷ
          </Button>
          <button
            type="button"
            ref={dialogRef}
            onClick={handleSave}
            className="flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-md text-sm !px-10 !text-[16px] py-2.5 text-center"
          >
            Lưu
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
