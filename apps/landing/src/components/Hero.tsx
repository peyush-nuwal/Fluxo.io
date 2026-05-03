import Image from "next/image";
import { Button } from "./ui/button";
import { Star } from "lucide-react";

const Hero = () => {
  const heroFeatures = [
    "Fast onboarding with zero setup friction",
    "Powerful automation to reduce manual work",
    "Real-time analytics for better decisions",
    "Team collaboration with role-based access",
    "Secure infrastructure with audit-ready controls",
    "Easy integrations with your existing stack",
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-4 py-16 sm:py-20">
      <div className="w-full max-w-4xl h-[60vh] md:h-[80vh] flex flex-col justify-center items-center text-center gap-5">
        <p className="eyebrow">Think. Design. Collaborate.</p>
        <h1 className="heading-xl max-w-5xl ">
          Online{" "}
          <span className="font-hand font-medium bg-purple-400/20 px-3 rounded-lg">
            Whiteboard
          </span>{" "}
          made simple
        </h1>
        <p className="subheading max-w-lg">
          Ideate, Collaborate, Share. Simply with Excalidraw.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="h-13 px-6 text-lg cursor-pointer bg-yellow-400 text-gray-700"
        >
          <Star /> Give it a Star
        </Button>
      </div>
      <div className="w-[85%] max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-red-200">
          <Image
            src="/assets/s3.png"
            alt="Fluxo app dashboard preview"
            width={1200}
            height={800}
            priority
            className="w-full h-auto rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
