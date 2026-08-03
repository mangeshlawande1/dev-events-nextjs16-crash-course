"use client"

import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import ThemeToggle from "@/components/ThemeToggle"

const Navbar = () => {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const canManageEvents = role === "organizer" || role === "admin";

  return (
    <header>
        <nav>
            <Link href="/" className="logo">
                <Image 
                src="/icons/logo.png" 
                alt="logo" 
                width={24} height={24}   
                style={{ width: 'auto', height: 'auto' }}  />

                <p>Dev Event </p>
            </Link>
            <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/#events">Events</Link></li>
                {canManageEvents && (
                  <>
                    <li><Link href="/events/create">Create Event </Link></li>
                    <li><Link href="/dashboard">Dashboard</Link></li>
                  </>
                )}
                <li><Link href="/bookings">My Bookings</Link></li>
                {status === "authenticated" ? (
                  <>
                    <li className="max-sm:hidden text-sm text-gray-400">
                      {session.user?.name}
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-sm"
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : status === "unauthenticated" ? (
                  <>
                    <li><Link href="/login">Sign In</Link></li>
                    <li><Link href="/register">Sign Up</Link></li>
                  </>
                ) : null}
            </ul>
            <ThemeToggle />
        </nav>
    </header>
)
}

export default Navbar
