"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconHome2,
  IconListDetails,
  IconChartBar,
  IconSettings,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Properties",
    url: "/dashboard/properties_",
    icon: IconHome2,
  },
  {
    title: "Tenants",
    url: "/dashboard/tenants",
    icon: IconListDetails,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: IconChartBar,
  },
];

const navSecondary = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: IconSettings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">
                  Property Management System
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarMenu>
          {navMain.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title} data-active={isActive}>
                <SidebarMenuButton
                  asChild
                  className={`data-[slot=sidebar-menu-button]:p-1.5! ${
                    isActive ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon className="size-5!" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarMenu className="mt-auto">
          {navSecondary.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title} data-active={isActive}>
                <SidebarMenuButton
                  asChild
                  className={`data-[slot=sidebar-menu-button]:p-1.5! ${
                    isActive ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon className="size-5!" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
