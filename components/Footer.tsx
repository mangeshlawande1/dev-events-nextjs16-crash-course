import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/#events", label: "Browse Events" },
  { href: "/events/create", label: "Create Event" },
  { href: "/about", label: "About" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 border-t border-dark-200 bg-dark-100/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/logo.png"
              alt="Dev Events logo"
              width={24}
              height={24}
              style={{ width: "auto", height: "auto" }}
            />
            <p className="font-medium">Dev Event</p>
          </div>
          <p className="max-w-xs text-sm text-gray-400">
            The hub for every dev event you can&apos;t miss — conferences,
            hackathons, and meetups in one place.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <p className="mb-1 font-medium text-gray-200">Quick Links</p>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-400 transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-dark-200 px-6 py-4 text-center text-xs text-gray-400">
        &copy; {year} Dev Event. Built with Next.js.
      </div>
    </footer>
  );
};

export default Footer;
