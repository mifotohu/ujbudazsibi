import React from 'react';
import { LocationData } from '../types/market';
import { Calendar, MapPin, Bus, CheckCircle2, Compass } from 'lucide-react';

interface LocationSelectorProps {
  locations: LocationData[];
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
}) => {
  return (
    <section className="bg-[#FAF6EF] border-b border-[#D8CEBD] py-8 relative overflow-hidden">
      {/* Subtle paper grain */}
      <div className="absolute inset-0 pointer-events-none grain-overlay opacity-35"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A96E22] mb-1 font-serif">
              <Compass className="w-3.5 h-3.5 text-[#C88A36]" />
              <span>Négy kerületrész · Négy májusi hétvége</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C2C20] tracking-tight font-serif">
              Májusi helyszínek a XI. kerületben
            </h2>
            <p className="text-sm text-[#4E473F] mt-1 max-w-2xl">
              Minden májusi hétvégén más újbudai utca zárul le a helyi közösség számára. Válassz helyszínt az interaktív utcatérkép és asztalok megtekintéséhez!
            </p>
          </div>
          <div className="text-xs text-[#3A352F] flex items-center gap-1.5 shrink-0 bg-[#EFE8DA] px-3.5 py-2 rounded-xl border border-[#D5C7AF] shadow-2xs font-mono">
            <span className="font-bold text-[#1A3626]">Nyitvatartás:</span>
            <span>09:00 – 17:00</span>
          </div>
        </div>

        {/* 4 Cards Grid - Vintage Postal Ticket Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map((loc) => {
            const isSelected = loc.id === selectedLocationId;
            const freeCount = loc.tables.filter((t) => t.status === 'available').length;
            const totalCount = loc.tables.length;

            return (
              <button
                key={loc.id}
                onClick={() => onSelectLocation(loc.id)}
                className={`text-left p-4 sm:p-5 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between group overflow-hidden ${
                  isSelected
                    ? 'bg-[#1A3626] text-white border-2 border-[#C88A36] shadow-md ring-1 ring-[#C88A36]/40'
                    : 'bg-[#FCFAF6] border border-[#D8CEBD] text-[#2C2723] hover:border-[#C88A36] hover:bg-white hover:shadow-2xs'
                }`}
              >
                {/* Stamp corner accent */}
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-20">
                  <div className={`w-full h-full border-t-2 border-r-2 ${isSelected ? 'border-[#E7C286]' : 'border-[#C88A36]'}`}></div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md font-serif ${
                        isSelected
                          ? 'bg-[#2E543D] text-[#E7C286] border border-[#436E52]'
                          : 'bg-[#F2EADB] text-[#8C581F] border border-[#DECDB3]'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>{loc.dateBadge}</span>
                    </span>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#E7C286] font-serif">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-[#C88A36] text-[#1A3626]" />
                        <span>Kiválasztva</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8C581F] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Kattints ide →
                      </span>
                    )}
                  </div>

                  <h3 className={`font-black text-lg leading-snug font-serif ${isSelected ? 'text-[#FAF6EF]' : 'text-[#1C2C20]'}`}>
                    {loc.name}
                  </h3>
                  
                  <p className={`text-xs mt-1.5 flex items-start gap-1 ${isSelected ? 'text-[#D0DEC8]' : 'text-[#5A5147]'}`}>
                    <MapPin className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? 'text-[#E7C286]' : 'text-[#A96E22]'}`} />
                    <span className="line-clamp-2">{loc.streetName}</span>
                  </p>

                  <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${isSelected ? 'text-[#B0C4AC]' : 'text-[#6D6356]'}`}>
                    {loc.description}
                  </p>
                </div>

                <div
                  className={`mt-5 pt-3 border-t flex items-center justify-between text-xs ${
                    isSelected ? 'border-[#2E543D]' : 'border-[#EBE3D3]'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Bus className={`w-3.5 h-3.5 ${isSelected ? 'text-[#A4C4AC]' : 'text-[#8C581F]'}`} />
                    <span className={`truncate max-w-[120px] font-medium ${isSelected ? 'text-[#D0DEC8]' : 'text-[#6D6356]'}`}>
                      {loc.neighborhood}
                    </span>
                  </div>
                  <span
                    className={`font-bold tabular-nums font-mono px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-[#2E543D] text-[#E7C286]'
                        : 'bg-[#EFE8DA] text-[#1A3626]'
                    }`}
                  >
                    {freeCount} / {totalCount} szabad
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
