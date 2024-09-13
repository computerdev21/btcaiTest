import TypewriterTitle from "@/components/ui/TypewriterTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React from "react";

export default function Home() {
  return (
    <div className="bg-gradient-to-r min-h-screen grainy from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="font-semibold text-7xl text-center">
          AI <span className="text-green-600 font-bold">Web3</span>{" "}
          assistant.
        </h1>
        <div className="mt-4"></div>
        <h2 className="font-semibold text-3xl text-center text-slate-700">
          <TypewriterTitle />
        </h2>
        <div className="mt-8"></div>

        <div className="flex flex-col justify-center items-center gap-5">
          <Link href="/dashboard">
            <Button className="bg-green-600">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" strokeWidth={3} />
            </Button>
          </Link>
          <Link href="/dashboard/exchangeDataPage">
            <Button>Exchange Data <ArrowRight className="ml-2 w-5 h-5" strokeWidth={3} /></Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
