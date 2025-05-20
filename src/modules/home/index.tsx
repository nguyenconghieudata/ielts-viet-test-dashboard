"use client";

import { AppSidebar } from "./components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSearchParams } from "next/navigation";
import Listening from "./modules/listening";
import Blog from "./modules/writing";
import Customer from "./modules/full-test";
import Reading from "./modules/reading";
import Students from "./modules/students";
import WritingSubmit from "./modules/writing-submit";

export default function HomeClient() {
  const param = useSearchParams();

  const renderTab = (tab: string) => {
    switch (tab) {
      case "reading":
        return <Reading />;
      case "listening":
        return <Listening />;
      case "writing":
        return <Blog />;
      case "full-test":
        return <Customer />;
      case "students":
        return <Students />;
      case "writing-submission":
        return <WritingSubmit />;
      default:
        return <Reading />;
    }
  };

  const renderBreadcrumb = (tab: string) => {
    switch (tab) {
      case "reading":
        return "Bài Đọc";
      case "listening":
        return "Bài Nghe";
      case "writing":
        return "Bài Viết";
      case "full-test":
        return "Full Test";
      case "students":
        return "Học Viên";
      case "writing-submission":
        return "Nộp Bài Viết";
      default:
        return "Bài Đọc";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    <span className="text-[16px]">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <span className="text-[16px]">
                      {renderBreadcrumb(param.get("tab") || "reading")}
                    </span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="w-full h-[1.5px] bg-black opacity-10"></div>
        <div className="flex flex-1 flex-col">
          {renderTab(param.get("tab") || "reading")}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
