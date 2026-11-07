'use client'
import React, { useRef, useEffect } from "react";
import LogoLoop from "@/components/LogoLoop";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function SponsorSlider({ sponsors, type }: { sponsors: string[]; type: "MAIN" | "CO" | "THANKS TO" }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const logoLoopRef = useRef<HTMLDivElement>(null);

  const techLogos = sponsors.map((src) => ({ src, title: "Sponsor Logo", href: "#" }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoLoopRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="shadow-lg relative z-20 w-screen bg-background border-y-4 border-white flex flex-col items-center justify-center gap-8 font-body min-h-64"
    >
      <Image draggable={false} className="absolute -top-6 md:-top-14 w-1/2 md:w-1/4" src={type === "MAIN" ? "/home/main-sponsors.svg" : type === "THANKS TO" ? "/home/thanks-to.svg" : "/home/co-sponsors.webp"} alt="logo" height={180} width={180}></Image>
      <div ref={logoLoopRef} className="w-full">
        <LogoLoop logos={techLogos} logoHeight={type === "MAIN" ? 200 : 100} />
      </div>
    </div>
  );
}
