"use client";

import Image from "next/image";

export default function AppUse() {
  return (
    <section id="apps" className="bg-[#f01e0e] pt-16 pb-8 px-5 lg:px-[120px] overflow-hidden">
      <div className="max-w-[1440px] mx-auto">

        {/* Header */}
        <div className="mb-9">
          <h2 className="font-righteous text-[34px] lg:text-[56px] uppercase text-[#faf5f5] leading-[1.1] max-w-[640px]">
            Recommended for use in Ashgabat
          </h2>
          <p className="font-inter text-base text-[#faf5f5] leading-[1.6] mt-4 max-w-[400px]">
            An app that will make your travel easier.
          </p>
        </div>

        {/* App Cards */}
        <div className="flex gap-5 items-start justify-center lg:justify-start">

          {/* Online Taxi */}
          <div className="flex flex-col items-center gap-6 flex-shrink-0" style={{ width: 154 }}>
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="flex flex-col items-center gap-3">
                <p className="font-righteous text-[18px] text-[#faf5f5] text-center">Online taxi</p>
                <div className="w-[60px] h-[60px] relative rounded-[14px] overflow-hidden">
                  <Image src="/images/app-taxi-icon.png" alt="Online taxi app" fill className="object-cover" />
                </div>
              </div>
              <p className="font-inter text-base text-[#faf5f5] text-center leading-[1.6]">To call a taxi.</p>
            </div>
            <div className="relative flex-shrink-0" style={{ width: 154, height: 318 }}>
              <Image src="/images/app-taxi-screen.png" alt="Taxi app screenshot" fill className="object-cover object-top" />
            </div>
          </div>

          {/* Gerekli / Geliber */}
          <div className="flex flex-col items-center gap-6 flex-shrink-0" style={{ width: 154 }}>
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="flex flex-col items-center gap-3">
                <p className="font-righteous text-[18px] text-[#faf5f5] text-center">Gerekli</p>
                <div className="w-[60px] h-[60px] relative rounded-[14px] overflow-hidden">
                  <Image src="/images/app-geliber-icon.png" alt="Geliber app" fill className="object-cover" />
                </div>
              </div>
              <p className="font-inter text-base text-[#faf5f5] text-center leading-[1.6]">For food delivery.</p>
            </div>
            <div className="relative flex-shrink-0" style={{ width: 154, height: 318 }}>
              <Image src="/images/app-geliber-screen.png" alt="Geliber app screenshot" fill className="object-cover object-top" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
