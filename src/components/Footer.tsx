export default function Footer() {
  return (
    <footer className="bg-[#100706] border-t border-[#434343] py-16">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-[120px]">
        {/* Main Content */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          {/* Left Column */}
          <div className="max-w-[350px]">
            <div className="font-righteous text-2xl">
              <span className="text-[#0ff216]">Go</span>
              <span className="text-[#faf5f5]"> Turkmenistan</span>
            </div>
            <p className="font-inter text-sm text-[rgba(250,245,245,0.6)] leading-[1.6] mt-4">
              Discover the world&apos;s last great undiscovered destination.
              Ancient history, dramatic landscapes, and warm hospitality await.
            </p>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="font-righteous text-sm text-[#faf5f5] uppercase tracking-[1px]">
              EXPLORE
            </h4>
            <div className="flex flex-col gap-3 mt-4">
              <a href="#" className="font-inter text-sm text-[rgba(250,245,245,0.6)]">
                Ashgabat
              </a>
              <a href="#" className="font-inter text-sm text-[rgba(250,245,245,0.6)]">
                Events
              </a>
              <a href="#" className="font-inter text-sm text-[rgba(250,245,245,0.6)]">
                Heritage Sites
              </a>
              <a href="#" className="font-inter text-sm text-[rgba(250,245,245,0.6)]">
                Nature
              </a>
              <a href="#" className="font-inter text-sm text-[rgba(250,245,245,0.6)]">
                Cuisine
              </a>
              <a href="#" className="font-inter text-sm text-[rgba(250,245,245,0.6)]">
                Tours
              </a>
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-righteous text-sm text-[#faf5f5] uppercase tracking-[1px]">
              CONTACT
            </h4>
            <div className="flex flex-col gap-3 mt-4">
              <span className="font-inter text-sm text-[rgba(250,245,245,0.6)]">
                info@goturkmenistan.com
              </span>
              <span className="font-inter text-sm text-[rgba(250,245,245,0.6)]">
                +993 12 123 456
              </span>
            </div>

            {/* Social Icons (desktop) */}
            <div className="hidden lg:flex gap-3 mt-6">
              <a href="#" className="w-[44px] h-[44px] border border-[#434343] rounded-full flex items-center justify-center">
                <img src="/icons/instagram.svg" alt="Instagram" width={18} height={18} />
              </a>
              <a href="#" className="w-[44px] h-[44px] border border-[#434343] rounded-full flex items-center justify-center">
                <img src="/icons/telegram.svg" alt="Telegram" width={18} height={18} />
              </a>
              <a href="#" className="w-[44px] h-[44px] border border-[#434343] rounded-full flex items-center justify-center">
                <img src="/icons/whatssapp.svg" alt="WhatsApp" width={18} height={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Social Icons (mobile) */}
        <div className="flex lg:hidden gap-3 mt-8">
          <a href="#" className="w-[44px] h-[44px] border border-[#434343] rounded-full flex items-center justify-center">
            <img src="/icons/instagram.svg" alt="Instagram" width={18} height={18} />
          </a>
          <a href="#" className="w-[44px] h-[44px] border border-[#434343] rounded-full flex items-center justify-center">
            <img src="/icons/telegram.svg" alt="Telegram" width={18} height={18} />
          </a>
          <a href="#" className="w-[44px] h-[44px] border border-[#434343] rounded-full flex items-center justify-center">
            <img src="/icons/whatssapp.svg" alt="WhatsApp" width={18} height={18} />
          </a>
        </div>

        {/* Bottom Section */}
        <div className="h-px bg-[#434343] mt-10" />
        <p className="font-inter text-xs text-[rgba(250,245,245,0.4)] text-center mt-6">
          &copy; 2026 Go Turkmenistan. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
