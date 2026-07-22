import Image from "next/image"
import Link from "next/link"

const Navbar = () => {
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
            <ul className="list-none flex gap-5 items-center">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/#events">Events</Link></li>
                <li><Link href="/events/create">Create Event </Link></li>
                <li><Link href="/bookings">My Bookings</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
        </nav>
    </header>
)
}

export default Navbar