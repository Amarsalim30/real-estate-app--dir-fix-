'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Home,
  Search,
  Info,
  Building,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

export const navLinks = [
  { name: 'Home', href: '/', icon: Home, type: 'route' },
  { name: 'About', href: 'story', icon: Info, type: 'scroll' },
  { name: 'Properties', href: '/projects', icon: Search, type: 'route' },
  { name: 'Services', href: 'services', icon: Building, type: 'scroll' },
  { name: 'Contact', href: 'contact', icon: MessageSquare, type: 'scroll' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleScrollTo = (href) => {
    const el = document.getElementById(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const renderNavLinks = (isMobile = false) =>
    navLinks.map((link) => {
      const isActive = pathname === link.href;
      const baseClass = `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500`;

      const activeClass = isActive
        ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

      const classes = `${baseClass} ${activeClass}`;

      if (link.type === 'route') {
        return (
          <Link key={link.name} href={link.href} aria-current={isActive ? "page" : undefined}>
            <div className={classes}>
              <link.icon className="w-4 h-4" />
              {link.name}
            </div>
          </Link>
        );
      }

      // Scroll link
      return (
        <button
          key={link.name}
          onClick={() => handleScrollTo(link.href)}
          className={`${classes} ${pathname !== '/' && !isMobile ? 'hidden' : ''}`}
        >
          <link.icon className="w-4 h-4" />
          {link.name}
        </button>
      );
    });

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg'
          : 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" aria-label="Estate - Premium Properties">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Estate</h1>
              <p className="text-xs text-gray-500">Premium Properties</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1" role="menubar" aria-label="Main Menu">
            {renderNavLinks()}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-[32rem] opacity-100 border-t border-gray-200/50' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!mobileMenuOpen}
          role="menu"
        >
          <div className="py-4 space-y-2">
            {renderNavLinks(true)}

            <div className="pt-4 mt-4 border-t border-gray-200/50 space-y-2">
              <Link href="/login">
                <button className="w-full text-left text-gray-600 hover:text-gray-900 px-4 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-teal-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
