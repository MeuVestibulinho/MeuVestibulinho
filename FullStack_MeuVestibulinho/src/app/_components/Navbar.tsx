"use client";

import Image from "next/image";

import * as React from "react";
import Link from "next/link";
import { motion, useAnimation, AnimatePresence } from "motion/react";
import { BookOpen, User, GraduationCap, Play, Menu, X } from "lucide-react";
import clsx from "clsx";

const navItems = [
  {
    name: "Simulados",
    href: "",
    icon: BookOpen,
  },
  {
    name: "Meu Espaço",
    href: "",
    icon: User,
  },
  {
    name: "Guia de Estudos",
    href: "/guia",
    icon: GraduationCap,
  },
  {
    name: "Mini Cursos",
    href: "/mini-cursos",
    icon: Play,
  },
];

interface NavItemProps {
  item: (typeof navItems)[0];
  isMobile?: boolean;
  onClose?: () => void;
}

const NavItem = ({ item, isMobile = false, onClose }: NavItemProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const controls = useAnimation();

  const handleHover = () => {
    setIsHovered(true);
    void controls.start({
      scale: 1.05,
      y: -2,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    });
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    void controls.start({
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    });
  };

  const Icon = item.icon;

  if (isMobile) {
    return (
      <motion.div whileTap={{ scale: 0.95 }} className="w-full">
        <Link
          href={item.href}
          onClick={onClose}
          className="group flex items-center gap-4 rounded-xl p-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50"
        >
          <div className="rounded-lg bg-gradient-to-br from-red-100 to-orange-100 p-2 transition-all duration-300 group-hover:from-red-200 group-hover:to-orange-200">
            <Icon size={20} className="text-red-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.name}</div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        animate={controls}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverEnd}
        className="relative"
      >
        <Link
          href={item.href}
          className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-3 font-medium text-gray-700 transition-all duration-300 hover:text-red-600"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-100/0 via-orange-100/0 to-red-100/0 transition-all duration-500 group-hover:from-red-100/50 group-hover:via-orange-100/50 group-hover:to-red-100/50" />

          {/* Icon with animation */}
          <motion.div
            className="relative z-10"
            animate={
              isHovered
                ? {
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1.1, 1],
                  }
                : {}
            }
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <Icon
              size={18}
              className="transition-colors duration-300 group-hover:text-red-600"
            />
          </motion.div>

          <span className="relative z-10">{item.name}</span>

          {/* Hover indicator */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: isHovered ? "100%" : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </Link>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence initial={false}>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 transform"
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={clsx(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-gray-200/50 bg-white/95 shadow-lg backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Image
                src="/MeuVestibulinho_Logo.png"
                alt="Logo"
                width={60}
                height={60}
                priority
              />
            </motion.div>
            <div>
              <div className="text-xl leading-none font-bold text-red-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-orange-600 group-hover:bg-clip-text group-hover:text-transparent group-hover:drop-shadow-md">
                Meu
              </div>
              <div className="text-xl leading-none font-bold text-orange-500 transition-all duration-300 group-hover:translate-y-0.5 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-600 group-hover:bg-clip-text group-hover:text-transparent group-hover:drop-shadow-md">
                Vestibulinho
              </div>
            </div>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleMobileMenu}
            className="rounded-xl p-2 transition-colors duration-200 hover:bg-gray-100 lg:hidden"
          >
            <AnimatePresence initial={false} mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} className="text-gray-700" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} className="text-gray-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence initial={false}>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-200/50 bg-white/95 shadow-lg backdrop-blur-md lg:hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <NavItem
                      item={item}
                      isMobile
                      onClose={() => setIsMobileMenuOpen(false)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
