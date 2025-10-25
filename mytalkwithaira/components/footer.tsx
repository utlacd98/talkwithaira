import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full gradient-primary" />
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
          <div className="flex flex-col items-center md:items-end">
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
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-foreground text-center">© {new Date().getFullYear()} Aira. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
