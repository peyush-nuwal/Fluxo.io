import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="px-4 pb-8 pt-20 sm:px-8 sm:pt-24 lg:px-14 lg:pt-28">
      <div className="mx-auto w-full max-w-7xl rounded-2xl border border-black/10 bg-black/2p-6 sm:p-10 lg:p-14">
        <div className="flex min-h-105 flex-col justify-between gap-12 lg:min-h-130">
          <div className="flex items-start justify-between gap-8">
            <span className="eyebrow text-black/70">
              Got A Project In Mind?
            </span>
            <div className="w-full max-w-45 space-y-3 text-sm text-black/75">
              <p className="font-medium text-black">Socials</p>
              <div className="pt-2">
                <Link
                  href="https://www.linkedin.com/in/peyush-nuwal/"
                  className="block hover:underline"
                >
                  LinkedIn
                </Link>
                <Link
                  href="https://github.com/peyush-nuwal"
                  className="block hover:underline"
                >
                  GitHub
                </Link>
                <Link
                  href="https://x.com/Nuwal_Peyush"
                  className="block hover:underline"
                >
                  Twitter
                </Link>
                <Link
                  href="mailto:piyushnawal19@gmail.com"
                  className="block hover:underline"
                >
                  piyushnawal19@gmail.com
                </Link>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-[2.3rem] leading-none tracking-tight text-black sm:text-6xl md:text-7xl lg:text-8xl">
                LET&apos;S TALK
              </h2>
              <Link
                href="mailto:piyushnawal19@gmail.com"
                aria-label="Email us"
                className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/20 transition hover:-translate-y-0.5 hover:bg-black hover:text-white sm:h-14 sm:w-14"
              >
                <ArrowUpRight className="h-7 w-7" />
              </Link>
            </div>
            <div className="mt-4 h-px w-full bg-black/70" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
