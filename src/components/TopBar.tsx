import React from 'react';
import { Store, Ticket, Heart, MessageSquare } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  bookingCount: number;
  onOpenMyBookings: () => void;
  onStartBooking: () => void;
  onOpenVolunteer: () => void;
  onOpenReview: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  bookingCount,
  onOpenMyBookings,
  onStartBooking,
  onOpenVolunteer,
  onOpenReview,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F6F1E7]/95 backdrop-blur-md border-b border-[#D8CEBD] shadow-2xs relative w-full overflow-hidden">
      {/* Subtle paper grain texture */}
      <div className="absolute inset-0 pointer-events-none grain-overlay opacity-40"></div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 px-3 sm:px-6 py-2.5 sm:py-3 relative z-10">
        
        {/* Brand: Újbudazsibi - Fraunces wordmark & vintage stamp emblem */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1A3626] border border-[#2E543D] flex items-center justify-center text-[#E7C286] shadow-xs shrink-0">
            <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <button
            onClick={() => onSelectTab('map')}
            className="text-left cursor-pointer focus-visible:outline-none group shrink-0"
          >
            <span className="text-lg sm:text-2xl font-black tracking-tight text-[#1C2C20] whitespace-nowrap block font-serif group-hover:text-[#C88A36] transition-colors leading-tight">
              Újbudazsibi
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest text-[#8C581F] block -mt-0.5 sm:-mt-1 font-semibold uppercase">
              www.ujbudazsibi.hu
            </span>
          </button>
        </div>

        {/* Desktop Nav - Compact, sentence case with warm ochre active line */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-xs xl:text-sm font-semibold text-[#3A352F] shrink">
          <button
            onClick={() => onSelectTab('locations')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 px-1.5 ${
              activeTab === 'locations' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Helyszínek
          </button>
          <button
            onClick={() => onSelectTab('map')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 px-1.5 ${
              activeTab === 'map' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Utcatérkép
          </button>
          <button
            onClick={() => onSelectTab('guide')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 px-1.5 ${
              activeTab === 'guide' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Méretrajz
          </button>
          <button
            onClick={() => onSelectTab('community')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 px-1.5 ${
              activeTab === 'community' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Gyerek & Grill
          </button>
          <button
            onClick={() => onSelectTab('rules')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 px-1.5 ${
              activeTab === 'rules' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Házirend
          </button>
          <button
            onClick={() => onSelectTab('reviews')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 px-1.5 ${
              activeTab === 'reviews' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Vélemények
          </button>
          <button
            onClick={onOpenVolunteer}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 text-[#1A3626] hover:text-[#C88A36] font-bold transition-colors cursor-pointer py-1 px-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-[#E2D4BA] text-[#A96E22]" />
            <span>Önkéntesség</span>
          </button>
        </nav>

        {/* Actions - Guaranteed visible on all viewports */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenReview}
            className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#4A4036] hover:text-[#1A3626] hover:bg-[#EBE2D3] rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#D5C7AF] shrink-0"
            title="Anonim vélemény a vásárról"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C88A36]" />
            <span>Vélemény</span>
          </button>

          {/* My Bookings Ticket Button - Always accessible in top right corner with badge */}
          <button
            onClick={onOpenMyBookings}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs font-serif ${
              bookingCount > 0
                ? 'bg-[#1A3626] text-[#FAF7F2] border border-[#2E543D] hover:bg-[#254834]'
                : 'bg-[#EFE8DA] text-[#4A4036] hover:bg-[#E2D8C3] border border-[#D5C7AF]'
            }`}
            title="Saját lefoglalt standjegyeim és letölthető engedélykártyáim"
          >
            <Ticket className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${bookingCount > 0 ? 'text-[#E7C286]' : 'text-stone-500'}`} />
            <span>Standjegyeim</span>
            {bookingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#C88A36] text-[#14261B] text-[10px] font-mono font-black tabular-nums shadow-xs">
                {bookingCount}
              </span>
            )}
          </button>

          <button
            onClick={onStartBooking}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-xs font-black text-[#14261B] bg-[#C88A36] hover:bg-[#B77726] active:scale-95 border border-[#A96E22] rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer font-serif tracking-wide"
          >
            Asztalt foglalok
          </button>
        </div>
      </div>

      {/* Mobile nav strip with sentence case and no-scrollbar */}
      <div className="lg:hidden flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 overflow-x-auto border-t border-[#D8CEBD] text-xs font-medium text-[#3A352F] no-scrollbar bg-[#EFE9DC]/90">
        <button
          onClick={() => onSelectTab('locations')}
          className={`whitespace-nowrap shrink-0 py-0.5 ${activeTab === 'locations' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Helyszínek
        </button>
        <button
          onClick={() => onSelectTab('map')}
          className={`whitespace-nowrap shrink-0 py-0.5 ${activeTab === 'map' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Utcatérkép
        </button>
        <button
          onClick={() => onSelectTab('guide')}
          className={`whitespace-nowrap shrink-0 py-0.5 ${activeTab === 'guide' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Méretrajz
        </button>
        <button
          onClick={() => onSelectTab('community')}
          className={`whitespace-nowrap shrink-0 py-0.5 ${activeTab === 'community' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Gyerek & Grill
        </button>
        <button
          onClick={() => onSelectTab('rules')}
          className={`whitespace-nowrap shrink-0 py-0.5 ${activeTab === 'rules' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Házirend
        </button>
        <button
          onClick={() => onSelectTab('reviews')}
          className={`whitespace-nowrap shrink-0 py-0.5 ${activeTab === 'reviews' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Vélemények
        </button>
        <button
          onClick={onOpenVolunteer}
          className="whitespace-nowrap shrink-0 text-[#1A3626] font-bold flex items-center gap-1 py-0.5"
        >
          <Heart className="w-3 h-3 fill-[#E2D4BA] text-[#A96E22]" />
          <span>Önkéntesség</span>
        </button>
        <button
          onClick={onOpenReview}
          className="whitespace-nowrap shrink-0 text-[#4A4036] font-semibold flex items-center gap-1 py-0.5"
        >
          <MessageSquare className="w-3 h-3 text-[#C88A36]" />
          <span>Vélemény</span>
        </button>
      </div>
    </header>
  );
};
