import React from 'react';
import { MarketReview } from '../types/market';
import {
  Star,
  MessageSquare,
  Sparkles,
  Heart,
  CheckCircle2,
  Smile,
  ShieldCheck,
  Quote,
} from 'lucide-react';

interface ReviewsSectionProps {
  reviews: MarketReview[];
  onOpenReviewModal: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  onOpenReviewModal,
}) => {
  // Only display reviews that are approved by admin and not marked private
  const publicReviews = reviews.filter(
    (r) => r.status === 'approved' && r.publicAllowed !== false
  );

  // Calculate average ratings from public reviews
  const avgRating = publicReviews.length > 0
    ? (publicReviews.reduce((sum, r) => sum + r.rating, 0) / publicReviews.length).toFixed(1)
    : '5.0';

  const avgAtmosphere = publicReviews.length > 0
    ? (publicReviews.reduce((sum, r) => sum + r.atmosphereRating, 0) / publicReviews.length).toFixed(1)
    : '5.0';

  const avgOrg = publicReviews.length > 0
    ? (publicReviews.reduce((sum, r) => sum + r.organizationRating, 0) / publicReviews.length).toFixed(1)
    : '4.9';

  return (
    <section id="reviews-section" className="py-16 bg-[#FAF6EE] border-b border-[#D8CEBD] relative overflow-hidden">
      {/* Paper grain overlay */}
      <div className="absolute inset-0 pointer-events-none grain-overlay opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A96E22] mb-1.5 font-serif">
              <MessageSquare className="w-4 h-4 text-[#C88A36]" />
              <span>Közösségi visszajelzések és tapasztalatok</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1C2C20] tracking-tight font-serif">
              Lakossági vélemények a bolhapiacról
            </h2>
            <p className="text-sm text-[#544C42] mt-2 leading-relaxed">
              Az Újbudazsibi a helyi lakókról szól. Olvasd el a látogatók és árusok tapasztalatait, vagy írd meg a saját véleményedet az eddigi vásárokról!
            </p>
          </div>

          <button
            onClick={onOpenReviewModal}
            className="flex items-center gap-2 px-5 py-3 bg-[#1A3626] hover:bg-[#254834] text-[#E7C286] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 font-serif border border-[#2E543D]"
          >
            <Sparkles className="w-4 h-4 text-[#C88A36]" />
            <span>Írj Te is véleményt!</span>
          </button>
        </div>

        {/* Rating Scoreboard Banner */}
        <div className="bg-[#FCFAF6] border border-[#C5B69F] rounded-2xl p-6 shadow-xs mb-8 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
          <div className="flex items-center gap-4 sm:border-r border-[#E2D8C7] sm:pr-6">
            <div className="w-14 h-14 rounded-2xl bg-[#1A3626] text-[#E7C286] flex flex-col items-center justify-center font-serif shadow-xs">
              <span className="text-2xl font-black leading-none">{avgRating}</span>
              <div className="flex text-amber-300 text-[10px] mt-0.5">★★★★★</div>
            </div>
            <div>
              <span className="text-xs font-bold text-[#1C2C20] block font-serif">
                Összesített elégedettség
              </span>
              <span className="text-[11px] text-[#544C42]">
                {publicReviews.length} ellenőrzött lakossági értékelés
              </span>
            </div>
          </div>

          <div className="sm:border-r border-[#E2D8C7] sm:px-4">
            <span className="text-xs text-[#544C42] block">Vásári hangulat & közösség</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-black text-[#1C2C20] font-serif">{avgAtmosphere} / 5</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Kiváló
              </span>
            </div>
          </div>

          <div className="sm:border-r border-[#E2D8C7] sm:px-4">
            <span className="text-xs text-[#544C42] block">Szervezés & tisztaság</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-black text-[#1C2C20] font-serif">{avgOrg} / 5</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                Kiemelkedő
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#544C42] sm:pl-4">
            <ShieldCheck className="w-5 h-5 text-[#254834] shrink-0" />
            <span className="leading-tight">
              100% valódi helyi lakossági visszajelzés a vásár szervezőinek.
            </span>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FCFAF6] border border-[#D8CEBD] rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-[#C88A36] transition-all flex flex-col justify-between relative group"
            >
              <div>
                {/* Header: Stars & Date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating
                            ? 'fill-[#C88A36] text-[#C88A36]'
                            : 'fill-stone-200 text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-[#8C7E6D]">
                    {rev.submittedAt}
                  </span>
                </div>

                {/* Quote Icon & Text */}
                <div className="relative mb-4">
                  <Quote className="w-6 h-6 text-[#E2D4BA] absolute -top-1 -left-1 opacity-50 pointer-events-none" />
                  <p className="text-xs sm:text-sm text-[#2C2723] font-medium leading-relaxed pl-4 font-serif italic">
                    "{rev.feedbackText}"
                  </p>
                </div>

                {/* Optional Seller feedback note */}
                {rev.sellerFeedback && (
                  <div className="bg-[#F4EFE6] p-2.5 rounded-xl border border-[#E2D8C7] text-[11px] text-[#544C42] mb-3">
                    <span className="font-bold text-[#1C2C20] block mb-0.5 font-serif">Kiemelt standélmény:</span>
                    <span className="italic">"{rev.sellerFeedback}"</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata badges */}
              <div className="pt-3 border-t border-[#E8DFCF] flex items-center justify-between text-[11px] text-[#6B6154]">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#254834]" />
                  <span>Kerületi lakos</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span>Hangulat: {rev.atmosphereRating}/5</span>
                  <span>·</span>
                  <span>Szervezés: {rev.organizationRating}/5</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add Review Action Card */}
          <div
            onClick={onOpenReviewModal}
            className="border-2 border-dashed border-[#C5B69F] rounded-2xl p-6 bg-[#F4EFE6]/60 hover:bg-[#F4EFE6] transition-colors flex flex-col items-center justify-center text-center cursor-pointer group space-y-3 min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-[#EFE8DA] text-[#1A3626] group-hover:bg-[#1A3626] group-hover:text-[#E7C286] flex items-center justify-center transition-colors shadow-2xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1C2C20] font-serif group-hover:text-[#C88A36] transition-colors">
                Oszd meg Te is a tapasztalatodat!
              </h4>
              <p className="text-xs text-[#544C42] mt-1 max-w-xs mx-auto">
                Voltál valamelyik májusi helyszínen? Írd meg pár mondatban, hogy mit gondolsz a szervezésről és a hangulatról!
              </p>
            </div>
            <span className="text-xs font-bold text-[#1A3626] underline font-serif">
              Vélemény űrlap megnyitása →
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
