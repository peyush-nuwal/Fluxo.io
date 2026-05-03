import Image from "next/image";
import { Button } from "./ui/button";
import { Star } from "lucide-react";
import Link from "next/link";
import BackgroundScribbles from "./Scribbles";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-4 py-16 sm:py-30">
      {/* Content */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center gap-6">
        <p className="eyebrow">Think. Design. Collaborate.</p>

        <h1 className="heading-xl max-w-4xl">
          Online{" "}
          <span className="font-hand font-medium bg-purple-400/20 px-3 rounded-lg">
            Whiteboard
          </span>{" "}
          for modern teams
        </h1>

        <p className="subheading max-w-xl">
          Brainstorm ideas, map workflows, and collaborate in real time —
          without friction.
        </p>

        {/* CTA group */}
        <div className="flex items-center gap-3 mt-2">
          {/* Primary CTA */}
          <Button variant={"outline"} size="lg" className="h-12 px-6 text-lg">
            Get Started
          </Button>

          {/* Secondary CTA */}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 text-lg bg-yellow-400 text-gray-800"
          >
            <Link
              href="https://github.com/peyush-nuwal/Fluxo.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Star on GitHub
            </Link>
          </Button>
        </div>
      </div>
      {/* Image */}
      <div className="w-[85%] max-w-7xl mx-auto mt-12">
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm">
          <Image
            src="/assets/s3.png"
            alt="Fluxo app dashboard preview"
            width={1200}
            height={800}
            priority
            className="w-full h-auto"
          />
        </div>
      </div>
      <BackgroundScribbles />
    </section>
  );
};

export default Hero;
