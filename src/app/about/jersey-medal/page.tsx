import React from "react";
import Image from "next/image";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Jersey & Medal Enthusiast Foam Run - enthusiastrun.com",
  description: "Find out the details about the jersey and medal for Enthusiast Foam Run Vol. 2. Learn about the design, materials, and significance of the jersey and medal for this exciting running event.",
};
export default function page() {
  return (
    <div className="overflow-hidden">
      <div className="h-[7vh]"></div>
      <div className="relative min-h-[90vh] rounded-lg xl:min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#73DADB] to-[#FFEBCE] text-white px-4 py-8">
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
        <div className="w-[80%] sm:p-8 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col py-[15%] items-center gap-8 font-heading">
          <Image
            src="/home/enthusiast-text-logo.webp"
            draggable={false}
            alt="Enthusiast Logo"
            width={500}
            height={500}
            className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
          />
          <div className="mt-[2.5%] flex flex-col gap-2 items-center sm:items-start text-center sm:text-start">
            <h1 className="text-4xl w-[90%] sm:w-full">
              JERSEY & MEDAL DETAILS
            </h1>
          </div>
          <h3 className="text-xl w-[80%] font-body text-justify max-h-[250px] overflow-y-auto">
            Participants of Enthusiast Run will receive a medal, jersey, and race pack.
            The medal serves as a symbol of achievement for participants who successfully complete the colorful and exciting run.
          </h3>
          <h3 className="text-xl w-[80%] font-body text-justify max-h-[250px] overflow-y-auto">The jersey is designed with lightweight and comfortable material, making it perfect for running while still looking fashionable.</h3>
          <Image
            src="/about/jersey-medal.webp"
            draggable={false}
            alt="Enthusiast Logo"
            width={500}
            height={500}
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
