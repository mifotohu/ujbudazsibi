/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_LOCATIONS,
  INITIAL_VOLUNTEERS,
  INITIAL_COMMERCIAL_VENDORS,
  INITIAL_MUSICIANS,
  INITIAL_REVIEWS,
} from './data/mockData';
import {
  LocationData,
  TableData,
  ConfirmedBooking,
  VolunteerApplication,
  CommercialVendorBooking,
  StreetMusicianApplication,
  MarketReview,
  KidsFleaTable,
  CommercialType,
} from './types/market';
import { TopBar } from './components/TopBar';
import { LocationSelector } from './components/LocationSelector';
import { StreetPlanView } from './components/StreetPlanView';
import { TableDetailModal } from './components/TableDetailModal';
import { BookingModal } from './components/BookingModal';
import { DimensionGuideModal } from './components/DimensionGuideModal';
import { CommunityZonesView } from './components/CommunityZonesView';
import { RulesAndFaqSection } from './components/RulesAndFaqSection';
import { MyBookingsDrawer } from './components/MyBookingsDrawer';
import { VolunteerModal } from './components/VolunteerModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { CommercialVendorModal } from './components/CommercialVendorModal';
import { KidsFleaModal } from './components/KidsFleaModal';
import { StreetMusicianModal } from './components/StreetMusicianModal';
import { ReviewModal } from './components/ReviewModal';
import { ReviewsSection } from './components/ReviewsSection';
import { GreenBoxModal } from './components/GreenBoxModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import {
  saveBookingToSupabase,
  fetchBookingsFromSupabase,
  cancelBookingInSupabase,
  saveVolunteerToSupabase,
  saveCommercialToSupabase,
  saveReviewToSupabase,
  saveNotificationToSupabase,
  fetchNotificationFromSupabase,
  SUPABASE_CONFIG,
} from './lib/supabase';
import {
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Baby,
  Flame,
  ArrowRight,
  Store,
  Sparkles,
  CheckCircle2,
  Heart,
  Gift,
  Music,
  Smile,
  MessageSquare,
  Lock,
  Bell,
  X,
} from 'lucide-react';

