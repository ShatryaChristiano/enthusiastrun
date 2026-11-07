"use client";

import Link from "next/link";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";
export default function loading() {
    return (
        <>
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
                    <div className="w-[80%] rounded-lg sm:p-8 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col py-[10%] items-center gap-8 font-heading">
                        <Image
                            src="/home/enthusiast-text-logo.webp"
                            draggable={false}
                            alt="Enthusiast Logo"
                            width={500}
                            height={500}
                            className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
                        />
                        <div className="mt-[2.5%] flex flex-col gap-2 items-center text-center sm:text-start">
                            <h1 className="text-4xl w-[90%] sm:w-full">
                                LOADING
                            </h1>
                            <LoaderCircle className="w-16 h-16 text-white spin-in" />
                            <style>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                            .spin-in {
                                animation: spin 1s linear infinite;
                                transform-origin: center;
                            }
                        `}</style>
                        </div>
                        <h3 className="text-xl w-[80%] text-center font-body max-h-[250px] overflow-y-auto">
                            Please wait while the content loads.
                        </h3>
                    </div>
                </div>
            </div>
        </>
    );
}
