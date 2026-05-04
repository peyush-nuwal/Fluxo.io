"use client";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Button } from "./ui/button";
import Image from "next/image";

import { cn, formatNumber } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
const Nav = () => {
  const [starCount, setStarCount] = useState<number | null>(null);
  const [scrollActive, setScrollActive] = useState<boolean>(false);

  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setScrollActive(value > 0.12);
  });

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const res = await fetch(
          "https://api.github.com/repos/peyush-nuwal/Fluxo.io",
        );
        const data = await res.json();
        console.log(data);
        setStarCount(data.stargazers_count);
      } catch (err) {
        console.error("Failed to fetch stars", err);
        setStarCount(0);
      }
    };

    fetchStars();
  }, []);

  return (
    <>
      <div
        className={cn(
          "top-5 left-1/2 -translate-x-1/2 z-50 h-16 max-w-9/10 lg:max-w-6xl w-full  fixed  flex justify-between items-center px-4 rounded-lg transition-colors ease-in duration-300   ",
          scrollActive ? "bg-white shadow sh" : "bg-transparent",
        )}
      >
        <motion.div className="relative h-10 w-30 overflow-hidden">
          {/* Text */}
          <motion.h1
            className="absolute inset-0 flex items-center text-2xl font-extrabold tracking-wider"
            initial={{ y: 0 }}
            animate={{
              y: scrollActive ? -40 : 0,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            Fluxo
          </motion.h1>
          {/* Logo */}
          <motion.div
            initial={{ y: 40 }}
            animate={{
              y: scrollActive ? 0 : 40,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center"
          >
            <Image
              src="/logo.svg"
              alt="logo"
              width={40}
              height={40}
              className="w-10 h-auto"
            />
          </motion.div>
        </motion.div>

        <div className="flex items-center gap-3">
          <Button
            variant={"ghost"}
            className="h-12 px-3 text-lg cursor-pointer"
            size="lg"
          >
            <Link
              href="https://github.com/peyush-nuwal/Fluxo.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              {formatNumber(Number(starCount))}
            </Link>
          </Button>
          <Button
            variant={"outline"}
            className="h-12 w-30 text-lg cursor-pointer"
            size="lg"
          >
            <Link
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Nav;
