import React from 'react';
import { Store, Ticket, Heart, Sparkles, MessageSquare } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#F6F1E7]/95 backdrop-blur-md border-b border-[#D8CEBD] shadow-2xs relative overflow-hidden">
      {/* Subtle paper grain texture */}
      <div className="absolute inset-0 pointer-events-none grain-overlay opacity-40"></div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 py-3.5 relative z-10">
        
        {/* Brand: Újbudazsibi - Fraunces wordmark & vintage stamp emblem */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#1A3626] border border-[#2E543D] flex items-center justify-center text-[#E7C286] shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <button
            onClick={() => onSelectTab('map')}
            className="text-left cursor-pointer focus-visible:outline-none group"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1C2C20] whitespace-nowrap block font-serif group-hover:text-[#C88A36] transition-colors">
              Újbudazsibi
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#8C581F] block -mt-1 font-semibold uppercase">
              www.ujbudazsibi.hu
            </span>
          </button>
        </div>

        {/* Desktop Nav - Sentence Case with warm ochre active line */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#3A352F]">
          <button
            onClick={() => onSelectTab('locations')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 ${
              activeTab === 'locations' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Helyszínek és időpontok
          </button>
          <button
            onClick={() => onSelectTab('map')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 ${
              activeTab === 'map' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Utcatérkép és asztalok
          </button>
          <button
            onClick={() => onSelectTab('guide')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 ${
              activeTab === 'guide' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Méretezési útmutató
          </button>
          <button
            onClick={() => onSelectTab('community')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 ${
              activeTab === 'community' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Gyerek- és grillsarok
          </button>
          <button
            onClick={() => onSelectTab('rules')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 ${
              activeTab === 'rules' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Házirend és gyik
          </button>
          <button
            onClick={() => onSelectTab('reviews')}
            className={`whitespace-nowrap shrink-0 hover:text-[#1A3626] transition-colors cursor-pointer py-1 ${
              activeTab === 'reviews' ? 'text-[#1A3626] font-bold border-b-2 border-[#C88A36]' : ''
            }`}
          >
            Vélemények
          </button>
          <button
            onClick={onOpenVolunteer}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 text-[#1A3626] hover:text-[#C88A36] font-bold transition-colors cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-[#E2D4BA] text-[#A96E22]" />
            <span>Önkéntesnek jelentkezem</span>
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenReview}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#4A4036] hover:text-[#1A3626] hover:bg-[#EBE2D3] rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#D5C7AF]"
            title="Anonim vélemény a vásárról"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C88A36]" />
            <span>Vélemény</span>
          </button>

          {bookingCount > 0 ? (
            <button
              onClick={onOpenMyBookings}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1A3626] bg-[#E2ECE4] hover:bg-[#D3E3D7] border border-[#A4C4AC] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs font-serif"
            >
              <Ticket className="w-4 h-4 text-[#2E543D]" />
              <span>Standjegyem ({bookingCount})</span>
            </button>
          ) : (
            <button
              onClick={onStartBooking}
              className="px-4 py-2 text-xs font-extrabold text-[#1B1916] bg-[#C88A36] hover:bg-[#B77726] border border-[#A96E22] rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer font-serif tracking-wide"
            >
              Asztalt foglalok
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav strip with sentence case */}
      <div className="lg:hidden flex items-center gap-4 px-4 py-2 overflow-x-auto border-t border-[#D8CEBD] text-xs font-medium text-[#3A352F] no-scrollbar bg-[#EFE9DC]/80">
        <button
          onClick={() => onSelectTab('locations')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'locations' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Helyszínek
        </button>
        <button
          onClick={() => onSelectTab('map')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'map' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Utcatérkép
        </button>
        <button
          onClick={() => onSelectTab('guide')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'guide' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Méretrajz
        </button>
        <button
          onClick={() => onSelectTab('community')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'community' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Gyerek és grill
        </button>
        <button
          onClick={() => onSelectTab('rules')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'rules' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Házirend
        </button>
        <button
          onClick={() => onSelectTab('reviews')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'reviews' ? 'text-[#1A3626] font-bold border-b border-[#C88A36]' : ''}`}
        >
          Vélemények
        </button>
        <button
          onClick={onOpenVolunteer}
          className="whitespace-nowrap shrink-0 text-[#1A3626] font-bold flex items-center gap-1"
        >
          <Heart className="w-3 h-3 fill-[#E2D4BA] text-[#A96E22]" />
          <span>Önkéntesség</span>
        </button>
        <button
          onClick={onOpenReview}
          className="whitespace-nowrap shrink-0 text-[#4A4036] font-semibold flex items-center gap-1"
        >
          <MessageSquare className="w-3 h-3 text-[#C88A36]" />
          <span>Vélemény</span>
        </button>
      </div>
    </header>
  );
};
