import Image from "next/image";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Registration Full - Enthusiast Foam Run",
    description:
        "The registration for the Enthusiast Foam Run is currently full. Please check back later or explore other options to join the excitement of Enthusiast Foam Run.",
};

interface Slug {
    params: Promise<{
        slug: string;
    }>;
}

export default async function RegistrationFull({ params }: Slug) {
    const { slug } = await params;

    if (slug !== "CATEGORY_5K") {
        return redirect("/not-found");
    }


    return (
        <div className="overflow-hidden">
            <div className="h-[7vh]"></div>
            <div className="relative rounded-lg min-h-[90vh] py-[15%] xl:min-h-screen w-screen flex flex-col items-center justify-center bg-linear-to-bl from-[#73DADB] to-[#FFEBCE] text-white px-4 py-8 overflow-hidden">
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
                <div className="w-[80%] rounded-lg py-[20%] sm:p-8 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col items-center gap-8 font-heading">
                    <Image
                        src="/home/enthusiast-text-logo.webp"
                        draggable={false}
                        alt="Enthusiast Logo"
                        width={500}
                        height={500}
                        className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
                    />
                    <div className="mt-[2.5%] flex flex-col gap-2 items-center sm:items-start text-center sm:text-start">
                        <h1 className="text-4xl md:text-6xl w-[90%] sm:w-full">REGISTRATION FULL</h1>
                    </div>

                    <div className=""></div>

                </div>
            </div>
        </div>
    );
}