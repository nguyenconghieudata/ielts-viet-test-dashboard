import { useId } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { IMAGES } from "@/utils/image";

interface SelectionProps {
  data: { _id: string; name: string; thumbnail?: string }[];
  onSelect: (id: string) => void;
  selectedId: string;
}

export default function Selection({
  data,
  onSelect,
  selectedId,
}: SelectionProps) {
  const id = useId();

  return (
    <div className="*:not-first:mt-2">
      <Select
        value={selectedId}
        onValueChange={(value) => {
          onSelect(value);
        }}
      >
        <SelectTrigger
          id={id}
          className="ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span>img]:shrink-0"
        >
          <SelectValue placeholder="Chọn bài test" />
        </SelectTrigger>
        <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2">
          <SelectGroup>
            <SelectLabel className="ps-2 text-black">Reading Test</SelectLabel>
            {data?.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                <Image
                  className="size-10 rounded object-cover border border-gray-200"
                  src={item.thumbnail || IMAGES.LOGO}
                  alt={item.name}
                  width={1000}
                  height={1000}
                />
                <span className="truncate">{item.name}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
