import { Music2 } from "lucide-react";

const links = [
  { label: "About", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Twitter / X", href: "#" },
  { label: "Instagram", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">
              DejaVu<span className="text-primary">Music</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} DejaVu Music. All rights reserved.</p>
          <p>
            Built with ❤️ for everyone who&apos;s ever had a song stuck on the tip of their tongue
          </p>
        </div>
      </div>
    </footer>
  );
}
