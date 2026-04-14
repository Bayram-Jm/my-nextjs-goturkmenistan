import content from "../../content/paywithease.json";

export default function PayWithEase() {
  return (
    <section className="bg-[#faf5f5] py-20">
      <div className="px-5 lg:px-[120px] max-w-[1440px] lg:mx-auto">
        <h2 className="font-righteous text-[34px] lg:text-[72px] uppercase text-[#100706] leading-[0.94]">
          {content.sectionTitle}
        </h2>
        <p className="font-inter text-base text-[#524442] leading-[1.6] max-w-[591px] mt-4">
          {content.description}
        </p>

        {/* Payment Cards */}
        <div className="flex gap-2.5 lg:gap-4 mt-8">
          {/* Visa */}
          <div className="w-[172px] lg:w-[200px] h-[90px] lg:h-[100px] bg-white border border-[#524442] rounded-xl flex items-center justify-center">
            <span className="font-inter font-bold text-[32px] text-[#1a1f71]">
              VISA
            </span>
          </div>

          {/* Mastercard */}
          <div className="w-[172px] lg:w-[200px] h-[90px] lg:h-[100px] bg-white border border-[#524442] rounded-lg lg:rounded-xl flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-[48px] h-[48px] rounded-full bg-[#eb001b]" />
              <div className="w-[48px] h-[48px] rounded-full bg-[#f79e1b] -ml-4 opacity-[0.85]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
