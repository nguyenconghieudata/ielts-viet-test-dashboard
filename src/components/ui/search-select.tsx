"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define Teacher interface (from ModalReview)
interface Teacher {
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

interface SearchSelectProps {
  teacher: Teacher[];
  onSelect?: (value: string) => void; // Optional callback for parent component
}

export default function SearchSelect({ teacher, onSelect }: SearchSelectProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue(newValue);
    onSelect?.(newValue); // Notify parent of selection
    setOpen(false);
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-3 font-normal border-input bg-background hover:bg-background outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? teacher.find((t) => t.teacher_name === value)?.teacher_name
                : "Chọn giáo viên"}
            </span>
            <ChevronDownIcon
              size={16}
              className="text-muted-foreground/80 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popper-anchor-width)] min-w-[200px] p-0 border-input bg-background z-[1000]"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput placeholder="Tìm giáo viên..." className="h-10" />
            <CommandList>
              <CommandEmpty>Không tìm thấy giáo viên.</CommandEmpty>
              <CommandGroup>
                {teacher.map((t) => (
                  <CommandItem
                    key={t._id}
                    value={t.teacher_name}
                    onSelect={handleSelect}
                    className="flex items-center gap-2"
                  >
                    <span>{t.teacher_name}</span>
                    {value === t.teacher_name && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
