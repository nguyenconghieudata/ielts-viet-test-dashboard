/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import { ModalCreateReading } from "./components/create/modal.create";
import { useEffect, useState } from "react";
import { ReadingService } from "@/services/reading";
import { Loader } from "lucide-react";
import { IMAGES } from "@/utils/image";
import { ModalUpdateReading } from "./components/update/modal.update";

export default function Reading() {
  const COUNT = 5;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(0);
  const [currenPage, setCurrenPage] = useState(1);
  const [currenData, setCurrenData] = useState([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>(
    {}
  );

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

  const init = async () => {
    try {
      setIsLoading(true);
      const res = await ReadingService.getAll();
      if (res && res?.data?.length > 0) {
        render(res.data);
      } else {
        setData([]);
        setCurrenData([]);
        setQuestionCounts({});
      }
    } catch (error) {
      console.error("Failed to fetch readings:", error);
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
                DANH SÁCH BÀI ĐỌC KKK{" "}
                <span className="text-indigo-600">({data?.length})</span>
              </span>
            </h5>
          </div>
          <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
            <ModalCreateReading />
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
                        Tên bài đọc
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
                          <ModalUpdateReading data={item} />
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
