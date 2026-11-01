import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technical Meeting - Enthusiast Foam Run",
  description:
    "Informasi Technical Meeting (TM) Enthusiast Foam Run. Simak detail tanggal, format, dan link grup WhatsApp TM di sini.",
};

export default function TMPage() {
  return (
    <div className="overflow-hidden">
      <div className="h-[7vh]"></div>
      <div className="relative min-h-[90vh] xl:min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#73DADB] to-[#FFEBCE] text-white px-4 py-8">
        <Image
          src="/about/city-light.webp"
          draggable={false}
          alt="City background light"
          width={500}
          height={500}
          className="absolute bottom-16 md:bottom-28 xl:bottom-48 w-screen h-auto"
        />
        <Image
          src="/about/city-dark.webp"
          draggable={false}
          alt="City background dark"
          width={900}
          height={900}
          className="absolute bottom-8 md:bottom-14 xl:bottom-16 w-screen h-auto"
        />
        <Image
          src="/home/cloud.webp"
          draggable={false}
          alt="Cloud"
          width={500}
          height={500}
          className="absolute bottom-0 md:bottom-0 xl:-bottom-32 w-screen h-auto"
        />

        <div className="w-[90%] sm:w-[80%] rounded-lg py-16 sm:p-12 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col mt-[5.5%] mb-[4%] items-center gap-8 font-impact">
          {/* Logo */}
          <Image
            src="/home/enthusiast-text-logo.webp"
            draggable={false}
            alt="Enthusiast Logo"
            width={500}
            height={500}
            className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
          />

          <div className="mt-[2.5%] flex flex-col gap-2 items-center text-center">
            <h1 className="text-4xl sm:text-5xl text-white">
              TECHNICAL MEETING
            </h1>
            <p className="text-base font-futura text-white/70 mt-1">
              Informasi lengkap seputar Technical Meeting Enthusiast Foam Run
            </p>
          </div>

          {/* Info Cards */}
          <div className="flex flex-col items-center gap-4 w-full sm:w-[80%]">
            {/* Date */}
            <div className="flex items-center gap-4 bg-white/10 border-2 border-white rounded-xl px-6 py-5 w-full">
              <div className="flex flex-col items-start">
                <span className="text-xs font-futura text-white/60 uppercase tracking-widest">
                  Date
                </span>
                <span className="text-xl font-futura font-bold text-white">
                  7 Mei 2027
                </span>
              </div>
            </div>

            {/* Format */}
            <div className="flex items-center gap-4 bg-white/10 border-2 border-white rounded-xl px-6 py-5 w-full">
              <div className="flex flex-col items-start">
                <span className="text-xs font-futura text-white/60 uppercase tracking-widest">
                  Format
                </span>
                <span className="text-xl font-futura font-bold text-white">
                  Online Zoom Meeting
                </span>
              </div>
            </div>

            {/* WhatsApp Group */}
            <Link
              href="https://chat.whatsapp.com/C3nv3479ZbT5XHtV0powzX?s=cl&p=i&mlu=4&ilr=4&iam=2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a355] transition-colors duration-200 border-2 border-white rounded-xl px-6 py-5 w-full cursor-pointer"
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-futura text-white/80 uppercase tracking-widest">
                  WhatsApp Group
                </span>
                <span className="text-xl font-futura font-bold text-white">
                  JOIN GRUP WA TM
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
