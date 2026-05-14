import { cn } from "@/lib/utils";
import { useId, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SparklesTextProps {
  text: string;
  className?: string;
  sparklesCount?: number;
}

export function SparklesText({ text, className, sparklesCount = 10 }: SparklesTextProps) {
  const id = useId();
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles((prev) => {
        const next = [...prev];
        if (next.length >= sparklesCount) next.shift();
        next.push({
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 10 + 10,
        });
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [sparklesCount]);

  return (
    <div className={cn("relative inline-block", className)}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.svg
            key={sparkle.id}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 180 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute pointer-events-none z-0 fill-yellow-400"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: sparkle.size,
              height: sparkle.size,
            }}
            viewBox="0 0 160 160"
          >
            <path d="M80 0c0 44.183 35.817 80 80 80-44.183 0-80 35.817-80 80 0-44.183-35.817-80-80-80 44.183 0 80-35.817 80-80z" />
          </motion.svg>
        ))}
      </AnimatePresence>
      <span className="relative z-10">{text}</span>
    </div>
  );
}
