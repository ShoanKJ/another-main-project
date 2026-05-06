"use client"
import React, { use } from 'react'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

function Header() {

         const path=usePathname();

  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
      <Image src="/logo.svg" width={160} height={100} alt='logo'/>
      <ul className='flex gap-6'>
        <li>Dashboard</li>
        <li>questions</li>
        <li>how it works</li>
        <li>about us</li>
      </ul>
      <UserButton/>
    </div>
  )
}

export default Header