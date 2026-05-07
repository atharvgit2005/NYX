'use client'

import { signOut } from 'next-auth/react'

interface Props {
  variant?: 'light' | 'dark'
}

export default function SignOutButton({ variant = 'dark' }: Props) {
  const isDark = variant === 'dark'
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className={`px-5 py-2.5 font-label uppercase tracking-wider text-xs border-2 transition-colors duration-100 ${
        isDark
          ? 'border-white text-white hover:bg-[#E8441A] hover:border-[#E8441A] hover:text-black'
          : 'border-black text-black hover:bg-[#E8441A] hover:border-[#E8441A] hover:text-white'
      }`}
    >
      Sign Out
    </button>
  )
}
