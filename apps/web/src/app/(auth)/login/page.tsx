import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <div className="px-6 py-4 flex items-center justify-center md:justify-between">
      <div className="hidden md:block relative h-[calc(100vh-40px)] w-[60%] overflow-hidden rounded-4xl border border-border border-solid  shadow-lg shadow-muted  ">
        <img
          src="/assets/art.png"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="h-[calc(100vh-40px)] w-1/2  bg-green-500">
        <div>
          {" "}
          <h1>Fluxo</h1>
        </div>
      </div>
    </div>
  );
};

export default page;
