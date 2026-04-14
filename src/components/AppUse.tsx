"use client";

import Image from "next/image";
import defaultContent from "../../content/apps.json";

type AppUseContent = typeof defaultContent;

interface AppUseProps {
  content?: AppUseContent;
}

export default function AppUse({ content = defaultContent }: AppUseProps) {
  return (
    <section id="apps" className="bg-[#f01e0e] pt-16 pb-8 px-5 lg:px-[120px] overflow-hidden">
      <div className="max-w-[1440px] mx-auto">

        {/* Header */}
        <div className="mb-9">
          <h2 className="font-righteous text-[34px] lg:text-[56px] uppercase text-[#faf5f5] leading-[1.1] max-w-[640px]">
            {content.sectionTitle}
          </h2>
          <p className="font-inter text-base text-[#faf5f5] leading-[1.6] mt-4 max-w-[400px]">
            {content.subtitle}
          </p>
        </div>

        {/* App Cards */}
        <div className="grid grid-cols-2 gap-5 max-w-[340px] lg:max-w-none">
          {content.apps.map((app) => (
            <div key={app.id} className="flex flex-col items-center">
              <div className="flex flex-col items-center gap-3 pb-6">
                <p className="font-righteous text-[18px] text-[#faf5f5] text-center">{app.name}</p>
                <div className="w-[60px] h-[60px] relative rounded-[14px] overflow-hidden">
                  <Image src={app.icon} alt={`${app.name} app`} fill className="object-cover" />
                </div>
                <p className="font-inter text-base text-[#faf5f5] text-center leading-[1.6]">{app.description}</p>
              </div>
              <div className="relative w-full" style={{ height: 312 }}>
                <Image
                  src={app.screenshot}
                  alt={`${app.name} screenshot`}
                  fill
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
