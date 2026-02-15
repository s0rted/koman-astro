"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MagneticButtonProps extends React.ComponentProps<typeof Button> {
    children: React.ReactNode;
    strength?: number; // How strong the magnetic pull is (default: 0.5)
}

export function MagneticButton({
    children,
    className,
    strength = 0.5,
    ...props
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();

        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);

        setPosition({ x: middleX * strength, y: middleY * strength });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;

    return (
        <motion.div
            style={{ position: "relative" }}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={reset}
        >
            <Button
                ref={ref}
                className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20",
                    className
                )}
                {...props}
            >
                {children}
            </Button>
        </motion.div>
    );
}
