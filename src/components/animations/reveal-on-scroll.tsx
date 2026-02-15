"use client";

import { motion, useInView, useAnimation, Variant } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
}

export function RevealOnScroll({
    children,
    width = "100%",
    className,
    delay = 0,
    direction = "up",
}: RevealOnScrollProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });
    const mainControls = useAnimation();

    useEffect(() => {
        if (isInView) {
            mainControls.start("visible");
        }
    }, [isInView, mainControls]);

    const variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
            x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
            scale: 0.95,
            filter: "blur(10px)"
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                duration: 0.7,
                ease: [0.21, 0.47, 0.32, 0.98],
                delay: delay
            }
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={variants as any}
            initial="hidden"
            animate={mainControls}
            className={className}
            style={{ width }}
        >
            {children}
        </motion.div>
    );
}
