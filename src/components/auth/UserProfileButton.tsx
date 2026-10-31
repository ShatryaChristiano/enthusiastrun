
"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

export default function UserProfileButton() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const imageUrl = session?.user?.image;
  const showImage = imageUrl && failedImageUrl !== imageUrl;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="User menu"
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 flex items-center justify-center focus:outline-none"
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="avatar"
            referrerPolicy="no-referrer"
            onError={() => setFailedImageUrl(imageUrl)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-black">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-1 z-[9999]">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-white hover:bg-[#4BCFFC] bg-background"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          {session?.user?.role === "admin" && (
            <Link
              href="/dashboard/admin"
              className="block px-4 py-2 text-sm text-white hover:bg-[#4BCFFC] bg-background"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}

          <LogoutButton />
        </div>
      )}
    </div>
  );
}
