"use client"

import * as React from "react";
import { Slot } from "radix-ui";
import clsx from "clsx";
import { motion, useAnimation } from "motion/react";
import { ArrowRight, Play } from "lucide-react";

type ButtonProps = {
  asChild?: boolean
  variant?: "primary" | "secondary"
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, variant = "primary", className, children, ...props }, ref) => {
    const Comp = (asChild ? Slot : "button") as React.ElementType;

    const controls = useAnimation();

    const base =
      "group inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-medium focus:outline-none relative overflow-hidden";
    const variants = {
      primary:
        "bg-red-600 text-white shadow-lg hover:shadow-2xl",
      secondary:
        "border-2 border-gray-300 text-gray-800 hover:border-red-500",
    };

    const glow = variant === "secondary"
      ? "before:absolute before:inset-0 before:rounded-full before:bg-red-500 before:opacity-0 before:blur-xl before:transition-opacity before:pointer-events-none group-hover:before:opacity-30"
      : "";

    const Icon = variant === "primary" ? ArrowRight : Play;
    const iconBefore = variant === "secondary";

    return (
      <motion.div
        onHoverStart={() => controls.start({ scale: [1, 1.4, 1.2, 1.5], rotate: [0, 10, -10, 0] })}
        onHoverEnd={() => controls.start({
           scale: 1,
           rotate: 0,
           transition: { type: "tween", duration: 0.2, ease: "easeOut" }
         })}
        className={clsx("inline-block")}
      >
        <Comp
          ref={ref}
          className={clsx(base, variants[variant], glow, className, "flex items-center gap-2")}
          {...props}
        >
          {iconBefore && (
            <motion.div
              className="inline-flex"
              animate={controls}
              transition={{ type: "tween", duration: 0.6, ease: "easeInOut" }}
            >
              <Icon size={20} />
            </motion.div>
          )}
          {children}
          {!iconBefore && (
            <motion.div
              className="inline-flex"
              animate={controls}
              transition={{ type: "tween", duration: 0.6, ease: "easeInOut" }}
            >
              <Icon size={20} />
            </motion.div>
          )}
        </Comp>
      </motion.div>
    )
  }
)

Button.displayName = "Button";
