import React from "react";
import Image from "next/image";
import EarlyNotEarly from "@/components/pages/registration/EarlyNotEarly";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard Enthusiast Run - enthusiastrun.com",
  description: "Admin dashboard for managing Enthusiast Run Vol. 2. Access tools for validating QR codes, managing registrations, and overseeing voucher distribution to ensure a smooth event experience.",
};

export default function page() {
  return (
    <div className="overflow-hidden">
      <div className="h-[7vh]"></div>
      <div className="relative min-h-[90vh] xl:min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#73DADB] to-[#FFEBCE] text-white px-4 py-8">
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
        <div className="w-[80%] sm:p-8 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col py-[10%] items-center gap-8 font-heading">
          <Image
            src="/home/enthusiast-text-logo.webp"
            draggable={false}
            alt="Enthusiast Logo"
            width={500}
            height={500}
            className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
          />
          <div className="mt-[3.5%] flex flex-col gap-2 items-center sm:items-start text-center sm:text-start">
            <h1 className="text-4xl w-[90%] sm:w-full">ADMIN DASHBOARD</h1>
          </div>
          <EarlyNotEarly
            title="QR CODE VALIDATOR"
            href="/dashboard/admin/qr-code-validator"
            isActive={true}
          />
          <EarlyNotEarly
            title="MANAGE REGISTRATION"
            href="/dashboard/admin/registrations"
            isActive={true}
          />
          <EarlyNotEarly
            title="MANAGE VOUCHER"
            href="/dashboard/admin/vouchers"
            isActive={true}
          />
        </div>
      </div>
    </div>
  );
}
