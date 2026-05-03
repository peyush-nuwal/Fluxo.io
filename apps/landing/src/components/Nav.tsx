"use client";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getRepoStars } from "@/lib/github";
import { formatNumber } from "@/lib/utils";
const Nav = () => {
  let [starCount, setStarCount] = useState(0);
  const getStarCount = async () => {
    const res = await getRepoStars();
    setStarCount(res);
  };
  useEffect(() => {
    let stars = getStarCount();
  }, []);

  return (
    <>
      <div className="top-5 left-1/2 -translate-x-1/2 z-50 h-16 max-w-6xl w-full  fixed  hidden md:flex justify-between items-center   ">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="logo"
            width={40}
            height={40}
            className="text-black"
          />
          <h1 className="text-2xl font-extrabold tracking-wider">Fluxo</h1>
        </div>

        <ul className="flex items-center gap-5 font-medium">
          <li>Home</li>
          <li>Features</li>
        </ul>

        <div className="flex items-center gap-3">
          <Button
            variant={"ghost"}
            className="h-12 px-3 text-lg cursor-pointer"
            size="lg"
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
            {formatNumber(Number(starCount)) || 0}
          </Button>
          <Button
            variant={"outline"}
            className="h-12 w-30 text-lg cursor-pointer"
            size="lg"
          >
            Sign in
          </Button>
        </div>
      </div>

      {/* ----mobile---- */}
      <div className="top-5 left-1/2 -translate-x-1/2 z-50 h-16 max-w-6xl w-full  fixed  block md:hidden justify-between items-center   ">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="logo"
            width={40}
            height={40}
            className="text-black"
          />
          <h1 className="text-2xl font-extrabold tracking-wider">Fluxo</h1>
        </div>

        {/* <ul className="flex items-center gap-5 font-medium">
          <li>Home</li>
          <li>Features</li>
        </ul>

        <div>
          <Button
            variant={"ghost"}
            className="h-12 px-2 text-lg cursor-pointer"
            size="lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </Button>
          <Button
            variant={"outline"}
            className="h-12 w-30 text-lg cursor-pointer"
            size="lg"
          >
            Sign in
          </Button>
        </div> */}
      </div>
    </>
  );
};

export default Nav;
