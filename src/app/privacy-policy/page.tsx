import React from "react";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Enthusiast Foam Run - enthusiastrun.com",
  description: "Privacy Policy regarding data collection, Google Authentication usage, and user rights for Enthusiast Foam Run.",
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
              PRIVACY POLICY
            </h1>
            <p className="font-body text-sm text-gray-600">Last Updated: January 2026</p>
          </div>
          
          {/* Scrollable Privacy Content */}
          <div className="w-full px-4 md:px-8 font-body text-gray-800 h-[400px] overflow-y-auto pr-2 text-sm md:text-base leading-relaxed text-left border-t border-b border-gray-300 py-4">
            
            <p className="mb-4">
              At <strong>enthusiastrun.com</strong> ("Enthusiast Foam Run"), we value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website or register for our events using Google Authentication.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2">1. Information We Collect</h3>
            <p className="mb-2">We collect information to facilitate your registration for the "Foam Run" event:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li><strong>Personal Information:</strong> Name, phone number, and t-shirt size (collected during ticket checkout).</li>
              <li><strong>Google User Data:</strong> When you choose to "Log in with Google," we collect your <strong>Google Email Address</strong>, <strong>Full Name</strong>, and <strong>Profile Picture</strong> via the Google OAuth API.</li>
              <li><strong>Usage Data:</strong> Basic logs of how you access our site (IP address, browser type) for security purposes.</li>
            </ul>

            <h3 className="font-bold text-lg mt-4 mb-2">2. How We Use Your Data</h3>
            <p className="mb-4">
              We use the data collected solely for the purpose of organizing the Enthusiast Foam Run:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>To create your user account and verify your identity.</li>
              <li>To send you tickets, event updates, and emergency notifications.</li>
              <li>To issue refunds or resolve support tickets.</li>
            </ul>

            <h3 className="font-bold text-lg mt-4 mb-2">3. Google User Data Policy</h3>
            <div className="bg-gray-100 p-3 rounded-md mb-4 border-l-4 border-blue-500">
              <p className="text-sm">
                <strong>Explicit Disclosure:</strong> We do not share, sell, or transfer your Google User Data to any third-party advertising networks or data brokers.
              </p>
              <p className="text-sm mt-2">
                Enthusiast Foam Run's use and transfer to any other app of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
              </p>
            </div>

            <h3 className="font-bold text-lg mt-4 mb-2">4. Data Storage and Security</h3>
            <p className="mb-4">
              Your data is stored securely on our servers. We implement industry-standard encryption (HTTPS/TLS) to protect your personal information during transmission. We retain your data only as long as necessary to fulfill the event requirements or as required by law.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2">5. Third-Party Services</h3>
            <p className="mb-4">
              We may use third-party payment processors (e.g., Midtrans) to handle transactions. Your payment details are processed directly by them and are not stored on our servers.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2">6. Your Rights & Data Deletion</h3>
            <p className="mb-4">
              You have the right to request access to or deletion of your personal data. If you wish to delete your account and remove your Google data from our records, please email us at <a href="mailto:enthusiastibm@gmail.com" className="text-blue-600 underline">enthusiastibm@gmail.com</a>. We will process deletion requests within 30 days.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2">7. Contact Us</h3>
            <p className="mb-4">
              For any privacy-related inquiries, please contact:<br/>
              <strong>Email:</strong> enthusiastibm@gmail.com
            </p>
          </div>
          
          <div className="text-xs text-gray-500 font-body">
             © {new Date().getFullYear()} Enthusiast Foam Run. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}