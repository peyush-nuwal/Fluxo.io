import Image from "next/image";

const Features = () => {
  return (
    <div className="min-h-screen  py-10 ">
      <div className="flex flex-col items-center text-center mb-12">
        <p className="eyebrow">Features</p>
        <h2 className="heading-lg max-w-2xl">
          Everything you need to{" "}
          <span className="font-hand bg-green-400/20 px-3 rounded-lg">
            think
          </span>{" "}
          and build{" "}
          <span className="font-hand bg-blue-400/20 px-3 rounded-lg">
            visually
          </span>{" "}
        </h2>
        <p className="description max-w-xl">
          Brainstorm ideas, map workflows, and collaborate in real time —
          without complexity.
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[220px]">
          {/* BIG LEFT */}
          <div className="relative lg:col-span-1 lg:row-span-2 rounded-2xl bg-purple-400/40 p-6 overflow-clip">
            <h1 className="heading-md text-zinc-700">
              Advanced Export Options
            </h1>
            <p className="paragraph text-zinc-600 mt-1">
              Export diagrams exactly how you need them.
            </p>
            <div className="absolute top-4/10 left-0 w-full h-full  ">
              {" "}
              <Image
                src={"/assets/feat_2.png"}
                alt="feat-1 "
                fill
                className="object-cover w-full h-full  "
              />
            </div>
          </div>

          {/* TOP RIGHT WIDE */}
          <div className=" relative lg:col-span-2 rounded-2xl bg-pink-400/40 p-6 overflow-clip">
            <h1 className="heading-md text-zinc-700">AI Diagram Generation</h1>
            <p className="caption text-zinc-600 mt-1">
              Turn ideas into structured diagrams instantly.
            </p>
            <div className="absolute top-5/10 left-3/10 w-full h-full  ">
              {" "}
              <Image
                src={"/assets/feat_1.png"}
                alt="feat-1"
                fill
                className="object-contain w-full h-full scale-160 -rotate-8"
              />
            </div>
          </div>

          {/* MIDDLE RIGHT SMALL */}
          <div className="relative lg:col-span-2 rounded-2xl bg-emerald-500/50 p-6 overflow-clip">
            <h1 className="heading-md text-zinc-700">Smart Node Connections</h1>
            <p className="caption text-zinc-600 mt-1">
              Nodes link instantly as you build your diagram.
            </p>
            <div className="absolute top-0 left-2/7  w-full h-full   ">
              {" "}
              <Image
                src={"/assets/feat_3.png"}
                alt="feat-2"
                fill
                className="object-cover object-bottom w-full h-full  "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
