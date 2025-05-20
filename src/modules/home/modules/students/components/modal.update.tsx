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
import { Loader, SquarePen, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/scroll-hiding.css";
import "@/styles/placeholder.css";
import { UserService } from "@/services/user";
import { ModalHistoryUser } from "./modal.history";

interface UserData {
  _id: string;
  user_name: string;
  avatar: string;
  email: string;
  password: string;
  created_at: string;
}

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
  result: ResultData[];
  user_avatar: string;
  user_name: string;
  test_name: string;
  created_at: string;
}

export function ModalUpdateUser({ data }: { data: UserData }) {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoadingForDelete, setIsLoadingForDelete] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);

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
        title: "Vui lòng nhập tên.",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập email hợp lệ.",
      });
      return false;
    }

    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập mật khẩu.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const uploadMainImage: any = await UploadService.uploadToCloudinary([
      mainPreview,
    ]);

    const body = {
      user_name: name,
      email: email,
      avatar: uploadMainImage[0]?.url || "",
    };

    const response = await UserService.updateUser(data?._id, body);

    setIsLoading(false);
    window.location.href = "/?tab=students";
  };

  const handleDelete = async () => {
    setIsLoadingForDelete(true);
    const response = await UserService.deleteUser(data?._id);
    setIsLoadingForDelete(false);
    window.location.href = "/?tab=students";
  };

  const updateDOM = async (userData: UserData) => {
    if (userData) {
      setName(userData.user_name);
      setEmail(userData.email);
      setMainPreview(userData.avatar);
      setPassword(userData.password);

      try {
        const response = await UserService.getUserAnswerById(userData._id);

        console.log("========= Response:", response);

        if (response) {
          setSubmissions(response);
        }
      } catch (error) {
        console.error("Error fetching user answers:", error);
      }
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
            <span className="!text-[20px]">Cập nhật thông tin học viên</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Cập nhật thông tin học viên và nhấn{" "}
              <strong className="text-indigo-600">Lưu</strong> để lưu thay đổi.
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
                Tên học viên
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên học viên"
                  className="col-span-3 p-2 border border-[#CFCFCF] placeholder-custom rounded"
                ></textarea>
              </div>
              <Label htmlFor="description" className="text-[14.5px]">
                Email học viên
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email học viên"
                  className="col-span-3 p-2 border border-[#CFCFCF] placeholder-custom rounded"
                ></textarea>
              </div>
              <Label htmlFor="description" className="text-[14.5px]">
                Mật khẩu
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="col-span-3 p-2 border border-[#CFCFCF] placeholder-custom rounded"
                ></textarea>
              </div>

              <ModalHistoryUser data={submissions} />
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
            >
              Lưu
              {isLoading && <Loader className="animate-spin" size={17} />}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