export default function App() {
  const [locations, setLocations] = useState<LocationData[]>(() => {
    const saved = localStorage.getItem('ujbuda_locations_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_LOCATIONS;
      }
    }
    return INITIAL_LOCATIONS;
  });

  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>(() => {
    const saved = localStorage.getItem('ujbuda_volunteers_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_VOLUNTEERS;
      }
    }
    return INITIAL_VOLUNTEERS;
  });

  const [commercialVendors, setCommercialVendors] = useState<CommercialVendorBooking[]>(() => {
    const saved = localStorage.getItem('ujbuda_commercial_vendors_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_COMMERCIAL_VENDORS;
      }
    }
    return INITIAL_COMMERCIAL_VENDORS;
  });

  const [musicians, setMusicians] = useState<StreetMusicianApplication[]>(() => {
    const saved = localStorage.getItem('ujbuda_musicians_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MUSICIANS;
      }
    }
    return INITIAL_MUSICIANS;
  });

  const [reviews, setReviews] = useState<MarketReview[]>(() => {
    const saved = localStorage.getItem('ujbuda_reviews_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_REVIEWS;
      }
    }
    return INITIAL_REVIEWS;
  });

  const [myBookings, setMyBookings] = useState<ConfirmedBooking[]>(() => {
    const saved = localStorage.getItem('ujbuda_my_bookings_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [siteNotification, setSiteNotification] = useState<string>(() => {
    return localStorage.getItem('ujbuda_site_notification_v1') || '';
  });

  const [selectedLocationId, setSelectedLocationId] = useState<string>('bartok');
  const [activeTab, setActiveTab] = useState<string>('map');
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

  // Modals state
  const [isTableDetailOpen, setIsTableDetailOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Additional community & commercial modals
  const [isCommercialOpen, setIsCommercialOpen] = useState(false);
  const [commercialType, setCommercialType] = useState<CommercialType>('kids_corner');
  const [isKidsFleaOpen, setIsKidsFleaOpen] = useState(false);
  const [selectedKidsTable, setSelectedKidsTable] = useState<KidsFleaTable | null>(null);
  const [isMusicianOpen, setIsMusicianOpen] = useState(false);
  const [isGreenBoxOpen, setIsGreenBoxOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // URL route check for /admin or #admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const isPathAdmin = window.location.pathname === '/admin' || window.location.pathname === '/admin/';
      const isHashAdmin = window.location.hash === '#admin';
      if (isPathAdmin || isHashAdmin) {
        setIsAdminOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  // Sync with Supabase remote database on mount (if configured)
  useEffect(() => {
    if (SUPABASE_CONFIG.isConfigured) {
      // 1. Sync remote bookings with table state
      fetchBookingsFromSupabase().then((remoteBookings) => {
        if (remoteBookings && remoteBookings.length > 0) {
          setLocations((prevLocations) =>
            prevLocations.map((loc) => ({
              ...loc,
              tables: loc.tables.map((tbl) => {
                const remote = remoteBookings.find(
                  (rb) => rb.locationId === loc.id && rb.tableId === tbl.id
                );
                if (remote) {
                  return {
                    ...tbl,
                    status: 'reserved',
                    reservedBy: {
                      name: remote.sellerName,
                      email: remote.email,
                      phone: remote.phone,
                      districtAddress: remote.streetAddress,
                      postalCode: remote.postalCode,
                      isImmediateNeighbor: remote.isImmediateNeighbor,
                      categories: remote.categories,
                      note: remote.itemsDescription,
                      bookingRef: remote.bookingId,
                      bookedAt: remote.createdAt,
                      amountPaid: remote.totalPaid,
                    },
                  };
                }
                return tbl;
              }),
            }))
          );
        }
      });

      // 2. Sync site notification
      fetchNotificationFromSupabase().then((remoteNotif) => {
        if (typeof remoteNotif === 'string' && remoteNotif.trim()) {
          setSiteNotification(remoteNotif.trim());
        }
      });
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('ujbuda_locations_v3', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('ujbuda_volunteers_v3', JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem('ujbuda_commercial_vendors_v3', JSON.stringify(commercialVendors));
  }, [commercialVendors]);

  useEffect(() => {
    localStorage.setItem('ujbuda_musicians_v3', JSON.stringify(musicians));
  }, [musicians]);

  useEffect(() => {
    localStorage.setItem('ujbuda_reviews_v3', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('ujbuda_my_bookings_v3', JSON.stringify(myBookings));
  }, [myBookings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const activeLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

  const handleSelectTable = (table: TableData) => {
    setSelectedTable(table);
    setIsTableDetailOpen(true);
  };

  const handleStartBookingForTable = (table: TableData) => {
    setSelectedTable(table);
    setIsTableDetailOpen(false);
    setIsBookingModalOpen(true);
  };

  const handleStartBookingGeneral = () => {
    const firstFree = activeLocation.tables.find((t) => t.status === 'available');
    if (firstFree) {
      setSelectedTable(firstFree);
      setIsBookingModalOpen(true);
    } else {
      setIsGuideModalOpen(true);
    }
  };

  const handleConfirmBooking = (booking: ConfirmedBooking) => {
    setMyBookings((prev) => [booking, ...prev]);

    // Update location table status to reserved
    setLocations((prevLocations) =>
      prevLocations.map((loc) => {
        if (loc.id === booking.locationId) {
          return {
            ...loc,
            tables: loc.tables.map((tbl) => {
              if (tbl.id === booking.tableId) {
                return {
                  ...tbl,
                  status: 'reserved',
                  reservedBy: {
                    name: booking.sellerName,
                    email: booking.email,
                    phone: booking.phone,
                    districtAddress: booking.streetAddress,
                    postalCode: booking.postalCode,
                    isImmediateNeighbor: booking.isImmediateNeighbor,
                    categories: booking.categories,
                    note: booking.itemsDescription,
                    bookingRef: booking.bookingId,
                    bookedAt: booking.createdAt,
                    amountPaid: booking.totalPaid,
                  },
                };
              }
              return tbl;
            }),
          };
        }
        return loc;
      })
    );

    // Save to Supabase remote database if configured
    saveBookingToSupabase(booking).catch((err) => {
      console.warn('Supabase booking sync notice:', err);
    });

    showToast(`Stand #${booking.tableId} sikeresen lefoglalva! Visszaigazolás elküldve: ${booking.email} és ujbudazsibi@gmail.com`);
  };

  // ADMIN ACTION: Cancel booking & free up table (enforced by 8-day rule in AdminPanelModal)
  const handleCancelBooking = (locationId: string, tableId: number, sellerName: string) => {
    // Find table bookingRef to cancel in remote Supabase
    const locObj = locations.find((l) => l.id === locationId);
    const tableObj = locObj?.tables.find((t) => t.id === tableId);
    if (tableObj?.reservedBy?.bookingRef) {
      cancelBookingInSupabase(tableObj.reservedBy.bookingRef).catch((err) => {
        console.warn('Supabase cancellation sync notice:', err);
      });
    }

    setLocations((prevLocations) =>
      prevLocations.map((loc) => {
        if (loc.id === locationId) {
          return {
            ...loc,
            tables: loc.tables.map((tbl) => {
              if (tbl.id === tableId) {
                return {
                  ...tbl,
                  status: 'available',
                  reservedBy: undefined,
                };
              }
              return tbl;
            }),
          };
        }
        return loc;
      })
    );

    showToast(`Stand #${tableId} (${sellerName}) törölve! Az asztal azonnal felszabadult és újra foglalható.`);
  };

  // Kids Flea table booking
  const handleBookKidsTable = (tableId: string, bookingData: {
    parentName: string;
    childName: string;
    childAge: number;
    email: string;
    phone: string;
    itemsDescription: string;
  }) => {
    setLocations((prevLocations) =>
      prevLocations.map((loc) => {
        if (loc.id === activeLocation.id) {
          return {
            ...loc,
            kidsFleaTables: loc.kidsFleaTables.map((kt) => {
              if (kt.id === tableId) {
                return {
                  ...kt,
                  status: 'reserved',
                  reservedBy: {
                    ...bookingData,
                    bookingRef: `GY-${Date.now().toString().slice(-4)}`,
                    bookedAt: new Date().toLocaleDateString('hu-HU'),
                  },
                };
              }
              return kt;
            }),
          };
        }
        return loc;
      })
    );

    showToast(`${tableId} Gyerekzsibi asztal sikeresen rögzítve!`);
  };

  // Commercial vendor handlers
  const handleSubmitCommercial = (newVendor: CommercialVendorBooking) => {
    setCommercialVendors((prev) => [newVendor, ...prev]);
    saveCommercialToSupabase(newVendor).catch(() => {});
    showToast(`Vállalkozói jelentkezés rögzítve (${newVendor.companyName}). Értesítés elküldve a szervezőknek.`);
  };

  const handleDeleteCommercial = (vendorId: string) => {
    setCommercialVendors((prev) => prev.filter((v) => v.id !== vendorId));
    showToast('Vállalkozói koncesszió törölve.');
  };

  // Musician handlers
  const handleSubmitMusician = (newMusician: StreetMusicianApplication) => {
    setMusicians((prev) => [newMusician, ...prev]);
    showToast(`Zenész jelentkezés rögzítve (${newMusician.musicianOrBandName}). Hamarosan egyeztetünk!`);
  };

  const handleDeleteMusician = (musicianId: string) => {
    setMusicians((prev) => prev.filter((m) => m.id !== musicianId));
    showToast('Utcazenész törölve.');
  };

  // Kids Flea table cancellation handler (frees table & updates state/localStorage)
  const handleCancelKidsTable = (locationId: string, tableId: string) => {
    setLocations((prevLocations) =>
      prevLocations.map((loc) => {
        if (loc.id === locationId) {
          return {
            ...loc,
            kidsFleaTables: loc.kidsFleaTables.map((kt) => {
              if (kt.id === tableId) {
                return {
                  ...kt,
                  status: 'available',
                  reservedBy: undefined,
                };
              }
              return kt;
            }),
          };
        }
        return loc;
      })
    );
    showToast(`${tableId} Gyerekzsibi asztal felszabadítva!`);
  };

  // Review handlers & moderation
  const handleSubmitReview = (newReview: MarketReview) => {
    setReviews((prev) => [newReview, ...prev]);
    saveReviewToSupabase(newReview).catch(() => {});
    showToast('Köszönjük! Anonim véleményed rögzítettük a szervezőség számára.');
  };

  const handleApproveReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'approved' } : r))
    );
    showToast('Vélemény jóváhagyva: mostantól megjelenik a weboldalon.');
  };

  const handleRejectReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'rejected' } : r))
    );
    showToast('Vélemény elrejtve a weboldalról.');
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    showToast('Vélemény véglegesen törölve.');
  };

  // Volunteer handlers
  const handleSubmitVolunteer = (newVolunteer: VolunteerApplication) => {
    setVolunteers((prev) => [newVolunteer, ...prev]);
    saveVolunteerToSupabase(newVolunteer).catch(() => {});
    showToast(`Köszönjük, ${newVolunteer.fullName}! Jelentkezésed rögzítve és elküldve (ujbudazsibi@gmail.com).`);
  };

  const handleDeleteVolunteer = (volunteerId: string) => {
    setVolunteers((prev) => prev.filter((v) => v.id !== volunteerId));
    showToast('Önkéntes törölve a nyilvántartásból.');
  };

  const handleOpenCommunityZone = (zone: 'kids' | 'grill') => {
    setActiveTab('community');
    const el = document.getElementById('community-zones');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'locations') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'guide') {
      setIsGuideModalOpen(true);
    } else if (tab === 'community') {
      const el = document.getElementById('community-zones');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'rules') {
      const el = document.getElementById('rules-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'reviews') {
      const el = document.getElementById('reviews-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'map') {
      const el = document.getElementById('street-plan-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleSaveSiteNotification = (text: string) => {
    const cleanText = text.slice(0, 200).trim();
    setSiteNotification(cleanText);
    saveNotificationToSupabase(cleanText).catch(() => {});
    if (cleanText) {
      localStorage.setItem('ujbuda_site_notification_v1', cleanText);
      showToast('Értesítés közzétéve a weboldal tetején!');
    } else {
      localStorage.removeItem('ujbuda_site_notification_v1');
      showToast('Értesítés törölve, a sáv eltűnt a weboldalról.');
    }
  };

  const handleDeleteSiteNotification = () => {
    setSiteNotification('');
    saveNotificationToSupabase('').catch(() => {});
    localStorage.removeItem('ujbuda_site_notification_v1');
    showToast('Értesítés törölve, a sáv eltűnt a weboldalról.');
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FAF7F2] text-stone-900 flex flex-col font-sans selection:bg-[#E8D4B8]">
      
      {/* TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed top-18 right-4 sm:right-6 z-50 max-w-md bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl border border-stone-700 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-stone-200">{toastMessage}</p>
        </div>
      )}

      {/* 0. DEDICATED TOP SITE NOTIFICATION BOX (Max 200 chars - Red background as requested) */}
      {siteNotification && siteNotification.trim().length > 0 && (
        <aside
          role="alert"
          aria-live="polite"
          className="bg-[#DC2626] text-white border-b border-red-700 px-3.5 sm:px-6 py-2.5 relative z-50 shadow-md animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="p-1 sm:p-1.5 rounded-lg bg-white text-red-700 shrink-0 font-bold shadow-xs">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </span>
              <p className="font-bold text-white leading-snug break-words">
                {siteNotification}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSiteNotification('')}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
              title="Értesítés elrejtése"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* 1. TOP BAR - Sentence Case */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleTabClick}
        bookingCount={myBookings.length}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onStartBooking={handleStartBookingGeneral}
        onOpenVolunteer={() => setIsVolunteerOpen(true)}
        onOpenReview={() => setIsReviewOpen(true)}
      />

      {/* 2. AIRY, AUTHENTIC RETRO FLEA MARKET HERO SECTION - Fraunces & Warm Ochre with Grain */}
      <section className="bg-[#1A3626] text-white py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden border-b border-[#2A4D38]">
        {/* Fine grain overlay */}
        <div className="absolute inset-0 pointer-events-none grain-overlay-dark"></div>

        {/* Vintage warm radial aura */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C88A36]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#426E53]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
          <div className="max-w-2xl space-y-5">
            
            {/* Vintage Postmark Stamp Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#254834]/80 border border-[#426E53] rounded-full text-xs font-semibold text-[#E7C286] font-serif shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#C88A36]"></span>
              <span>Újbudazsibi · Budapest XI. kerület májusi közösségi zsibvására</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-[#FBF6EE] font-serif">
              Tavaszi közösségi bolhapiac és zsibvásár májusban
            </h1>

            <p className="text-sm sm:text-base text-[#D5E4D8] leading-relaxed font-normal">
              Minden májusi hétvégén egy-egy újbudai utcát zárunk le az autók elől (00:00 – 21:00). 36 db biztosított fa sörpad-asztal (250 × 100 cm hasznos standterület), ingyenes gyereksarok kézművességgel, illatozó faszenes grill, utcazenészek és zöld cserebere asztal várja a szomszédokat és családokat!
            </p>

            {/* Quick value props with warm ochre checkmarks */}
            <div className="pt-1 flex flex-wrap items-center gap-5 text-xs font-medium text-[#E7C286]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#C88A36]" />
                <span className="text-[#F1E8D9]">250×100 cm árusítóhely (120×80 cm asztal)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#C88A36]" />
                <span className="text-[#F1E8D9]">Kizárólag újbudai lakosoknak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#C88A36]" />
                <span className="text-[#F1E8D9]">Helyi lakosoknak 4 050 Ft (-10%)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleStartBookingGeneral}
                className="px-6 py-3 bg-[#C88A36] hover:bg-[#B77726] active:scale-95 text-[#1B1916] font-black text-xs sm:text-sm rounded-xl shadow-md border border-[#A96E22] transition-all cursor-pointer font-serif tracking-wide"
              >
                Asztal lefoglalása
              </button>
              <button
                onClick={() => {
                  setCommercialType('kids_corner');
                  setIsCommercialOpen(true);
                }}
                className="px-4 py-3 bg-[#254834] hover:bg-[#325d43] text-[#FBF6EE] border border-[#4E7D5E] font-bold text-xs rounded-xl transition-colors cursor-pointer font-serif"
              >
                Gyerek- és grillsarok koncesszió
              </button>
              <button
                onClick={() => setIsVolunteerOpen(true)}
                className="flex items-center gap-1.5 px-4 py-3 bg-transparent hover:bg-white/10 text-[#E7C286] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-[#C88A36] fill-[#C88A36]/30" />
                <span>Önkéntesnek jelentkezem</span>
              </button>
            </div>

          </div>

          {/* Quick location feature card - Vintage ticket placard with 4 selectable locations at top */}
          <div className="bg-[#244733]/95 backdrop-blur-md border border-[#426E53] p-5 sm:p-6 rounded-2xl flex flex-col justify-between shrink-0 w-full lg:max-w-md shadow-xl relative overflow-hidden group">
            {/* Top-right stamp motif */}
            <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none opacity-25">
              <div className="w-full h-full border-t-2 border-r-2 border-[#E7C286]"></div>
            </div>

            <div>
              {/* TOP: 4 selectable locations pill buttons */}
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E7C286] block mb-2 font-serif flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C88A36]"></span>
                  <span>Válassz májusi helyszínt:</span>
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {locations.map((loc) => {
                    const isSel = loc.id === selectedLocationId;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setSelectedLocationId(loc.id);
                          setSelectedTable(null);
                        }}
                        className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                          isSel
                            ? 'bg-[#C88A36] text-[#1B1916] font-black border-[#E7C286] shadow-md ring-1 ring-[#E7C286]/50'
                            : 'bg-[#183122] text-[#D5E4D8] border-[#31573F] hover:bg-[#203f2c]'
                        }`}
                      >
                        <span className="block text-xs font-serif font-bold truncate leading-tight">
                          {loc.name}
                        </span>
                        <span className="text-[10px] opacity-80 block font-mono mt-0.5">
                          {loc.dateBadge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM: Selected location details */}
              <div className="pt-3.5 border-t border-[#345F45]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#E7C286] font-serif mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C88A36]"></span>
                  <span>Kiválasztott helyszín</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#FBF6EE] leading-tight font-serif">
                  {activeLocation.name}
                </h3>
                <p className="text-xs text-[#D5E4D8] mt-1.5 flex items-start gap-1 leading-normal font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#C88A36] shrink-0 mt-0.5" />
                  <span>{activeLocation.streetName} · {activeLocation.weekendDates}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#345F45] flex items-center justify-between text-xs">
              <span className="text-[#E7C286] font-bold font-mono">
                {activeLocation.tables.filter((t) => t.status === 'available').length} szabad asztal
              </span>
              <button
                type="button"
                onClick={handleStartBookingGeneral}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F6F1E7] text-[#1C2C20] font-black text-xs rounded-xl shadow-xs hover:bg-white transition-colors cursor-pointer font-serif"
              >
                <span>Asztal kiválasztása</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C88A36]" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. LOCATION SELECTOR */}
      <LocationSelector
        locations={locations}
        selectedLocationId={selectedLocationId}
        onSelectLocation={(id) => {
          setSelectedLocationId(id);
          setSelectedTable(null);
        }}
      />

      {/* 4. INTERACTIVE 2D STREET PLAN VIEW */}
      <div id="street-plan-section">
        <StreetPlanView
          location={activeLocation}
          selectedTableId={selectedTable?.id ?? null}
          onSelectTable={handleSelectTable}
          onOpenCommunityZone={handleOpenCommunityZone}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onOpenKidsFleaModal={(kidsTable) => {
            setSelectedKidsTable(kidsTable);
            setIsKidsFleaOpen(true);
          }}
          onOpenMusicianModal={() => setIsMusicianOpen(true)}
          onOpenGreenBoxInfo={() => setIsGreenBoxOpen(true)}
          onOpenCommercialModal={(type) => {
            setCommercialType(type);
            setIsCommercialOpen(true);
          }}
        />
      </div>

      {/* 4.5 COMMUNITY INITIATIVES HIGHLIGHT STRIP - Vintage Paper Postcards with Grain */}
      <section className="py-10 bg-[#FAF6EE] border-b border-[#D8CEBD] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-overlay opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#A96E22] font-serif block">
                Közösségi szigetek
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#1C2C20] font-serif">
                Minden ami a vásári forgatagot élménnyé teszi
              </h3>
            </div>
            <span className="text-xs text-[#6B6154] font-medium">
              Kattints a részletekért vagy a jelentkezéshez!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Zöld Doboz */}
            <button
              onClick={() => setIsGreenBoxOpen(true)}
              className="text-left bg-white p-5 rounded-2xl border border-[#D8CEBD] shadow-2xs hover:border-[#254834] hover:shadow-xs transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="w-1.5 h-full bg-[#254834] absolute left-0 top-0"></div>
              <div>
                <div className="flex items-center gap-2 text-[#1A3626] font-bold text-sm mb-1.5 font-serif">
                  <div className="p-1.5 rounded-lg bg-[#EAF1EC] text-[#254834]">
                    <Gift className="w-4 h-4" />
                  </div>
                  <span>Zöld Doboz cserebere</span>
                </div>
                <p className="text-xs text-[#544C42] leading-relaxed">
                  Ingyen elvihető közösségi sarok növényeknek, könyveknek, tiszta játékoknak. (Nem kacatleadás!)
                </p>
              </div>
              <span className="text-xs text-[#1A3626] font-bold mt-4 inline-block font-serif group-hover:text-[#C88A36] transition-colors">
                Részletek és szabályzat →
              </span>
            </button>

            {/* 2. Gyerekzsibi */}
            <button
              onClick={() => {
                const firstKidsTable = activeLocation.kidsFleaTables[0];
                setSelectedKidsTable(firstKidsTable);
                setIsKidsFleaOpen(true);
              }}
              className="text-left bg-white p-5 rounded-2xl border border-[#D8CEBD] shadow-2xs hover:border-[#1E3A8A] hover:shadow-xs transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="w-1.5 h-full bg-[#1E3A8A] absolute left-0 top-0"></div>
              <div>
                <div className="flex items-center gap-2 text-[#1E3A8A] font-bold text-sm mb-1.5 font-serif">
                  <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#1E3A8A]">
                    <Smile className="w-4 h-4" />
                  </div>
                  <span>Gyerekzsibi asztalok (0 Ft)</span>
                </div>
                <p className="text-xs text-[#544C42] leading-relaxed">
                  4 db díjmentes kis asztal gyerkőcöknek szülői kísérettel a kinőtt játékok eladására.
                </p>
              </div>
              <span className="text-xs text-[#1E3A8A] font-bold mt-4 inline-block font-serif group-hover:underline">
                Gyerekasztal foglalás →
              </span>
            </button>

            {/* 3. Utcazenész szőnyeg */}
            <button
              onClick={() => setIsMusicianOpen(true)}
              className="text-left bg-white p-5 rounded-2xl border border-[#D8CEBD] shadow-2xs hover:border-[#C88A36] hover:shadow-xs transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="w-1.5 h-full bg-[#C88A36] absolute left-0 top-0"></div>
              <div>
                <div className="flex items-center gap-2 text-[#A96E22] font-bold text-sm mb-1.5 font-serif">
                  <div className="p-1.5 rounded-lg bg-[#FDF8EE] text-[#C88A36]">
                    <Music className="w-4 h-4" />
                  </div>
                  <span>Utcazenész szőnyeg</span>
                </div>
                <p className="text-xs text-[#544C42] leading-relaxed">
                  Perzsa szőnyeg és 2 szék a kávézó mellett akusztikus duóknak, harmonikásoknak.
                </p>
              </div>
              <span className="text-xs text-[#A96E22] font-bold mt-4 inline-block font-serif group-hover:text-[#1A3626] transition-colors">
                Fellépői regisztráció →
              </span>
            </button>

            {/* 4. Anonim vélemény */}
            <button
              onClick={() => setIsReviewOpen(true)}
              className="text-left bg-white p-5 rounded-2xl border border-[#D8CEBD] shadow-2xs hover:border-[#3A352F] hover:shadow-xs transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="w-1.5 h-full bg-[#3A352F] absolute left-0 top-0"></div>
              <div>
                <div className="flex items-center gap-2 text-[#1C2C20] font-bold text-sm mb-1.5 font-serif">
                  <div className="p-1.5 rounded-lg bg-[#EFE8DA] text-[#3A352F]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>Anonim visszajelzés</span>
                </div>
                <p className="text-xs text-[#544C42] leading-relaxed">
                  Oszd meg véleményed a hangulatról, szervezésről vagy egy konkrét standról a szervezőkkel.
                </p>
              </div>
              <span className="text-xs text-[#1C2C20] font-bold mt-4 inline-block font-serif group-hover:text-[#C88A36] transition-colors">
                Vélemény írása →
              </span>
            </button>

          </div>
        </div>
      </section>

      {/* 5. COMMUNITY ZONES (KIDS & GRILL) */}
      <div id="community-zones">
        <CommunityZonesView
          onStartBooking={handleStartBookingGeneral}
          onOpenVolunteer={() => setIsVolunteerOpen(true)}
          onOpenCommercialVendor={(type) => {
            setCommercialType(type);
            setIsCommercialOpen(true);
          }}
        />
      </div>

      {/* 5.5 REVIEWS SECTION (Lakossági vélemények a bolhapiacról) */}
      <ReviewsSection
        reviews={reviews}
        onOpenReviewModal={() => setIsReviewOpen(true)}
      />

      {/* 6. RULES & FAQ */}
      <div id="rules-section">
        <RulesAndFaqSection />
      </div>

      {/* 7. FOOTER - Archival Dark Forest Green */}
      <footer className="bg-[#14261B] text-[#D5E4D8] py-14 border-t border-[#234632] text-xs relative overflow-hidden">
        {/* Grain overlay */}
        <div className="absolute inset-0 pointer-events-none grain-overlay-dark opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 relative z-10">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#234632]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#254834] border border-[#3E664D] flex items-center justify-center text-[#E7C286] shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-[#FBF6EE] text-lg block font-serif tracking-tight">
                  Újbudazsibi
                </span>
                <span className="text-[#A4C4AC] text-xs">
                  Budapest XI. Kerületi Közösségi Bolhapiac és Zsibvásár · www.ujbudazsibi.hu
                </span>
              </div>
            </div>

            <div className="text-xs text-[#D5E4D8]">
              <span>Szervezői kapcsolattartás: </span>
              <a href="mailto:ujbudazsibi@gmail.com" className="text-[#E7C286] font-bold hover:underline font-mono">
                ujbudazsibi@gmail.com
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#A4C4AC] text-xs">
            <div className="flex flex-wrap items-center gap-5 font-medium">
              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Méretezési szabályzat (250×100 cm)
              </button>
              <button
                onClick={() => handleTabClick('rules')}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Házirend és gyik
              </button>
              <button
                onClick={() => setIsPrivacyPolicyOpen(true)}
                className="hover:text-white cursor-pointer text-[#E7C286] font-semibold transition-colors"
              >
                Adatkezelési nyilatkozat
              </button>
              <button
                onClick={() => setIsReviewOpen(true)}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Vélemények
              </button>
              <button
                onClick={() => setIsVolunteerOpen(true)}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Önkéntesség
              </button>
              <a
                href="#admin"
                onClick={(e) => {
                  e.preventDefault();
                  setIsAdminOpen(true);
                }}
                className="hover:text-[#E7C286] text-[#6E8F76] text-[11px] cursor-pointer transition-colors"
                title="Szervezői belépés"
              >
                Adminisztráció
              </a>
            </div>

            <div className="text-[11px] text-[#6E8F76]">
              <span>Az oldal AI eszközökkel készült.</span>
            </div>
          </div>

        </div>
      </footer>

      {/* FLOATING SCROLL TO TOP BUTTON */}
      <ScrollToTopButton />

      {/* MODALS */}
      {/* A. Single Table Detail & Size Blueprint */}
      <TableDetailModal
        table={selectedTable}
        location={activeLocation}
        isOpen={isTableDetailOpen}
        onClose={() => setIsTableDetailOpen(false)}
        onStartBookingForTable={handleStartBookingForTable}
      />

      {/* B. Multi-step Booking & Payment Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        table={selectedTable}
        location={activeLocation}
        onClose={() => setIsBookingModalOpen(false)}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* C. Dimension Guide Modal */}
      <DimensionGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onStartBooking={() => {
          setIsGuideModalOpen(false);
          handleStartBookingGeneral();
        }}
      />

      {/* D. My Bookings Drawer */}
      <MyBookingsDrawer
        isOpen={isMyBookingsOpen}
        bookings={myBookings}
        onClose={() => setIsMyBookingsOpen(false)}
        onStartNewBooking={() => {
          setIsMyBookingsOpen(false);
          handleStartBookingGeneral();
        }}
      />

      {/* E. Volunteer Sign-up Modal */}
      <VolunteerModal
        isOpen={isVolunteerOpen}
        locations={locations}
        selectedLocationId={selectedLocationId}
        onClose={() => setIsVolunteerOpen(false)}
        onSubmitVolunteer={handleSubmitVolunteer}
      />

      {/* F. Commercial Vendor Concession Modal (Kids & Grill) */}
      <CommercialVendorModal
        isOpen={isCommercialOpen}
        type={commercialType}
        locations={locations}
        selectedLocationId={selectedLocationId}
        onClose={() => setIsCommercialOpen(false)}
        onSubmitCommercial={handleSubmitCommercial}
      />

      {/* G. Kids Flea Table Modal (Gyerekzsibi 0 Ft) */}
      <KidsFleaModal
        isOpen={isKidsFleaOpen}
        table={selectedKidsTable}
        location={activeLocation}
        onClose={() => setIsKidsFleaOpen(false)}
        onBookKidsTable={handleBookKidsTable}
      />

      {/* H. Street Musician Application Modal */}
      <StreetMusicianModal
        isOpen={isMusicianOpen}
        locations={locations}
        selectedLocationId={selectedLocationId}
        onClose={() => setIsMusicianOpen(false)}
        onSubmitMusician={handleSubmitMusician}
      />

      {/* I. Anonymous Market Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmitReview={handleSubmitReview}
      />

      {/* J. Green Box (Zöld Doboz) Information Modal */}
      <GreenBoxModal
        isOpen={isGreenBoxOpen}
        onClose={() => setIsGreenBoxOpen(false)}
        onOpenVolunteer={() => setIsVolunteerOpen(true)}
      />

      {/* K. Privacy Policy & GDPR Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />

      {/* L. Organizer Admin Panel Modal (with 8-day cancellation rule, password UBZS27, multi-tab xlsx export) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        locations={locations}
        volunteers={volunteers}
        commercialVendors={commercialVendors}
        musicians={musicians}
        reviews={reviews}
        siteNotification={siteNotification}
        onSaveNotification={handleSaveSiteNotification}
        onDeleteNotification={handleDeleteSiteNotification}
        onClose={handleCloseAdmin}
        onCancelBooking={handleCancelBooking}
        onCancelKidsTable={handleCancelKidsTable}
        onDeleteVolunteer={handleDeleteVolunteer}
        onDeleteCommercial={handleDeleteCommercial}
        onDeleteMusician={handleDeleteMusician}
        onApproveReview={handleApproveReview}
        onRejectReview={handleRejectReview}
        onDeleteReview={handleDeleteReview}
      />

    </div>
  );
}
