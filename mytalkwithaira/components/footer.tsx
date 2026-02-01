import Link from "next/link"
import Image from "next/image"
import { Facebook, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/airalogo2.png"
                alt="Aira Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold font-serif">Aira</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed max-w-md">
              Your AI companion that listens, reasons, and reflects with you. Discover emotional clarity and calm in
              every conversation.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-foreground hover:text-primary transition-colors">
                  About Aira
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm text-foreground hover:text-primary transition-colors">
                  Try Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="font-semibold mb-4 text-foreground">Connect with us</h3>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <a
                href="mailto:airahelpdesk26@gmail.com"
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors justify-center md:justify-end"
              >
                <Mail className="w-4 h-4" />
                <span>airahelpdesk26@gmail.com</span>
              </a>
              <a
                href="tel:07366387613"
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors justify-center md:justify-end"
              >
                <Phone className="w-4 h-4" />
                <span>07366 387613</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61584679914047"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-foreground/5 hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 group"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="https://x.com/AiraCompanion"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-foreground/5 hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 group"
                aria-label="X (Twitter)"
              >
                <svg
                  className="w-4 h-4 text-foreground group-hover:text-primary transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-foreground text-center">© {new Date().getFullYear()} Aira. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
