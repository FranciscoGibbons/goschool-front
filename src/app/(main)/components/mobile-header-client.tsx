"use client";

import Image from "next/image";
import Link from "next/link";
import { branding } from "@/config/branding";
import userInfoStore from "@/store/userInfoStore";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/sacred";

export function MobileHeaderClient() {
  const { userInfo } = userInfoStore();

  const getInitials = (name: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const displayName =
    userInfo?.name && userInfo?.last_name
      ? `${userInfo.name} ${userInfo.last_name}`
      : userInfo?.full_name || "Usuario";

  const homeHref = userInfo?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <header className="lg:hidden h-14 bg-surface border-b border-border flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-30">
      <Link href={homeHref} className="flex items-center gap-2">
        <Image
          src={branding.logoPath}
          alt={branding.schoolName}
          width={28}
          height={28}
          className="h-7 w-auto"
        />
        <span className="text-sm font-semibold text-foreground">
          {branding.schoolName}
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/perfil"
          className="flex items-center"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={userInfo?.photo || ""} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
