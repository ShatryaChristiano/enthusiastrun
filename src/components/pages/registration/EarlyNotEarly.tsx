import React from 'react'
import Link from 'next/link';
import { HiLockClosed } from "react-icons/hi2";
import { HiLockOpen } from "react-icons/hi2";
export interface EarlyNotEarlyProps {
  title: string;
  price?: string;
  href: string;
  count?: number;
  maxCount?: number;
  isActive?: boolean;
  isSoldOut?: boolean;
  /** When true, admin can still click the link even if sold out (overlay removed, href kept) */
  isAdminClickable?: boolean;
}
export default function EarlyNotEarly(props: EarlyNotEarlyProps) {
  const isClickable = props.isActive || props.isAdminClickable;
  return (
    <Link href={`${isClickable ? props.href : '#'}`} className="relative w-full flex justify-center items-center">
      {isClickable && !props.isSoldOut ? null : !props.isAdminClickable ? <div className='absolute z-10 w-full bg-black/5 h-full backdrop-blur-xs opacity-40'></div> : null}
      {props.isSoldOut ? (
        <div className='w-full z-20 absolute flex justify-center items-center pointer-events-none'>
          <span className='px-2 text-4xl rotate-z-6 rounded-lg border-red-700 border-4 text-red-700 font-regular font-heading'>SOLD OUT</span>
        </div>
      ) : null}
      <div className={`w-[80%] sm:w-full transition-colors duration-300 border-4 border-white shadow-lg flex flex-col items-center py-6 px-4 'opacity-100 cursor-pointer  bg-gradient-to-r from-[#FF7E5F] to-[#FEB47B] hover:from-[#FEB47B] hover:to-[#FF7E5F]`}>
        <h2 className="text-4xl font-heading text-center text-white mb-2">{props.title}</h2>
        {/* {props.price && (
        <p className="text-xl font-body text-white">
        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
          Number(String(props.price).replace(/[^\d.-]/g, '')) || 0
        )}
        </p>
      )} */}
      </div>
    </Link>
  )
}
