"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import EarlyNotEarly from "@/components/pages/registration/EarlyNotEarly";
import { useParams } from "next/dist/client/components/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { checkRegistrationCount } from "@/lib/registration";
import { useSession } from "next-auth/react";

export default function RegistrationPage() {
  const slug = useParams().slug as string;
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  
  const [superEarlyCount, setSuperEarlyCount] = useState<number>(0);
  const [earlyBirdCount, setEarlyBirdCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!slug || slug !== "CATEGORY_5K") return;
      
      setIsLoading(true);
      
      try {
        const category = "CATEGORY_5K";
        
        // Fetch counts
        const superCount = await checkRegistrationCount(category, "super_early_bird");
        const earlyCount = await checkRegistrationCount(category, "early_bird");
        
        setSuperEarlyCount(superCount);
        setEarlyBirdCount(earlyCount);
      } catch (error) {
        console.error("Failed to fetch registration counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [slug]);

  if (slug !== "CATEGORY_5K") {
    return redirect("/not-found");
  }

  const is5K = slug === "CATEGORY_5K";
  
  // Determine if each phase is active

  const isSuperEarlyActive = superEarlyCount < (is5K ? 0 : 0);
  const isEarlyBirdActive = !isSuperEarlyActive && earlyBirdCount < (is5K ? 480 : 280); // aslinya 480 : 280
  const isRegularActive = !isSuperEarlyActive && !isEarlyBirdActive;


  const isSuperEarlySoldOut = superEarlyCount >= (is5K ? 0 : 0)
  const isEarlyBirdSoldOut = earlyBirdCount >= (is5K ? 480 : 280) // aslinya 480 : 280
  const isRegularSoldOut = false;

  return (
    <div className="overflow-hidden">
      <div className="h-[7vh]"></div>
      <div className="relative min-h-[90vh] py-[15%] xl:min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#73DADB] to-[#FFEBCE] text-white px-4 py-8 overflow-hidden">
        <Image
          src="/about/city-light.webp"
          draggable={false}
          alt="Description"
          width={500}
          height={500}
          className="absolute bottom-16 md:bottom-28 xl:bottom-48 w-screen h-auto"
        />
        <Image
          src="/about/city-dark.webp"
          draggable={false}
          alt="Description"
          width={900}
          height={900}
          className="absolute bottom-8 md:bottom-14 xl:bottom-16 w-screen h-auto"
        />
        <Image
          src="/home/cloud.webp"
          draggable={false}
          alt="Description"
          width={500}
          height={500}
          className="absolute bottom-0 md:bottom-0 xl:-bottom-32 w-screen h-auto"
        />
        <div className="w-[80%] rounded-lg py-[20%] sm:p-8 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col items-center gap-8 font-impact">
          <Image
            src="/home/enthusiast-text-logo.webp"
            draggable={false}
            alt="Enthusiast Logo"
            width={500}
            height={500}
            className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
          />
          <div className="mt-[2.5%] flex flex-col gap-2 items-center sm:items-start text-center sm:text-start">
            <h1 className="text-4xl md:text-6xl w-[90%] sm:w-full">REGISTRATION</h1>
            {isLoading && (
              <p className="text-sm text-white/70">Loading availability...</p>
            )}
          </div>
          
          <EarlyNotEarly
            title="Super Early Bird"
            price={is5K ? "149000" : "179000"}
            href={`/register/${slug}/super-early-bird`}
            isActive={isSuperEarlyActive}
            isSoldOut={isSuperEarlySoldOut}
            count={superEarlyCount}
            maxCount={1}
          />
          <EarlyNotEarly
            title="Early Bird"
            price={is5K ? "229000" : "239000"}
            href={`/register/${slug}/early-bird`}
            isActive={isEarlyBirdActive}
            isSoldOut={isEarlyBirdSoldOut}
            count={earlyBirdCount}
            maxCount={50}
          />
          {/* <EarlyNotEarly
            title="Early Bird (Mahasiswa UC)"
            price={is5K ? "169000" : "199000"}
            href={`/register/${slug}/early-bird`}
            isActive={isEarlyBirdActive}
            count={earlyBirdCount}
            maxCount={50}
          /> */}
          <EarlyNotEarly
            title="Regular"
            price={is5K ? "249000" : "299000"}
            href={`/register/${slug}/normal`}
            isActive={isRegularActive}
            isSoldOut={isRegularSoldOut}
            isAdminClickable={isAdmin}
          />
          
          <div className="flex flex-col font-futura w-full justify-center items-center gap-1">
            <h3 className="text-xl">Have a voucher?</h3>
            <Link
              href={"/register/redeem-code"}
              className="bg-[#4BCFFC] text-background gap-2 px-4 py-2 font-impact shadow-2xl border-3 border-white rounded-lg hover:bg-[#3AA9D1] flex justify-center items-center z-50"
            >
              REDEEM CODE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}