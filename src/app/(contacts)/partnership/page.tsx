import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Partnership Enthusiast Foam Run - enthusiastrun.com",
  description: "Learn about partnership opportunities with Enthusiast Foam Run Vol. 2. Discover how your organization can collaborate as a sponsor or media partner to support this exciting running event and gain valuable exposure.",
};

export default function page() {
  return (
    <div className="overflow-hidden">
      <div className="h-[7vh]"></div>
      <div className="relative rounded-lg min-h-[90vh] xl:min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#73DADB] to-[#FFEBCE] text-white px-4 py-8">
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
        <div className="w-[80%] rounded-lg sm:p-8 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col py-[10%] items-center gap-8 font-heading">
          <Image
            src="/home/enthusiast-text-logo.webp"
            draggable={false}
            alt="Enthusiast Logo"
            width={500}
            height={500}
            className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
          />
          <div className="mt-[2.5%] flex flex-col gap-2 items-center sm:items-start text-center sm:text-start">
            <h1 className="text-4xl w-[90%] sm:w-full">PARTNERSHIP</h1>
          </div>

          <div className="w-[80%] h-1 bg-white/80"></div>
          <div className="w-[80%] h-full flex flex-col justify-between md:flex-row gap-12">
            <div className="flex flex-col gap-4 justify-center items-center md:items-start md:justify-start">
              <div className="mt-[2.5%] flex flex-col gap-2 items-center sm:items-start text-center sm:text-start">
                <h1 className="text-4xl w-[90%] sm:w-full">SPONSORSHIP</h1>
              </div>
              <div className="text-xl font-body font-bold text-justify max-h-[250px] overflow-y-auto list-inside">
                <Link
                  href={"https://wa.me/+6281252795787"}
                  target="_blank"
                  className="w-fit hover:underline text-justify max-h-[250px] overflow-y-auto flex gap-2 items-start"
                >
                  <FaWhatsapp className="mt-1" />
                  <h1>0895621165330 (Maulana Raka)</h1>
                </Link>
                <Link
                  href={"https://wa.me/+6281252795787"}
                  target="_blank"
                  className="w-fit hover:underline text-justify max-h-[250px] overflow-y-auto flex gap-2 items-start"
                >
                  <FaWhatsapp className="mt-1" />
                  <h1>081252795787 (Kelvin)</h1>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-4 justify-center items-center md:items-start md:justify-start">
              <div className="mt-[2.5%] flex flex-col gap-2 items-center sm:items-start text-center sm:text-start">
                <h1 className="text-4xl w-[90%] sm:w-full">MEDIA PARTNER</h1>
              </div>
              <div className="text-xl font-body font-bold text-justify max-h-[250px] overflow-y-auto list-inside">
                <Link
                  href={"https://wa.me/+6281259990845"}
                  target="_blank"
                  className="w-fit hover:underline text-justify max-h-[250px] overflow-y-auto flex gap-2 items-start"
                >
                  <FaWhatsapp className="mt-1" />
                  <h1>081259990845 (Satria)</h1>
                </Link>
                <Link
                  href={"https://wa.me/+6281252795787"}
                  target="_blank"
                  className="w-fit hover:underline text-justify max-h-[250px] overflow-y-auto flex gap-2 items-start"
                >
                  <FaWhatsapp className="mt-1" />
                  <h1>081252795787 (Kelvin)</h1>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
