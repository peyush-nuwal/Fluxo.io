import Image from "next/image";

const Hero = () => {
  return (
    <section className="min-h-screen bg-red-200  flex flex-col justify-center items-center">
      <div className="h-[60vh] md:h-[80vh] flex flex-col justify-center items-center bg-blue-200">
        <p className="eyebrow">section</p>
        <h1 className="heading">dfsdfsa</h1>
        <p className="description">
          AI that handles onboarding, verification, and activation—without
          friction.
        </p>
      </div>
      <div className="w-[85%] max-w-7xl mx-auto">
        <div className="relative aspect-5/7 sm:aspect-16/10 lg:aspect-16/9 rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/assets/s1.png"
            alt="app-screenshot"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
