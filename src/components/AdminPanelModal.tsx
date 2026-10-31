import React, { useState } from 'react';
import {
  LocationData,
  TableData,
  VolunteerApplication,
  CommercialVendorBooking,
  StreetMusicianApplication,
  MarketReview,
  KidsFleaTable,
} from '../types/market';
import { CATEGORIES } from '../data/mockData';
import { getSentEmails, SentEmailRecord } from '../lib/supabase';
import {
  X,
  ShieldAlert,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  Search,
  Filter,
  Users,
  AlertTriangle,
  Store,
  DollarSign,
  Heart,
  FileText,
  Clock,
  ArrowRight,
  Music,
  Smile,
  Briefcase,
  Star,
  MessageSquare,
  Database,
  Building,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  locations: LocationData[];
  volunteers: VolunteerApplication[];
  commercialVendors: CommercialVendorBooking[];
  musicians: StreetMusicianApplication[];
  reviews: MarketReview[];
  onClose: () => void;
  onCancelBooking: (locationId: string, tableId: number, sellerName: string) => void;
  onDeleteVolunteer: (volunteerId: string) => void;
  onDeleteCommercial: (vendorId: string) => void;
  onDeleteMusician: (musicianId: string) => void;
}

const DEFAULT_ADMIN_PASSWORD = 'UBZS27';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  locations,
  volunteers,
  commercialVendors,
  musicians,
  reviews,
  onClose,
  onCancelBooking,
  onDeleteVolunteer,
  onDeleteCommercial,
  onDeleteMusician,
}) => {
  if (!isOpen) return null;

  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState<'sellers' | 'commercial' | 'kids_flea' | 'musicians' | 'volunteers' | 'reviews' | 'emails' | 'supabase'>('sellers');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmCancelTarget, setConfirmCancelTarget] = useState<{
    locationId: string;
    tableId: number;
    sellerName: string;
    locationName: string;
  } | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === DEFAULT_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Helytelen jelszó! Kérjük, próbáld újra.');
    }
  };

  // Helper to calculate days remaining until event
  const getDaysUntilEvent = (eventDateIso: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(eventDateIso);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Aggregate all booked tables across locations
  const allBookings: {
    locationId: string;
    locationName: string;
    streetName: string;
    weekendDates: string;
    eventDateIso: string;
    daysRemaining: number;
    table: TableData;
  }[] = [];

  locations.forEach((loc) => {
    const days = getDaysUntilEvent(loc.eventDateIso);
    loc.tables.forEach((t) => {
      if (t.status === 'reserved' && t.reservedBy) {
        allBookings.push({
          locationId: loc.id,
          locationName: loc.name,
          streetName: loc.streetName,
          weekendDates: loc.weekendDates,
          eventDateIso: loc.eventDateIso,
          daysRemaining: days,
          table: t,
        });
      }
    });
  });

  // Filter bookings
  const filteredBookings = allBookings.filter((b) => {
    if (selectedLocationFilter !== 'all' && b.locationId !== selectedLocationFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.table.reservedBy?.name.toLowerCase().includes(q);
      const matchEmail = b.table.reservedBy?.email?.toLowerCase().includes(q);
      const matchRef = b.table.reservedBy?.bookingRef.toLowerCase().includes(q);
      const matchAddress = b.table.reservedBy?.districtAddress?.toLowerCase().includes(q);
      const matchTable = `stand #${b.table.id}`.includes(q) || `${b.table.id}` === q;
      return matchName || matchEmail || matchRef || matchAddress || matchTable;
    }
    return true;
  });

  const totalSellerRevenue = allBookings.reduce((sum, b) => sum + (b.table.reservedBy?.amountPaid || b.table.price), 0);
  const totalCommercialRevenue = commercialVendors.reduce((sum, v) => sum + v.feePaid, 0);
  const totalCombinedRevenue = totalSellerRevenue + totalCommercialRevenue;

  const handleExecuteCancel = () => {
    if (confirmCancelTarget) {
      onCancelBooking(
        confirmCancelTarget.locationId,
        confirmCancelTarget.tableId,
        confirmCancelTarget.sellerName
      );
      setConfirmCancelTarget(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-2xl max-w-5xl w-full border border-stone-300 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#F4EFE6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                Újbudazsibi szervezői adminisztráció
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Védett felület (ujbudazsibi.hu/admin) · E-mail cím: ujbudazsibi@gmail.com
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PASSWORD SCREEN IF NOT AUTHENTICATED */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 my-auto">
            <div className="w-14 h-14 bg-stone-900 text-amber-300 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-stone-900 font-serif">
                Biztonsági azonosítás szükséges
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                Kérjük, add meg a szervezői jelszót a standok, lemondások és adatok kezeléséhez.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-2">
              <input
                type="password"
                required
                autoFocus
                placeholder="Admin jelszó..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              {passwordError && <p className="text-xs text-red-600 font-bold">{passwordError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Belépés az admin felületre</span>
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Top KPI Metrics Strip */}
            <div className="bg-white border-b border-stone-200 px-5 sm:px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Lefoglalt lakossági standok</span>
                <span className="text-base font-bold text-stone-900 tabular-nums">
                  {allBookings.length} / 144 asztal
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Összes standbevétel</span>
                <span className="text-base font-bold text-emerald-800 font-mono tabular-nums">
                  {totalCombinedRevenue.toLocaleString()} Ft
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Gyerekzsibi & Zenészek</span>
                <span className="text-base font-bold text-blue-900 tabular-nums">
                  4 kis asztal · {musicians.length} fellépő
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Önkéntesek & Vélemények</span>
                <span className="text-base font-bold text-stone-900 tabular-nums">
                  {volunteers.length} önkéntes · {reviews.length} vélemény
                </span>
              </div>
            </div>

            {/* Tab & Filter bar */}
            <div className="bg-[#FAF8F5] px-5 sm:px-6 py-2.5 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('sellers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'sellers'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Árusok ({allBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('commercial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'commercial'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Grill & Gyereksarok ({commercialVendors.length})
                </button>
                <button
                  onClick={() => setActiveTab('kids_flea')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'kids_flea'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Gyerekzsibi
                </button>
                <button
                  onClick={() => setActiveTab('musicians')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'musicians'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Zenészek ({musicians.length})
                </button>
                <button
                  onClick={() => setActiveTab('volunteers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'volunteers'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Önkéntesek ({volunteers.length})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Vélemények ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('emails')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'emails'
                      ? 'bg-stone-900 text-amber-300 shadow-xs font-bold'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>Postafiók ({getSentEmails().length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('supabase')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'supabase'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Vercel & Supabase
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedLocationFilter}
                  onChange={(e) => setSelectedLocationFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white text-stone-700"
                >
                  <option value="all">Minden helyszín</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Keresés..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white w-32 sm:w-44 focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-2" />
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
              
              {/* TAB 1: SELLERS / ÁRUSOK with 8-day cancellation rule */}
              {activeTab === 'sellers' && (
                <div className="space-y-4">
                  
                  {/* Strict 8-day rule notification */}
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        8 napos elállási szabályzat működése:
                      </span>
                      <span>
                        Az árus foglalása a vásár előtt <strong>legkésőbb 8 nappal mondható le és törölhető</strong>. A törléssel az asztal automatikusan azonnal <strong>szabad státuszba kerül a térképen</strong>. 8 napon belül a rendszer a törlés gombot zárolja, így az asztal nem mondható le!
                      </span>
                    </div>
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div className="p-10 text-center text-stone-500 text-xs bg-white rounded-xl border border-stone-200">
                      Nincs a szűrésnek megfelelő standfoglalás.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredBookings.map((b) => {
                        const canCancel = b.daysRemaining >= 8;

                        return (
                          <div
                            key={`${b.locationId}-${b.table.id}`}
                            className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-xs px-2 py-0.5 bg-stone-900 text-white rounded tabular-nums">
                                  Stand #{b.table.id}
                                </span>
                                <span className="text-xs font-semibold text-emerald-800">
                                  {b.locationName}
                                </span>
                                <span className="text-stone-300">·</span>
                                <span className="text-xs text-stone-600">{b.weekendDates}</span>
                                <span className="text-stone-300">·</span>
                                <span className="text-[11px] font-mono text-stone-500">
                                  {b.table.reservedBy?.bookingRef}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-800">
                                <span className="font-bold text-sm text-stone-900">
                                  {b.table.reservedBy?.name}
                                </span>
                                {b.table.reservedBy?.email && (
                                  <span className="flex items-center gap-1 text-stone-600">
                                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                                    {b.table.reservedBy.email}
                                  </span>
                                )}
                                {b.table.reservedBy?.phone && (
                                  <span className="flex items-center gap-1 text-stone-600">
                                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                                    {b.table.reservedBy.phone}
                                  </span>
                                )}
                                {b.table.reservedBy?.districtAddress && (
                                  <span className="text-stone-500 text-[11px]">
                                    Lakcím: {b.table.reservedBy.districtAddress}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-stone-600 italic">
                                "{b.table.reservedBy?.note}"
                              </p>

                              {/* Categories */}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {b.table.reservedBy?.categories.map((catId) => {
                                  const cat = CATEGORIES.find((c) => c.id === catId);
                                  return (
                                    <span
                                      key={catId}
                                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                                    >
                                      {cat ? cat.label : catId}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Action column with 8-day lock logic */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-xs">
                                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                                  <span className="font-bold text-stone-800">
                                    {b.daysRemaining > 0
                                      ? `${b.daysRemaining} nap a vásárig`
                                      : 'A vásár napja / lezárult'}
                                  </span>
                                </div>
                                <span className="text-xs font-mono font-bold text-emerald-800 block tabular-nums">
                                  {(b.table.reservedBy?.amountPaid || b.table.price).toLocaleString()} Ft
                                </span>
                              </div>

                              {canCancel ? (
                                <button
                                  onClick={() =>
                                    setConfirmCancelTarget({
                                      locationId: b.locationId,
                                      tableId: b.table.id,
                                      sellerName: b.table.reservedBy?.name || '',
                                      locationName: b.locationName,
                                    })
                                  }
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                  title="Több mint 8 nap van hátra: a foglalás törölhető és az asztal azonnal felszabadul."
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Törlés & Asztal felszabadítása</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-stone-500 bg-stone-100 border border-stone-200 rounded-lg cursor-not-allowed">
                                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                                  <span>Zárolva (&lt; 8 nap van hátra)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COMMERCIAL VENDORS (GRILL & KIDS CORNER) */}
              {activeTab === 'commercial' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-600">
                      Céges és egyéni vállalkozói kitelepülések a 8 × 8 méteres területekre (Gyereksarok & Grill).
                    </p>
                    <span className="text-xs font-bold text-stone-900">
                      Összes bevétel: {totalCommercialRevenue.toLocaleString()} Ft
                    </span>
                  </div>

                  <div className="space-y-3">
                    {commercialVendors.map((v) => (
                      <div key={v.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {v.type === 'grill_corner' ? 'Grillsarok (35 000 Ft)' : 'Gyereksarok (15 000 Ft)'}
                            </span>
                            <h4 className="text-base font-bold text-stone-900 mt-1">
                              {v.companyName}
                            </h4>
                            <p className="text-xs text-stone-500 font-mono">
                              Adószám: {v.taxNumber} · Számlázási cím: {v.billingAddress}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-800">
                            {v.feePaid.toLocaleString()} Ft (Fizetve)
                          </span>
                        </div>

                        <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                          <strong className="block text-stone-900">Program / Étlap és technológia:</strong>
                          <span>{v.programOrMenuOffer}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                          <div className="flex items-center gap-3">
                            <span>Kapcsolattartó: <strong>{v.contactPerson}</strong></span>
                            <span>{v.phone}</span>
                            <span>{v.email}</span>
                          </div>
                          <button
                            onClick={() => onDeleteCommercial(v.id)}
                            className="text-stone-400 hover:text-red-700 text-[11px] cursor-pointer"
                          >
                            Törlés
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: GYEREKZSIBI */}
              {activeTab === 'kids_flea' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-600">
                    A 4 kijelölt ingyenes gyermek stand állapota helyszínenként.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {locations.map((loc) => (
                      <div key={loc.id} className="bg-white rounded-xl border border-stone-200 p-4 space-y-2">
                        <span className="font-bold text-xs text-stone-900 block font-serif">
                          {loc.name} ({loc.dateBadge})
                        </span>
                        <div className="space-y-1.5 pt-1">
                          {loc.kidsFleaTables.map((kt) => (
                            <div key={kt.id} className="p-2 rounded border border-stone-200 text-xs flex items-center justify-between">
                              <div>
                                <strong className="text-stone-900">{kt.name}</strong>
                                {kt.reservedBy ? (
                                  <span className="block text-[11px] text-stone-600">
                                    {kt.reservedBy.childName} ({kt.reservedBy.childAge} év) · Szülő: {kt.reservedBy.parentName}
                                  </span>
                                ) : (
                                  <span className="block text-[11px] text-emerald-700 font-semibold">
                                    Szabad, szülő által lefoglalható (0 Ft)
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${kt.status === 'reserved' ? 'bg-stone-200 text-stone-700' : 'bg-blue-100 text-blue-900'}`}>
                                {kt.status === 'reserved' ? 'Foglalt' : 'Szabad'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MUSICIANS */}
              {activeTab === 'musicians' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-600">
                    Utcazenész szőnyegre beérkezett fellépői jelentkezések.
                  </p>
                  {musicians.length === 0 ? (
                    <div className="p-10 text-center text-stone-500 text-xs bg-white rounded-xl border border-stone-200">
                      Még nincs beérkezett zenész jelentkezés.
                    </div>
                  ) : (
                    musicians.map((m) => (
                      <div key={m.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {m.preferredTimeSlot}
                            </span>
                            <h4 className="text-base font-bold text-stone-900 mt-1">
                              {m.musicianOrBandName}
                            </h4>
                            <p className="text-xs text-stone-600">
                              Műfaj: <strong>{m.genre}</strong> · Hangszerek: {m.instruments}
                            </p>
                          </div>
                          <button
                            onClick={() => onDeleteMusician(m.id)}
                            className="text-stone-400 hover:text-red-700 text-xs cursor-pointer"
                          >
                            Törlés
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone-600 pt-1 border-t border-stone-100">
                          <span>Kapcsolattartó: {m.contactName}</span>
                          <span>{m.phone}</span>
                          <span>{m.email}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: VOLUNTEERS */}
              {activeTab === 'volunteers' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {volunteers.map((vol) => (
                      <div key={vol.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-stone-900">{vol.fullName}</span>
                          <button onClick={() => onDeleteVolunteer(vol.id)} className="text-stone-400 hover:text-red-700 text-xs cursor-pointer">
                            Törlés
                          </button>
                        </div>
                        <div className="text-xs text-stone-600 space-y-0.5">
                          <div>E-mail: {vol.email} | Telefon: {vol.phone}</div>
                          <div>Helyszín: <strong>{vol.locationName}</strong></div>
                        </div>
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Feladatok:</span>
                          <div className="flex flex-wrap gap-1">
                            {vol.selectedTaskIds.map((tId) => (
                              <span key={tId} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">
                                {tId}
                              </span>
                            ))}
                          </div>
                        </div>
                        {vol.otherOffer && (
                          <p className="text-xs text-stone-700 italic bg-stone-50 p-2 rounded">
                            "{vol.otherOffer}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: ANONYMOUS REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl text-xs text-stone-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>
                      Az alábbi vélemények kizárólag a szervezői admin felületen láthatók, a frontenden nem publikusak!
                    </span>
                  </div>

                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                          <span className="font-mono font-bold text-xs text-stone-800 ml-1">
                            {r.rating} / 5
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-stone-400">{r.submittedAt}</span>
                      </div>
                      <p className="text-xs text-stone-800 leading-relaxed font-medium">
                        "{r.feedbackText}"
                      </p>
                      {r.sellerFeedback && (
                        <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-950 border border-amber-200">
                          <strong className="block text-[11px] text-amber-900">Privát árus visszajelzés a szervezőknek:</strong>
                          <span>"{r.sellerFeedback}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 7: SUPABASE & VERCEL */}
              {activeTab === 'supabase' && (
                <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3 text-xs text-stone-700 leading-relaxed">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm font-serif">
                    <Database className="w-4 h-4 text-emerald-800" />
                    <span>Vercel + Supabase telepítési és élesítési útmutató</span>
                  </div>
                  <p>
                    Az alkalmazás forráskódja Vercel kompatibilis és tartalmazza az összes szükséges komponenst:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>
                      <strong>GitHub repository feltöltés:</strong> A repó közvetlenül importálható a Vercel felületén (<a href="https://vercel.com" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-800">vercel.com</a>).
                    </li>
                    <li>
                      <strong>Supabase adatbázis:</strong> A projekt gyökerében elkészítettük a <code>supabase-schema.sql</code> fájlt, ami egyetlen kattintással lefuttatható a Supabase SQL szerkesztőjében.
                    </li>
                    <li>
                      <strong>Környezeti változók a Vercel Dashboardon:</strong>
                      <div className="bg-stone-900 text-amber-300 p-3 rounded-lg font-mono text-[11px] mt-1 space-y-1">
                        <div>VITE_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"</div>
                        <div>VITE_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"</div>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* TAB 7: SENT EMAILS / MAILBOX (ujbudazsibi@gmail.com) */}
              {activeTab === 'emails' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-amber-950 block text-sm">
                        Központi szervezői postafiók: ujbudazsibi@gmail.com
                      </span>
                      <p className="text-amber-900 mt-0.5">
                        Minden beérkező asztalfoglalás, önkéntes jelentkezés, céges koncesszió és vélemény automatikusan rögzítésre és továbbításra kerül ide.
                      </p>
                    </div>
                    <a
                      href="https://mail.google.com/mail/u/0/#inbox"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-stone-900 text-amber-300 font-bold rounded-lg shrink-0 flex items-center gap-1.5 hover:bg-stone-800 transition-colors cursor-pointer text-xs"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Gmail megnyitása</span>
                    </a>
                  </div>

                  {getSentEmails().length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-500 text-xs">
                      Még nem történt kiküldött értesítés ebben a munkamenetben. Próbálj ki egy standfoglalást vagy önkéntes jelentkezést a teszteléshez!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getSentEmails().map((mail) => (
                        <div
                          key={mail.id}
                          className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-2.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {mail.status}
                              </span>
                              <span className="font-bold text-xs text-stone-900">
                                {mail.subject}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-stone-500">
                              {mail.sentAt}
                            </span>
                          </div>

                          <div className="text-xs text-stone-600 flex items-center gap-2">
                            <span className="font-semibold text-stone-700">Címzett:</span>
                            <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-[11px] text-stone-800">
                              {mail.to}
                            </span>
                          </div>

                          <div
                            className="bg-[#FAF8F5] p-3 rounded-lg border border-stone-200 text-xs text-stone-700 leading-relaxed font-sans max-h-48 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: mail.htmlContent }}
                          />

                          <div className="flex justify-end pt-1">
                            <a
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(mail.to)}&su=${encodeURIComponent(mail.subject)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                            >
                              <span>Megnyitás / Új levél Gmailben →</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3 bg-[#F4EFE6] border-t border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-600">
                Központi admin e-mail: <strong>ujbudazsibi@gmail.com</strong>
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                Bezárás
              </button>
            </div>
          </>
        )}

      </div>

      {/* Confirmation Modal for Table Cancellation */}
      {confirmCancelTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-red-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>Biztosan törlöd a standfoglalást?</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Stand: <strong>#{confirmCancelTarget.tableId}</strong> ({confirmCancelTarget.locationName})<br />
              Árus: <strong>{confirmCancelTarget.sellerName}</strong>
            </p>
            <p className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              A törléssel ez az asztal azonnal <strong>szabad státuszba kerül az utcaalaprajzon</strong>, és más látogató azonnal lefoglalhatja!
            </p>
            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmCancelTarget(null)}
                className="px-3 py-1.5 font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
              >
                Mégse
              </button>
              <button
                onClick={handleExecuteCancel}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                Igen, törlöm és felszabadítom az asztalt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
