import React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import RegistrationForm from "@/components/pages/registration/RegistrationForm";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Normal Registration - Enthusiast Foam Run",
  description:
    "Register for the Enthusiast Foam Run normal registration! Secure your spot in the CATEGORY_5K run. Sign up now to join the excitement of Enthusiast Foam Run.",
};

interface Slug {
  params: Promise<{
    slug: string;
  }>;
}

export default async function NormalRegistrationPage({ params }: Slug) {
  const { slug } = await params;

  if (slug !== "CATEGORY_5K") {
    return redirect("/not-found");
  }

  const session = await getServerSession(authOptions);

  // Allow admin users to access the page, redirect others
  if (session?.user?.role !== "admin") {
    return redirect(`/register/${slug}/full`);
  }

  return (
    <div className="overflow-hidden">
      <div className="h-[7vh]"></div>
      <div className="relative rounded-lg min-h-screen w-screen flex flex-col items-center bg-linear-to-bl from-[#73DADB] to-[#FFEBCE] text-white px-4 py-8">
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

        <div className="relative z-10 w-full max-w-4xl">
          <div className="bg-background border-4 border-white rounded-tl-xl rounded-tr-xl p-6 text-center">
            <Image
              src="/home/enthusiast-text-logo.webp"
              draggable={false}
              alt="Enthusiast Logo"
              width={300}
              height={100}
              className="mx-auto mb-4"
            />
            <h1 className="text-4xl font-heading">REGISTRATION FORM</h1>
            <p className="text-xl font-body mt-2">{slug.toUpperCase()} Run</p>
          </div>
        </div>

        <div className="relative z-10 w-full pb-32">
          <RegistrationForm
            category={slug as "CATEGORY_5K"}
            type="regular"
          />
        </div>
      </div>
    </div>
  );
}
