"use client"

import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Menu, Sparkles } from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16 relative">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-3 absolute left-0">
            <Image
              src="/airalogo2.png"
              alt="Aira Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl font-bold font-serif">Aira</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 absolute right-0">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden md:inline-flex border-2 border-border hover:border-primary hover:bg-primary/10 font-semibold transition-all bg-transparent"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="hidden md:inline-flex bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-lg shadow-primary/30 border-2 border-primary/50 transition-all hover:scale-105"
            >
              <Link href="/signup" className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Try Aira Free
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 border-2 border-border hover:border-primary hover:bg-primary/10 font-semibold bg-transparent"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-lg shadow-primary/30 border-2 border-primary/50"
                >
                  <Link href="/signup" className="flex items-center justify-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Try Aira Free
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
