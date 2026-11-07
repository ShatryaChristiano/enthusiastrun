import React from 'react'
import Link from 'next/link'
export default function FloatingActionButton() {
  return (
    <Link href="https://wa.me/+6281259990845" target="_blank" className='bg-[#4BCFFC] text-background fixed bottom-8 gap-2 right-8 px-4 py-2 font-heading shadow-2xl border-3 border-white rounded-full flex justify-center items-center z-50'>
        <div className='bg-white rounded-full'>
            <h1 className='font-heading py-2 px-4'>?</h1>
        </div>
        <div className='flex flex-col text-white font-body font-bold justify-center items-start'>
            <h1 className='text-sm'>Need help?</h1>
            <h1 className='text-sm'>Contact us now</h1>
        </div>
    </Link>
  )
}
