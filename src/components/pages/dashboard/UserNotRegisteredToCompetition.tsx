'use client'
import Link from "next/link";
import React from "react";

export default function UserNotRegisteredToCompetition() {
  return (
    <>
      <div className="mt-[2.5%] flex flex-col gap-2 items-center sm:items-start text-center sm:text-start">
        <h1 className="text-4xl w-[90%] sm:w-full">DASHBOARD</h1>
      </div>
      <h3 className="text-xl w-[80%] sm:w-full text-center font-body">
        You are not registered for anything yet!
      </h3>
      <Link
        href="/register/CATEGORY_5K"
        className="bg-[#4BCFFC] border-2 border-white px-4 py-2 rounded-lg w-fit hover:bg-[#3AA9D1] text-white"
      >
        REGISTER NOW
      </Link>
    </>
  );
}
