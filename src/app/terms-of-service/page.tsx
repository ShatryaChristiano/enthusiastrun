import React from "react";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Enthusiast Foam Run - enthusiastrun.com",
  description: "Terms of Service and Conditions for using the enthusiastrun.com platform and Google Authentication services.",
};

export default function page() {
  return (
    <div className="overflow-hidden">
      <div className="h-[7vh]"></div>
      <div className="relative min-h-[90vh] rounded-lg xl:min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#73DADB] to-[#FFEBCE] text-white px-4 py-8">
        {/* Background Images */}
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
        
        {/* Content Container */}
        <div className="w-[90%] md:w-[80%] rounded-lg py-16 sm:p-8 shadow-lg relative z-2 bg-background border-4 border-white flex flex-col mt-[5.5%] items-center gap-6 font-heading text-black bg-white/90">
          <Image
            src="/home/enthusiast-text-logo.webp"
            draggable={false}
            alt="Enthusiast Logo"
            width={500}
            height={500}
            className="absolute -top-8 md:-top-14 lg:-top-12 xl:-top-14 w-[80%] md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto"
          />
          
          <div className="mt-[4%] md:mt-[2.5%] flex flex-col gap-2 items-center text-center">
            <h1 className="text-3xl md:text-4xl text-black uppercase tracking-wide">
              TERMS OF SERVICE
            </h1>
            <p className="font-body text-sm text-gray-600">Last Updated: January 2026</p>
          </div>
          
          {/* Scrollable Terms Content */}
          <div className="w-full px-4 md:px-8 font-body text-gray-800 h-[400px] overflow-y-auto pr-2 text-sm md:text-base leading-relaxed text-left border-t border-b border-gray-300 py-4">
            
            <p className="mb-4">
              Welcome to <strong>enthusiastrun.com</strong>. By accessing our website, registering for our events, or using our services, you agree to be bound by these Terms of Service.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2">1. Account Registration & Google Authentication</h3>
            <p className="mb-2">
              To register for the Enthusiast Foam Run, you may create an account using our internal system or via Third-Party Authentication services, specifically <strong>Google Sign-In</strong>.
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>
                <strong>Data Access:</strong> By using Google Sign-In, you authorize us to access your basic profile information, including your name, email address, and profile picture, in accordance with our Privacy Policy.
              </li>
              <li>
                <strong>Security:</strong> You are responsible for maintaining the confidentiality of your login credentials. We are not liable for any loss or damage arising from your failure to protect your account information.
              </li>
            </ul>

            <h3 className="font-bold text-lg mt-4 mb-2">2. Event Participation & Safety</h3>
            <p className="mb-4">
              Participation in the "Foam Run" involves physical activity. While we strive to create a safe environment, you acknowledge that running and navigating through foam carries inherent risks. By purchasing a ticket, you agree to release Enthusiast Run from liability regarding personal injury during the event. A separate physical waiver may be required on event day.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2">3. Purchases and Refunds</h3>
            <p className="mb-4">
              All ticket sales for Enthusiast Vol. 2 are final. Refunds are only issued if the event is officially cancelled by the organizers. Tickets are transferable only through official channels provided on this website.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2">4. User Conduct</h3>
            <p className="mb-4">
              You agree not to misuse the website or the Google Auth service. This includes attempting to gain unauthorized access to our servers, other user accounts, or using the site for fraudulent activities.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2">5. Intellectual Property</h3>
            <p className="mb-4">
              All content on this site, including the "Enthusiast Foam Run" logo, images, and text, is the property of the organizers. You may not use these assets without express written permission.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2">6. Contact Us</h3>
            <p className="mb-4">
              If you have any questions regarding these Terms or our use of Google Services, please contact us at: <a href="mailto:support@enthusiastrun.com" className="text-blue-600 underline">support@enthusiastrun.com</a> (Replace with actual email).
            </p>
          </div>
          
          <div className="text-xs text-gray-500 font-body">
            By clicking "Login with Google" or registering, you agree to these terms.
          </div>
        </div>
      </div>
    </div>
  );
}