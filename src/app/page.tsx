import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg italic">GT</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-black">
            GoTranscript
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 py-20 md:px-12 lg:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl opacity-60"></div>
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mb-8">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Trusted by 10,000+ professionals
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
              Transform your audio into{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Perfect Text
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-600 leading-relaxed mb-12">
              The leading marketplace for elite transcription services. Upload your files, set your price, and get high-quality transcripts from top-rated professionals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/upload"
                className="w-full sm:w-auto rounded-full bg-black px-8 py-4 text-lg font-bold text-white shadow-xl hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Upload Audio Now
              </Link>
              <Link
                href="/jobs"
                className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-lg font-bold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50 transition-all duration-200"
              >
                Work as a Transcriber
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100 pt-12">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-600">99%</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Accuracy</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-600">24h</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Turnaround</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-600">Live</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Status</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-600">Secure</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Escrow</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6 md:px-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
          <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs italic">GT</span>
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900">
            GoTranscript
          </span>
        </div>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} GoTranscript Marketplace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
