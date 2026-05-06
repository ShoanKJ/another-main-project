"use client"
import React from 'react'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'How it works', href: '/dashboard/how-it-works' },
  { label: 'About', href: '/dashboard/about' },
  { label: 'Tips', href: '/dashboard/tips' },
]

function Header() {
  const path = usePathname()

  return (
    <div className='flex p-4 items-center justify-between bg-white shadow-sm border-b'>
      <Image src="/logo.svg" width={140} height={80} alt='logo' />

      <ul className='flex gap-2'>
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`text-sm px-4 py-2 rounded-full transition-all font-medium ${
                path === link.href
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <UserButton />
    </div>
  )
}

export default Header