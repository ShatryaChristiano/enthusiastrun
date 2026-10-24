import React from "react";
import { MdGpsFixed } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import { MdOutlineMailOutline } from "react-icons/md";
export default function Footer() {
  return (
    <footer className="shadow-lg font-futura relative z-2 w-screen bg-background border-t-4 border-white flex flex-col">
      <div className="flex flex-col lg:flex-row w-full justify-between items-center lg:items-start p-8 gap-8 w-[80%]">
        <div className="flex flex-col justify-center items-center lg:items-start gap-4">
          <div className="flex gap-4">
            <Image
              src="/home/logo-uc.png"
              alt="UC Logo"
              width={80}
              height={80}
              className="w-auto h-12"
            />
            <Image
              src="/home/su-ibm-logo.png"
              alt="SU IBM Logo"
              width={80}
              height={80}
              className="w-auto h-12"
            />
          </div>
          <Image
            src="/home/enthusiast-text-logo.webp"
            alt="Enthusiast Logo"
            width={80}
            height={80}
            className="w-48 rotate-z-6 h-auto"
          />
          {/* <h2 className="text-2xl font-impact">Supported By</h2> */}
          <Link href={"/privacy-policy"} rel="privacy policy" className="text-xl hover:underline font-impact text-white">Privacy Policy</Link>
          <Link href={"/terms-of-service"} rel="privacy policy" className="text-xl hover:underline font-impact text-white">Terms of Service</Link>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          <div className="flex text-lg flex-col gap-4 items-center lg:items-start">
            <h2 className="text-2xl font-impact">Registrations</h2>
            <Link
              href="/register/CATEGORY_5K"
              className="font-normal text-white mb-0 text-center lg:text-start"
            >
              5K RUN
            </Link>

          </div>
          <div className="flex text-lg flex-col gap-4 items-center lg:items-start max-w-[400px]">
            <h2 className="text-2xl font-impact">Contact Us</h2>
            <Link
              href="https://wa.me/628113450929"
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center hover:underline items-center gap-2"
            >
              <i className="bi bi-whatsapp text-xl"></i>
              <p className="font-normal mb-0 text-center lg:text-start">
                Raina : +62 811-3450-929
              </p>
            </Link>
            <Link
              href="https://wa.me/6281390206217"
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center hover:underline items-center gap-2"
            >
              <i className="bi bi-whatsapp text-xl"></i>
              <p className="font-normal mb-0 text-center lg:text-start">
                Hilma : +62 813-9020-6217
              </p>
            </Link>
            <Link
              href={"https://www.instagram.com/enthusiast.run/"}
              target="_blank"
              className="flex hover:underline justify-center items-center gap-2"
            >
              <i className="bi bi-instagram text-xl"></i>
              <p className="font-normal mb-0 text-center lg:text-start">
                @enthusiast.run
              </p>
            </Link>
            <Link
              href={"https://www.instagram.com/enthusiast.ibm?igsh=MXYwcDJrc3ZuOTZzMg=="}
              target="_blank"
              className="flex hover:underline justify-center items-center gap-2"
            >
              <i className="bi bi-instagram text-xl"></i>
              <p className="font-normal mb-0 text-center lg:text-start">
                @enthusiast.ibm
              </p>
            </Link>
            <Link
              href="mailto:enthusiast@gmail.com"
              className="flex hover:underline justify-center items-center gap-2"
            >
              <MdOutlineMailOutline />
              <p className="font-normal mb-0 text-center text-white lg:text-start">
                enthusiastibm@gmail.com
              </p>
            </Link>
            <Link
              href={
                "https://www.google.com/maps/place/CitraLand+CBD+Boulevard,+Jl.+Waterpark+Boulevard,+Made,+Kec.+Sambikerep,+Surabaya,+Jawa+Timur+60219"
              }
              target="_blank"
              className="flex hover:underline justify-center items-start gap-2"
            >
              <MdGpsFixed className="w-8 h-auto mt-2" />
              <p className="font-normal mb-0 text-center text-white lg:text-start">
                CitraLand CBD Boulevard, Jl. Waterpark Boulevard, Made, Kec.
                Sambikerep, Surabaya, Jawa Timur 60219
              </p>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-black/10 w-full">
        <p className="text-xl fw-normal py-4 text-center m-0 text-white">
          © 2026 ENTHUSIAST. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
