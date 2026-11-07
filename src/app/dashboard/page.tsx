import React from "react";
import Image from "next/image";
import UserNotRegisteredToCompetition from "@/components/pages/dashboard/UserNotRegisteredToCompetition";
import DashboardQRCode from "@/components/pages/dashboard/DashboardQRCode";
import { getDashboardData } from "@/lib/registration";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Enthusiast Foam Run - enthusiastrun.com",
  description:
    "Access your personal dashboard for Enthusiast Foam Run Vol. 2. Manage your registration, view your racepack QR code, and stay updated with the latest event information and announcements.",
};

export default async function page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>Silakan login kembali.</p>;
  }

  const { myRegistration, registeredByMe } = await getDashboardData();

  // Peserta lain yang didaftarkan oleh akun ini (QR mereka dikirim ke email masing-masing)
  const otherParticipants = registeredByMe.filter(
    (p) => p.id !== myRegistration?.id,
  );
  const hasAnyRegistration = !!myRegistration || registeredByMe.length > 0;
  const allCancelled =
    hasAnyRegistration &&
    (myRegistration ? myRegistration.status === "cancelled" : true) &&
    registeredByMe.every((p) => p.status === "cancelled");
  const myQRReady =
    myRegistration?.status === "confirmed" && !!myRegistration.qrCode;

  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
  };

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
        <div className="w-[80%] sm:p-8 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col py-[10%] mt-12 md:mt-0 items-center gap-8 font-heading">
          <Image
            src="/home/enthusiast-text-logo.webp"
            draggable={false}
            alt="Enthusiast Logo"
            width={500}
            height={500}
            className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
          />
          {!hasAnyRegistration ? (
            <UserNotRegisteredToCompetition />
          ) : allCancelled ? (
            <div className="flex flex-col mt-6 items-center gap-4 text-center">
              <h1 className="text-4xl text-white">REGISTRATION REJECTED</h1>
              <p className="text-xl">
                Your registration has been rejected by the admin. Please
                register again.
              </p>
              <Link
                href="/register/CATEGORY_5K"
                className="bg-[#4BCFFC] border-2 border-white px-6 py-2 rounded-lg w-fit hover:bg-[#3AA9D1] text-white"
              >
                REGISTER AGAIN
              </Link>
            </div>
          ) : (
            <div className="mt-[2.5%] flex flex-col gap-4 items-center w-[80%] md:w-full text-center sm:text-start">
              <h1 className="text-4xl w-[90%] text-center sm:w-full">
                WELCOME TO YOUR DASHBOARD!
              </h1>
              <h3 className="text-xl w-[80%] font-body text-justify max-h-[250px] overflow-y-auto">
                Thank you for registering for Enthusiast Run 2026! We're excited
                to have you on board for an unforgettable experience filled with
                fun, fitness, and community spirit. Stay tuned for more updates
                and get ready to run with enthusiasm!
              </h3>

              {myRegistration && myRegistration.status !== "cancelled" && (
                <>
                  <h1 className="text-4xl w-[90%] text-center sm:w-full">
                    YOUR RACEPACK QR-CODE!
                  </h1>
                  {myQRReady && myRegistration.qrCodeClaimed ? (
                    <div className="bg-green-600 border-2 border-white px-6 py-2 rounded-lg w-fit text-white text-center">
                      RACEPACK COLLECTED
                      {myRegistration.qrCodeClaimedAt
                        ? ` ON ${new Date(myRegistration.qrCodeClaimedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }).toUpperCase()}`
                        : ""}
                    </div>
                  ) : myQRReady ? (
                    <>
                      <DashboardQRCode
                        registrationId={myRegistration.id}
                        qrCodeUrl={myRegistration.qrCode!.qrCodeUrl}
                        fullName={myRegistration.fullName}
                      />
                      <p className="font-body text-sm text-center max-w-md">
                        This QR code is personal and can only be used once.
                        A copy has also been sent to {myRegistration.email}.
                      </p>
                    </>
                  ) : (
                    <div className="bg-red-500 border-2 border-white px-6 py-2 rounded-lg w-fit text-white">
                      RACEPACK QR CODE NOT AVAILABLE YET, PLEASE CHECK BACK IN MAX
                      3x24 HOURS
                    </div>
                  )}
                </>
              )}

              {otherParticipants.length > 0 && (
                <div className="w-full max-w-xl bg-white/10 border-2 border-white rounded-xl p-4 flex flex-col gap-3">
                  <h2 className="text-2xl text-center">
                    PARTICIPANTS YOU REGISTERED
                  </h2>
                  <p className="font-body text-sm text-center">
                    Each participant receives their own racepack QR code at
                    their own email, so racepacks can only be collected by the
                    participant themselves.
                  </p>
                  <ul className="flex flex-col gap-2 font-body text-sm">
                    {otherParticipants.map((p) => (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-2 bg-background/60 rounded-lg px-3 py-2"
                      >
                        <div className="text-left">
                          <p className="font-bold">{p.fullName}</p>
                          <p className="text-white/70 text-xs">
                            {maskEmail(p.email)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            p.status === "cancelled"
                              ? "bg-red-500"
                              : p.status === "pending"
                                ? "bg-yellow-500"
                                : p.qrCodeClaimed
                                  ? "bg-blue-500"
                                  : p.emailStatus === "SENT"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                          }`}
                        >
                          {p.status === "cancelled"
                            ? "REJECTED"
                            : p.status === "pending"
                              ? "WAITING CONFIRMATION"
                              : p.qrCodeClaimed
                                ? "RACEPACK COLLECTED"
                                : p.emailStatus === "SENT"
                                  ? "QR SENT TO EMAIL"
                                  : "QR BEING SENT"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href="https://chat.whatsapp.com/EX8dy4DCsM0Eo1rQTVbmgd"
                target="_blank"
                className="bg-[#4BCFFC] border-2 hover:bg-[#3AA9D1] border-white px-6 py-2 rounded-lg w-fit text-white"
              >
                JOIN GROUP WA
              </Link>
              <div className="flex gap-4">
                <Link
                  href="https://www.instagram.com/enthusiast.run/"
                  target="_blank"
                >
                  Follow ig{" "}
                  <span className="underline">@enthusiast.run</span>
                </Link>
                <Link
                  href="https://www.instagram.com/enthusiast.ibm/"
                  target="_blank"
                >
                  Follow ig <span className="underline">@enthusiast.ibm</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
