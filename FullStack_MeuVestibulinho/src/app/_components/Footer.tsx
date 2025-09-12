"use client"

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { 
  BookOpen, 
  User, 
  GraduationCap, 
  Play,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Heart,
  ExternalLink,
  ArrowUp,
  Sparkles
} from "lucide-react";
import clsx from "clsx";

const EMAIL = "3and3software@gmail.com";
const PHONE = "(11) 91023-2912";
const CITY = "São Paulo, Brasil";

const footerLinks = {
  plataforma: [
    { name: "Simulados", href: "", icon: BookOpen },
    { name: "Meu Espaço", href: "", icon: User },
    { name: "Guia de Estudos", href: "", icon: GraduationCap },
    { name: "Mini Cursos", href: "", icon: Play },
  ],
  recursos: [
    { name: "Trilha de Estudos", href: "/trilha", icon: BookOpen },
    { name: "Exercícios", href: "/exercicios", icon: BookOpen },
    { name: "Dicas e Estratégias", href: "/dicas", icon: Sparkles },
    { name: "Comunidade", href: "/comunidade", icon: User },
  ],
  institucional: [
    { name: "Sobre Nós", href: "/sobre" },
    { name: "Como Funciona", href: "/funcionamento" },
    { name: "Depoimentos", href: "" },
  ],
  suporte: [
    { name: "Central de Ajuda", href: "/ajuda" },
    { name: "Contato", href: "/contato" },
    { name: "Política de Privacidade", href: "/privacidade" },
    { name: "Termos de Uso", href: "/termos" },
  ]
};

// Ícone TikTok (SVG) para combinar com o estilo dos ícones do Lucide
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M14 2v.27A6.73 6.73 0 0 0 20.73 9H21v2.5a8.2 8.2 0 0 1-6.5-2.57V15a5.5 5.5 0 1 1-5.5-5.5h.5V12h-.5a3.5 3.5 0 1 0 3.5 3.5V2h2Z"/>
  </svg>
);

const socialLinks = [
  { name: "Instagram", href: "#", icon: Instagram, color: "hover:text-pink-500" },
  { name: "TikTok", href: "#", icon: TikTokIcon, color: "hover:text-black" },
];

interface FooterSectionProps {
  title: string;
  links: Array<{ name: string; href: string; icon?: any }>;
  delay?: number;
}

const FooterSection = ({ title, links, delay = 0 }: FooterSectionProps) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="space-y-6"
    >
      <h3 className="text-lg font-bold text-gray-900 relative">
        {title}
        <motion.div
          className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: "60%" } : {}}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
        />
      </h3>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <motion.li
            key={link.name}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ 
              duration: 0.4, 
              delay: delay + 0.1 * index, 
              ease: "easeOut" 
            }}
          >
            <Link
              href={link.href}
              className="group flex items-center gap-2 text-gray-600 hover:text-red-600 transition-all duration-300 hover:translate-x-1"
            >
              {link.icon && (
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  <link.icon size={14} />
                </motion.div>
              )}
              <span className="relative">
                {link.name}
                <motion.div
                  className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-red-500 to-orange-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      className={clsx(
        "fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-br from-red-600 to-orange-600 text-white shadow-lg hover:shadow-2xl transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={false}
      animate={{ 
        y: isVisible ? 0 : 40,
        opacity: isVisible ? 1 : 0
      }}
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={20} />
    </motion.button>
  );
};

export const Footer = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <>
      <footer ref={ref} className="relative bg-gradient-to-br from-gray-50 via-white to-red-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Main Footer Content */}
          <div className="py-16 border-t border-gray-200">
            <div className="grid lg:grid-cols-6 gap-12">
              {/* Brand Section */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Link href="/" className="group inline-flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="flex items-center"
                  >
                    <Image 
                      src="/MeuVestibulinho_Logo.png" 
                      alt="Logo" 
                      width={50} 
                      height={50} 
                      priority 
                    />
                  </motion.div>
                  <div>
                    <div className="font-bold text-xl leading-none text-red-600 transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-orange-600">
                      Meu
                    </div>
                    <div className="font-bold text-xl leading-none text-orange-500 transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-600">
                      Vestibulinho
                    </div>
                  </div>
                </Link>

                <p className="text-gray-600 leading-relaxed">
                  Plataforma completa para preparação ao vestibulinho da ETEC. 
                  Criado por alunos, para alunos que sonham com uma educação técnica de qualidade.
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <motion.div
                    className="flex items-center gap-3 text-gray-600 group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors duration-300">
                      <Mail size={16} className="text-red-600" />
                    </div>
                    <span suppressHydrationWarning>{EMAIL}</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-3 text-gray-600 group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors duration-300">
                      <Phone size={16} className="text-orange-600" />
                    </div>
                    <span suppressHydrationWarning>{PHONE}</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-3 text-gray-600 group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-2 rounded-lg bg-yellow-100 group-hover:bg-yellow-200 transition-colors duration-300">
                      <MapPin size={16} className="text-yellow-600" />
                    </div>
                    <span suppressHydrationWarning>{CITY}</span>
                  </motion.div>
                </div>

                {/* Redes Sociais */}
                <div className="flex gap-4 pt-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                        className={clsx(
                          "flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 transition hover:scale-110 hover:shadow-lg",
                          social.color
                        )}
                        aria-label={social.name}
                      >
                        <Icon width={20} height={20} />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>

              {/* Navigation Links */}
              <FooterSection 
                title="Plataforma" 
                links={footerLinks.plataforma} 
                delay={0.2}
              />
              <FooterSection 
                title="Recursos" 
                links={footerLinks.recursos} 
                delay={0.3}
              />
              <FooterSection 
                title="Institucional" 
                links={footerLinks.institucional} 
                delay={0.4}
              />
              <FooterSection 
                title="Suporte" 
                links={footerLinks.suporte} 
                delay={0.5}
              />
            </div>
          </div>

          {/* Bottom Section */}
          <motion.div
            className="py-8 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <span>Feito por estudantes para estudantes</span>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <Heart size={16} className="text-red-500 fill-current" />
                </motion.div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 text-sm text-gray-600">
                <span suppressHydrationWarning>© {new Date().getFullYear()} Meu Vestibulinho. Todos os direitos reservados.</span>
                <div className="flex items-center gap-4">
                  <Link 
                    href="/privacidade" 
                    className="hover:text-red-600 transition-colors duration-300 flex items-center gap-1 group"
                  >
                    Privacidade
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                  <Link 
                    href="/termos" 
                    className="hover:text-red-600 transition-colors duration-300 flex items-center gap-1 group"
                  >
                    Termos
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
};
