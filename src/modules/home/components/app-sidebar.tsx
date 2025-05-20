"use client";

import * as React from "react";
import {
  LogOut,
  BookOpenText,
  SquarePen,
  Headphones,
  BookCheck,
  User,
  NotepadText,
} from "lucide-react";
import { NavProjects } from "./nav-projects";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Cookies from "js-cookie";
import { ROUTES } from "@/utils/route";

const data = {
  projects: [
    {
      name: "Reading Test",
      url: "?tab=reading",
      tab: "reading",
      icon: <BookOpenText />,
    },
    {
      name: "Listening Test",
      url: "?tab=listening",
      tab: "listening",
      icon: <Headphones />,
    },
    {
      name: "Writing Test",
      url: "?tab=writing",
      tab: "writing",
      icon: <SquarePen />,
    },
    {
      name: "Full Test",
      url: "?tab=full-test",
      tab: "full-test",
      icon: <BookCheck />,
    },
    {
      name: "Students",
      url: "?tab=students",
      tab: "students",
      icon: <User />,
    },
    {
      name: "Writing Submission",
      url: "?tab=writing-submission",
      tab: "writing-submission",
      icon: <NotepadText />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const handleLogOut = () => {
    Cookies.remove("isLogin");
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter
        className="flex-row justify-center gap-3 text-[16px] cursor-pointer text-red-600  font-semibold"
        onClick={() => {
          handleLogOut();
        }}
      >
        <div className="border-2 border-red-600 w-full text-center py-2 rounded-md flex flex-row justify-center items-center gap-4 hover:bg-red-600 hover:text-white">
          <LogOut /> Đăng xuất
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
