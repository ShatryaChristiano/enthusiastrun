"use client";
import Link from "next/link";
import GoogleLogin from "../../auth/GoogleLogin";
import UserProfileButton from "../../auth/UserProfileButton";
import { useSession } from "next-auth/react";
import TextDropdownPanel from "./TextDropdownPanel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  return (
    <nav className="fixed z-100 w-screen bg-background h-[10vh] px-[7.5%] sm:px-[1.5%] py-[1.5%] flex justify-between items-center border-b-4 border-white shadow-2xl">
      <div className="flex gap-4 justify-center items-center">
        {/* <Image
          src="/home/logo-uc.png"
          alt="UC Logo"
          width={80}
          height={80}
          className="w-auto h-14"
        />
        <Image
          src="/home/su-ibm-logo.png"
          alt="SU IBM Logo"
          width={80}
          height={80}
          className="w-auto h-14"
        /> */}
        <Link
          href="/"
          rel="home"
          className="text-white font-impact text-2xl flex items-center justify-center gap-1 hover:cursor-pointer"
        >
          <Image
            src="/home/enthusiast-text-logo.webp"
            alt="Enthusiast Logo"
            width={80}
            height={80}
            className="w-48 rotate-z-6 h-auto"
          />
          {/* <h1>ENTHUSIAST</h1> */}
        </Link>
      </div>
      {/* Mobile Hamburger Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            className="flex flex-col gap-1 md:hidden"
            aria-label="Open menu"
          >
            <div className="w-6 h-1 bg-white"></div>
            <div className="w-6 h-1 bg-white"></div>
            <div className="w-6 h-1 bg-white"></div>
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="bg-background border-l-4 border-white w-[80%] sm:w-[350px]"
        >
          <SheetHeader>
            <SheetTitle className="text-white font-impact text-2xl">
              ENTHUSIAST
            </SheetTitle>
          </SheetHeader>
          <div className="mt-12 flex flex-col ml-4 gap-6 font-impact text-xl">
            {/* About Section */}
            {/* Auth Section */}
            <div className="">
              {status === "loading" ? (
                <div className="w-10 h-10 rounded-full bg-zinc-200 animate-pulse" />
              ) : session ? (
                <div className="flex flex-col gap-2">
                  <h3 className="text-white/60">USER</h3>
                  <Link
                    rel="dashboard"
                    href="/dashboard"
                    className="text-white font-futura hover:text-[#4BCFFC]"
                    onClick={closeSheet}
                  >
                    DASHBOARD
                  </Link>
                  {session?.user?.role === "admin" && (
                    <Link
                      href="/dashboard/admin"
                      rel="admin"
                      className="text-white hover:text-[#4BCFFC]"
                      onClick={closeSheet}
                    >
                      ADMIN
                    </Link>
                  )}
                </div>
              ) : (
                <GoogleLogin />
              )}
            </div>
            <span className="w-[90%] h-0.5 opacity-50 bg-white"></span>
            <div className="flex flex-col gap-2">
              <h3 className="text-white/60">ABOUT</h3>
              <Link
                href="/about"
                rel="about"
                className="text-white font-futura hover:text-[#4BCFFC]"
                onClick={closeSheet}
              >
                ENTHUSIAST RUN
              </Link>
              <Link
                href="/about/jersey-medal"
                rel="jersey and medal"
                className="text-white font-futura hover:text-[#4BCFFC]"
                onClick={closeSheet}
              >
                JERSEY & MEDAL
              </Link>
              <Link
                href="/about/race-venue"
                rel="racepack collection venue"
                className="text-white font-futura hover:text-[#4BCFFC]"
                onClick={closeSheet}
              >
                RACE PACK COLLECTION VENUE
              </Link>
              <Link
                href="/about/tm"
                rel="technical meeting"
                className="text-white font-futura hover:text-[#4BCFFC]"
                onClick={closeSheet}
              >
                TECHNICAL MEETING
              </Link>
            </div>
            <span className="w-[90%] h-0.5 opacity-50 bg-white"></span>
            {/* Registration Section */}
            <div className="flex flex-col gap-2">
              <h3 className="text-white/60">REGISTRATION</h3>
              <Link
                href="/register/CATEGORY_5K"
                rel="registration 5k"
                className="text-white font-futura hover:text-[#4BCFFC]"
                onClick={closeSheet}
              >
                5K RUN
              </Link>
            </div>
            <span className="w-[90%] h-0.5 opacity-50 bg-white"></span>
            <div className="flex flex-col gap-2">
              {/* Other Links */}
              <Link
                href="/partnership"
                rel="partnership"
                className="text-white font-futura hover:text-[#4BCFFC]"
                onClick={closeSheet}
              >
                PARTNERSHIP
              </Link>
              <Link
                href="/route"
                rel="route"
                className="text-white font-futura hover:text-[#4BCFFC]"
                onClick={closeSheet}
              >
                ROUTE
              </Link>
              <Link
                href="/contact"
                rel="contact"
                className="text-white font-futura hover:text-[#4BCFFC]"
                onClick={closeSheet}
              >
                CONTACT
              </Link>
              <Link href={"/privacy-policy"} className="text-xl hover:underline font-impact">Privacy Policy</Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Menu */}
      <div className="hidden md:flex font-impact text-xl gap-4 justify-center items-center font-regular">
        <TextDropdownPanel
          label="ABOUT"
          items={[
            { item_label: "ENTHUSIAST RUN", item_href: "/about" },
            { item_label: "JERSEY & MEDAL", item_href: "/about/jersey-medal" },
            {
              item_label: "RACE PACK COLLECTION VENUE",
              item_href: "/about/race-venue",
            },
            {
              item_label: "TECHNICAL MEETING",
              item_href: "/about/tm",
            },
          ]}
        ></TextDropdownPanel>
        <TextDropdownPanel
          label="REGISTRATION"
          items={[
            { item_label: "5K RUN", item_href: "/register/CATEGORY_5K" },
          ]}
        ></TextDropdownPanel>
        <Link href="/partnership" rel="partnership" className="text-white hover:underline">
          PARTNERSHIP
        </Link>
        <Link href="/route" rel="route" className="text-white hover:underline">
          ROUTE
        </Link>
        <Link href="/contact" rel="contact" className="text-white hover:underline">
          CONTACT
        </Link>
        {/* <Link href={"/privacy-policy"} className="text-xl hover:underline font-impact text-white">Privacy Policy</Link> */}
        <div className="flex items-center">
          {status === "loading" ? (
            <div className="w-10 h-10 rounded-full bg-zinc-200 animate-pulse" />
          ) : session ? (
            <UserProfileButton />
          ) : (
            <GoogleLogin />
          )}
        </div>
      </div>
    </nav>
  );
}
