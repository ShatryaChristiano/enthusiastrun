import React from "react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import Link from "next/link";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact Us Enthusiast Foam Run - enthusiastrun.com",
  description: "Get in touch with the Enthusiast Foam Run team. Find contact details including WhatsApp and Instagram to ask questions or learn more about Enthusiast Foam Run Vol. 2.",
};

export default function page() {
  return (
    <div className="overflow-hidden">
      <div className="h-[7vh]"></div>
      <div className="rounded-lg relative min-h-[90vh] xl:min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#73DADB] to-[#FFEBCE] text-white px-4 py-8">
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
        <div className="w-[80%] rounded-lg sm:p-8 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col py-[10%] items-center gap-8 font-impact">
          <Image
            src="/home/enthusiast-text-logo.webp"
            draggable={false}
            alt="Enthusiast Logo"
            width={500}
            height={500}
            className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
          />
          <div className="mt-[2.5%] flex flex-col gap-2 items-center sm:items-start text-center sm:text-start">
            <h1 className="text-4xl w-[90%] sm:w-full">CONTACT US</h1>
          </div>
          {/* <h3 className="text-xl w-[80%] font-futura text-justify max-h-[250px] overflow-y-auto">
            Have questions or want to know more about Enthusiast Run?
            Our team is ready to help! {"Dont't"} hesitate to contact us.
          </h3> */}
          <div className="w-[80%] h-1 bg-white/80"></div>
          <div className="flex justify-between flex-col md:flex-row items-start w-[80%] font-impact text-xl sm:text-lg lg:text-xl">
            <Link href={"https://wa.me/+628113450929"} target="_blank" className="w-fit hover:underline text-justify max-h-[250px] overflow-y-auto flex gap-2 items-start">
              <FaWhatsapp className="mt-1" />
              <h1>Raina : +62 811-3450-929</h1>
            </Link>
            <Link href={"https://wa.me/+6281390206217"} target="_blank" className="w-fit hover:underline text-justify max-h-[250px] overflow-y-auto flex gap-2 items-start">
              <FaWhatsapp className="mt-1" />
              <h1>Hilma : +62 813-9020-6217</h1>
            </Link>
            <Link href={"https://www.instagram.com/enthusiast.run/"} target="_blank" className="w-fit hover:underline text-justify max-h-[250px] overflow-y-auto flex gap-2 items-start">
              <FaInstagram className="mt-1" />
              <h1>enthusiast.run</h1>
            </Link>
            <Link href={"https://www.instagram.com/enthusiast.ibm?igsh=MXYwcDJrc3ZuOTZzMg=="} target="_blank" className="w-fit hover:underline text-justify max-h-[250px] overflow-y-auto flex gap-2 items-start">
              <FaInstagram className="mt-1" />
              <h1>enthusiast.ibm</h1>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
