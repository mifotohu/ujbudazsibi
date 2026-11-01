import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  LocationData,
  TableData,
  VolunteerApplication,
  CommercialVendorBooking,
  StreetMusicianApplication,
  MarketReview,
  KidsFleaTable,
  formatGdprName,
} from '../types/market';
import { CATEGORIES, VOLUNTEER_TASKS } from '../data/mockData';
import { getSentEmails } from '../lib/supabase';
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
  FileSpreadsheet,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
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
  onCancelKidsTable: (locationId: string, tableId: string) => void;
  onDeleteVolunteer: (volunteerId: string) => void;
  onDeleteCommercial: (vendorId: string) => void;
  onDeleteMusician: (musicianId: string) => void;
  onApproveReview: (reviewId: string) => void;
  onRejectReview: (reviewId: string) => void;
  onDeleteReview: (reviewId: string) => void;
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
  onCancelKidsTable,
  onDeleteVolunteer,
  onDeleteCommercial,
  onDeleteMusician,
  onApproveReview,
  onRejectReview,
  onDeleteReview,
}) => {
  if (!isOpen) return null;

  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState<
    'sellers' | 'commercial' | 'kids_flea' | 'musicians' | 'volunteers' | 'reviews' | 'emails' | 'supabase'
  >('sellers');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Target for generic deletion confirmations
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<{
    type: 'seller' | 'commercial' | 'kids' | 'musician' | 'volunteer' | 'review';
    id: string | number;
    title: string;
    details: string;
    extraId?: string;
  } | null>(null);

  const [exportFeedback, setExportFeedback] = useState<{
    count: number;
    sheetCount: number;
    fileName: string;
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

  const totalSellerRevenue = allBookings.reduce(
    (sum, b) => sum + (b.table.reservedBy?.amountPaid || b.table.price),
    0
  );
  const totalCommercialRevenue = commercialVendors.reduce((sum, v) => sum + v.feePaid, 0);
  const totalCombinedRevenue = totalSellerRevenue + totalCommercialRevenue;

  // MULTI-TAB GOOGLE SHEETS / EXCEL (.XLSX) EXPORT FUNCTION
  const handleExportToGoogleSheets = () => {
    const wb = XLSX.utils.book_new();

    // 1. Összesített lista (Summary Tab)
    const summaryRows: (string | number)[][] = [
      [
        'Típus',
        'Helyszín és időpont',
        'Stand / Szerepkör',
        'Jelentkező / Kapcsolattartó',
        'Cégnév / Gyermek neve',
        'E-mail cím',
        'Telefonszám',
        'Lakcím / Számlázási cím',
        'Kínálat / Tevékenység / Műsor',
        'Kategóriák / Feladatok',
        'Befizetett hozzájárulás (Ft)',
        'Azonosító',
        'Státusz',
      ],
    ];

    // 2. Lakossági árusok (Sellers Tab)
    const sellerRows: (string | number)[][] = [
      [
        'Stand sorszáma',
        'Helyszín',
        'Hétvége időpontja',
        'Árus neve',
        'E-mail cím',
        'Telefonszám',
        'Újbudai lakcím',
        'Árusított holmik leírása',
        'Kategóriák',
        'Befizetett díj (Ft)',
        'Foglalási azonosító',
        'Vásárig hátralévő napok',
        'Lemondható még? (8 napos szabály)',
      ],
    ];

    allBookings.forEach((b) => {
      const res = b.table.reservedBy;
      const catLabels = (res?.categories || [])
        .map((cId) => CATEGORIES.find((c) => c.id === cId)?.label || cId)
        .join('; ');
      const standDesc = `Stand #${b.table.id} (${b.table.side === 'north' ? 'Északi' : 'Déli'} utcafront)`;
      const canCancel = b.daysRemaining >= 8 ? 'Igen (>= 8 nap)' : 'Nem (< 8 nap lezárva)';

      summaryRows.push([
        'Lakossági árus',
        `${b.locationName} (${b.weekendDates})`,
        standDesc,
        res?.name || '',
        '-',
        res?.email || '',
        res?.phone || '',
        res?.districtAddress || '',
        res?.note || '',
        catLabels,
        res?.amountPaid || b.table.price,
        res?.bookingRef || `STAND-${b.table.id}`,
        `Rögzítve (${b.daysRemaining} nap a vásárig)`,
      ]);

      sellerRows.push([
        `#${b.table.id}`,
        b.locationName,
        b.weekendDates,
        res?.name || '',
        res?.email || '',
        res?.phone || '',
        res?.districtAddress || '',
        res?.note || '',
        catLabels,
        res?.amountPaid || b.table.price,
        res?.bookingRef || `STAND-${b.table.id}`,
        b.daysRemaining,
        canCancel,
      ]);
    });

    // 3. Céges partnerek (Commercial Tab)
    const commercialRows: (string | number)[][] = [
      [
        'Koncesszió típusa',
        'Helyszín',
        'Hétvége',
        'Cégnév',
        'Adószám',
        'Számlázási cím',
        'Kapcsolattartó neve',
        'E-mail cím',
        'Telefonszám',
        'Kínálat / Program / Menü',
        'Befizetett részvételi díj (Ft)',
        'Státusz',
      ],
    ];

    commercialVendors.forEach((v) => {
      const typeLabel = v.type === 'grill_corner' ? 'Grillsarok & Büfé' : 'Gyereksarok koncesszió';
      summaryRows.push([
        typeLabel,
        `${v.locationName} (${v.weekendDates})`,
        '8x8 m vállalkozói terület',
        v.contactPerson,
        v.companyName,
        v.email,
        v.phone,
        `${v.billingAddress} (Adószám: ${v.taxNumber})`,
        v.programOrMenuOffer,
        v.type === 'grill_corner' ? 'Gasztronómia' : 'Gyermekprogramok',
        v.feePaid,
        v.id,
        v.status === 'approved' ? 'Jóváhagyva' : 'Függőben',
      ]);

      commercialRows.push([
        typeLabel,
        v.locationName,
        v.weekendDates,
        v.companyName,
        v.taxNumber,
        v.billingAddress,
        v.contactPerson,
        v.email,
        v.phone,
        v.programOrMenuOffer,
        v.feePaid,
        v.status === 'approved' ? 'Jóváhagyva' : 'Függőben',
      ]);
    });

    // 4. Gyerekzsibi (Kids Flea Tab)
    const kidsRows: (string | number)[][] = [
      [
        'Asztal azonosító',
        'Helyszín',
        'Hétvége',
        'Gyermek árus neve',
        'Gyermek életkora',
        'Kísérő szülő neve',
        'Szülő e-mail címe',
        'Szülő telefonszáma',
        'Árusított játékok / holmik leírása',
        'Részvételi hozzájárulás (Ft)',
        'Státusz',
      ],
    ];

    locations.forEach((loc) => {
      loc.kidsFleaTables.forEach((kt) => {
        if (kt.status === 'reserved' && kt.reservedBy) {
          summaryRows.push([
            'Gyerekzsibi',
            `${loc.name} (${loc.weekendDates})`,
            kt.name,
            kt.reservedBy.parentName,
            `${kt.reservedBy.childName} (${kt.reservedBy.childAge} éves)`,
            kt.reservedBy.email,
            kt.reservedBy.phone,
            'Budapest XI. kerület',
            kt.reservedBy.itemsDescription,
            'Játékok, mesekönyvek, gyermekruhák',
            0,
            kt.id,
            'Lefoglalva (Díjmentes)',
          ]);

          kidsRows.push([
            kt.id,
            loc.name,
            loc.weekendDates,
            kt.reservedBy.childName,
            `${kt.reservedBy.childAge} éves`,
            kt.reservedBy.parentName,
            kt.reservedBy.email,
            kt.reservedBy.phone,
            kt.reservedBy.itemsDescription,
            0,
            'Lefoglalva',
          ]);
        }
      });
    });

    // 5. Utcazenészek (Musicians Tab)
    const musicianRows: (string | number)[][] = [
      [
        'Fellépő / Zenekar neve',
        'Helyszín',
        'Kapcsolattartó',
        'E-mail cím',
        'Telefonszám',
        'Zenei stílus',
        'Hangszerek',
        'Választott idősáv',
        'Külön észrevétel',
        'Státusz',
      ],
    ];

    musicians.forEach((m) => {
      summaryRows.push([
        'Utcazenész',
        m.locationName,
        'Utcazenész szőnyeg',
        m.contactName,
        m.musicianOrBandName,
        m.email,
        m.phone,
        '-',
        m.note || 'Akusztikus fellépés',
        `${m.genre} (${m.instruments || 'akusztikus'})`,
        0,
        m.id,
        'Jelentkezés rögzítve',
      ]);

      musicianRows.push([
        m.musicianOrBandName,
        m.locationName,
        m.contactName,
        m.email,
        m.phone,
        m.genre,
        m.instruments || 'akusztikus hangszer',
        m.preferredTimeSlot,
        m.note || '-',
        'Rögzítve',
      ]);
    });

    // 6. Önkéntesek (Volunteers Tab)
    const volunteerRows: (string | number)[][] = [
      [
        'Önkéntes neve',
        'Választott májusi helyszín',
        'E-mail cím',
        'Telefonszám',
        'Vállalt feladat(ok) részletesen',
        'Egyéb felajánlás / segítség',
        'Regisztráció ideje',
        'Státusz',
      ],
    ];

    volunteers.forEach((vol) => {
      const taskNames = vol.selectedTaskIds
        .map((tId) => {
          const t = VOLUNTEER_TASKS.find((vt) => vt.id === tId);
          return t ? `${t.title} [${t.timeSlot}]` : tId;
        })
        .join('; ');

      summaryRows.push([
        'Önkéntes segítő',
        vol.locationName,
        'Közösségi segítői pont',
        vol.fullName,
        '-',
        vol.email,
        vol.phone,
        '-',
        vol.otherOffer || 'Általános segítő',
        taskNames || 'Egyedi felajánlás',
        0,
        vol.id,
        'Önkéntes rögzítve',
      ]);

      volunteerRows.push([
        vol.fullName,
        vol.locationName,
        vol.email,
        vol.phone,
        taskNames || 'Egyedi felajánlás',
        vol.otherOffer || 'Nincs külön megjegyzés',
        vol.createdAt,
        'Aktív segítő',
      ]);
    });

    // 7. Lakossági vélemények (Reviews Tab)
    const reviewRows: (string | number)[][] = [
      [
        'Értékelés (1-5 csillag)',
        'Hangulat (1-5)',
        'Szervezés (1-5)',
        'Beküldő megnevezése',
        'Szöveges vélemény',
        'Belső észrevétel konkrét árusról (szervezői)',
        'Nyilvános oldalon megjelenhet?',
        'Jóváhagyási státusz',
        'Beküldés ideje',
      ],
    ];

    reviews.forEach((r) => {
      reviewRows.push([
        `${r.rating} / 5`,
        `${r.atmosphereRating} / 5`,
        `${r.organizationRating} / 5`,
        r.authorName || 'Anonim',
        r.feedbackText,
        r.sellerFeedback || '-',
        r.publicAllowed === false ? 'NEM (Csak belső adminnak)' : 'IGEN (Nyilvános)',
        r.status === 'approved' ? 'Jóváhagyva' : r.status === 'rejected' ? 'Elutasítva' : 'Függőben',
        r.submittedAt,
      ]);
    });

    // Append all separate sheets to the workbook
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Összesítő lista');

    const wsSellers = XLSX.utils.aoa_to_sheet(sellerRows);
    XLSX.utils.book_append_sheet(wb, wsSellers, 'Lakossági árusok');

    const wsCommercial = XLSX.utils.aoa_to_sheet(commercialRows);
    XLSX.utils.book_append_sheet(wb, wsCommercial, 'Céges partnerek');

    const wsKids = XLSX.utils.aoa_to_sheet(kidsRows);
    XLSX.utils.book_append_sheet(wb, wsKids, 'Gyerekzsibi');

    const wsMusicians = XLSX.utils.aoa_to_sheet(musicianRows);
    XLSX.utils.book_append_sheet(wb, wsMusicians, 'Utcazenészek');

    const wsVolunteers = XLSX.utils.aoa_to_sheet(volunteerRows);
    XLSX.utils.book_append_sheet(wb, wsVolunteers, 'Önkéntesek');

    const wsReviews = XLSX.utils.aoa_to_sheet(reviewRows);
    XLSX.utils.book_append_sheet(wb, wsReviews, 'Vélemények');

    const fileName = `ujbudazsibi_jelentkezok_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);

    const totalCount =
      allBookings.length + commercialVendors.length + musicians.length + volunteers.length;

    setExportFeedback({
      count: totalCount,
      sheetCount: 7,
      fileName,
    });
  };

  const executeConfirmedDeletion = () => {
    if (!confirmDeleteTarget) return;

    if (confirmDeleteTarget.type === 'seller') {
      onCancelBooking(
        confirmDeleteTarget.extraId as string,
        Number(confirmDeleteTarget.id),
        confirmDeleteTarget.title
      );
    } else if (confirmDeleteTarget.type === 'commercial') {
      onDeleteCommercial(String(confirmDeleteTarget.id));
    } else if (confirmDeleteTarget.type === 'kids') {
      onCancelKidsTable(confirmDeleteTarget.extraId as string, String(confirmDeleteTarget.id));
    } else if (confirmDeleteTarget.type === 'musician') {
      onDeleteMusician(String(confirmDeleteTarget.id));
    } else if (confirmDeleteTarget.type === 'volunteer') {
      onDeleteVolunteer(String(confirmDeleteTarget.id));
    } else if (confirmDeleteTarget.type === 'review') {
      onDeleteReview(String(confirmDeleteTarget.id));
    }

    setConfirmDeleteTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 pt-3 sm:pt-6 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-2xl max-w-5xl w-full border border-stone-300 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh] sm:max-h-[92vh]">
        
        {/* Header - Mobile unclipped with safe padding */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 bg-[#F4EFE6] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight font-serif truncate">
                Újbudazsibi szervezői adminisztráció
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 truncate">
                Védett felület · Szervezői e-mail cím: <strong>ujbudazsibi@gmail.com</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Bezárás"
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
                  {totalCombinedRevenue.toLocaleString('hu-HU')} Ft
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Céges & Zenészek</span>
                <span className="text-base font-bold text-blue-900 tabular-nums">
                  {commercialVendors.length} cég · {musicians.length} fellépő
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Önkéntesek & Vélemények</span>
                <span className="text-base font-bold text-stone-900 tabular-nums">
                  {volunteers.length} önkéntes · {reviews.length} vélemény
                </span>
              </div>
            </div>

            {/* TAB BAR (Horizontally scrollable with clear badges) */}
            <div className="bg-[#FAF8F5] px-5 sm:px-6 py-2.5 border-b border-stone-200 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 min-w-max">
                <button
                  type="button"
                  onClick={() => setActiveTab('sellers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'sellers'
                      ? 'bg-stone-900 text-amber-300 shadow-xs font-bold'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Árusok ({allBookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('commercial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'commercial'
                      ? 'bg-stone-900 text-amber-300 shadow-xs font-bold'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Céges partnerek ({commercialVendors.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('kids_flea')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'kids_flea'
                      ? 'bg-stone-900 text-amber-300 shadow-xs font-bold'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Gyerekzsibi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('musicians')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'musicians'
                      ? 'bg-stone-900 text-amber-300 shadow-xs font-bold'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Zenészek ({musicians.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('volunteers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'volunteers'
                      ? 'bg-stone-900 text-amber-300 shadow-xs font-bold'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Önkéntesek ({volunteers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'bg-stone-900 text-amber-300 shadow-xs font-bold'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Vélemények ({reviews.length})
                </button>
                <button
                  type="button"
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
                  type="button"
                  onClick={() => setActiveTab('supabase')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'supabase'
                      ? 'bg-stone-900 text-amber-300 shadow-xs font-bold'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Vercel & Supabase
                </button>
              </div>
            </div>

            {/* ACTION & FILTER TOOLBAR (Fully responsive, stacked on mobile with full-width search) */}
            <div className="bg-[#F6F2EB] px-4 sm:px-6 py-3 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
              <div className="w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportToGoogleSheets}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-[#1A3626] hover:bg-[#254d37] text-[#E7C286] border border-[#C88A36]/40 shadow-xs transition-colors cursor-pointer whitespace-nowrap font-serif"
                  title="Összes jelentkező exportálása Google Táblázatba (.xlsx külön fülekkel)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google Sheets export (.xlsx 7 füllel)</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-1 justify-end">
                <select
                  value={selectedLocationFilter}
                  onChange={(e) => setSelectedLocationFilter(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 sm:py-1.5 text-xs rounded-xl border border-stone-300 bg-white text-stone-800 font-medium focus:ring-1 focus:ring-emerald-700 shadow-2xs"
                >
                  <option value="all">Minden helyszín</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    placeholder="Keresés név, stand, cím..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 sm:py-1.5 text-xs rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
              
              {/* Google Sheets export feedback banner */}
              {exportFeedback && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-[#1A3626] text-amber-300 shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950 block text-sm font-serif">
                        Sikeres Google Sheets exportálás ({exportFeedback.fileName})!
                      </span>
                      <span className="text-emerald-800 leading-relaxed block mt-0.5">
                        A táblázat <strong>7 különálló fülön</strong> tartalmazza az adatokat: <em>Összesítő, Lakossági árusok, Céges partnerek, Gyerekzsibi, Utcazenészek, Önkéntesek, Vélemények</em>. Nyisd meg Excelben vagy húzd be a Google Drive / Google Sheets felületére!
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1A3626] hover:bg-[#254d37] text-[#E7C286] font-bold text-xs transition-colors shadow-xs"
                      title="Google Sheets megnyitása"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google Sheets (sheets.new) ↗</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setExportFeedback(null)}
                      className="px-2.5 py-2 rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold cursor-pointer text-xs"
                    >
                      Bezárás
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 1: SELLERS / ÁRUSOK */}
              {activeTab === 'sellers' && (
                <div className="space-y-4">
                  {/* Strict 8-day rule notification */}
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        8 napos elállási szabályzat és szervezői admin felülbírálás:
                      </span>
                      <span>
                        Lakossági elállás a vásár előtt <strong>legkésőbb 8 nappal</strong> engedélyezett. <strong>Szervezői adminisztrátorként bármelyik standfoglalást törölheted és azonnal felszabadíthatod</strong> a vásártérképen 8 napon belül is (adminisztrátori felülbírálással).
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
                                  {(b.table.reservedBy?.amountPaid || b.table.price).toLocaleString('hu-HU')} Ft
                                </span>
                              </div>

                              <div className="flex flex-col sm:flex-row items-start lg:items-end justify-between gap-2">
                                {!canCancel && (
                                  <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded shadow-2xs">
                                    &lt; 8 nap (Admin felülbírálás)
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmDeleteTarget({
                                      type: 'seller',
                                      id: b.table.id,
                                      title: `Stand #${b.table.id} (${b.table.reservedBy?.name})`,
                                      details: `${b.locationName} · ${b.weekendDates}. Adminisztrátori felülbírálással törölve: az asztal azonnal újra foglalhatóvá válik a vásártérképen!`,
                                      extraId: b.locationId,
                                    })
                                  }
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                                  title="Standfoglalás törlése és asztal azonnali felszabadítása a vásártérképen"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>Törlés & Asztal felszabadítása</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COMMERCIAL VENDORS */}
              {activeTab === 'commercial' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-600">
                      Céges és egyéni vállalkozói kitelepülések a 8 × 8 méteres zónákra (Gyereksarok & Grill).
                    </p>
                    <span className="text-xs font-bold text-stone-900 font-mono">
                      Összes bevétel: {totalCommercialRevenue.toLocaleString('hu-HU')} Ft
                    </span>
                  </div>

                  {commercialVendors.length === 0 ? (
                    <div className="p-10 text-center text-stone-500 text-xs bg-white rounded-xl border border-stone-200">
                      Még nincs beérkezett céges jelentkezés.
                    </div>
                  ) : (
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
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-800 block">
                                {v.feePaid.toLocaleString('hu-HU')} Ft
                              </span>
                              <span className="text-[10px] text-stone-500">{v.locationName}</span>
                            </div>
                          </div>

                          <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                            <strong className="block text-stone-900">Program / Étlap és technológia:</strong>
                            <span>{v.programOrMenuOffer}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-stone-100">
                            <div className="flex items-center gap-3">
                              <span>Kapcsolattartó: <strong>{v.contactPerson}</strong></span>
                              <span>{v.phone}</span>
                              <span>{v.email}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDeleteTarget({
                                  type: 'commercial',
                                  id: v.id,
                                  title: `${v.companyName} (${v.type === 'grill_corner' ? 'Grillsarok' : 'Gyereksarok'})`,
                                  details: `${v.locationName} · ${v.weekendDates}. Törlés után az adatok azonnal eltávolításra kerülnek a rendszerből.`,
                                })
                              }
                              className="text-red-700 hover:text-red-900 font-bold text-xs cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Törlés</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: GYEREKZSIBI */}
              {activeTab === 'kids_flea' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-600">
                    A 4 kijelölt ingyenes gyermek stand állapota helyszínenként. A lefoglalt gyerekasztalok itt egy kattintással törölhetők és felszabadíthatók!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {locations.map((loc) => (
                      <div key={loc.id} className="bg-white rounded-xl border border-stone-200 p-4 space-y-2">
                        <span className="font-bold text-xs text-stone-900 block font-serif">
                          {loc.name} ({loc.dateBadge})
                        </span>
                        <div className="space-y-1.5 pt-1">
                          {loc.kidsFleaTables.map((kt) => (
                            <div key={kt.id} className="p-2.5 rounded border border-stone-200 text-xs flex items-center justify-between gap-2">
                              <div>
                                <strong className="text-stone-900">{kt.name}</strong>
                                {kt.reservedBy ? (
                                  <div className="text-[11px] text-stone-600 mt-0.5">
                                    Kisárus: <strong>{kt.reservedBy.childName}</strong> ({kt.reservedBy.childAge} év) · Szülő: {kt.reservedBy.parentName} ({kt.reservedBy.phone})
                                    <div className="text-stone-500 italic mt-0.5">"{kt.reservedBy.itemsDescription}"</div>
                                  </div>
                                ) : (
                                  <span className="block text-[11px] text-emerald-700 font-semibold">
                                    Szabad, szülő által lefoglalható (0 Ft)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    kt.status === 'reserved'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-blue-100 text-blue-900'
                                  }`}
                                >
                                  {kt.status === 'reserved' ? 'Foglalt' : 'Szabad'}
                                </span>
                                {kt.status === 'reserved' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmDeleteTarget({
                                        type: 'kids',
                                        id: kt.id,
                                        title: `${kt.name} (${kt.reservedBy?.childName})`,
                                        details: `${loc.name} · ${loc.weekendDates}. Az asztal azonnal újra szabaddá válik!`,
                                        extraId: loc.id,
                                      })
                                    }
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                                    title="Gyerekzsibi asztal felszabadítása"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
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
                              {m.preferredTimeSlot} · {m.locationName}
                            </span>
                            <h4 className="text-base font-bold text-stone-900 mt-1">
                              {m.musicianOrBandName}
                            </h4>
                            <p className="text-xs text-stone-600">
                              Műfaj: <strong>{m.genre}</strong> · Hangszerek: {m.instruments}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDeleteTarget({
                                type: 'musician',
                                id: m.id,
                                title: `${m.musicianOrBandName} (${m.contactName})`,
                                details: `${m.locationName} · ${m.preferredTimeSlot}. A zenész jelentkezés törlődik az adatbázisból.`,
                              })
                            }
                            className="text-red-600 hover:text-red-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Törlés</span>
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
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDeleteTarget({
                                type: 'volunteer',
                                id: vol.id,
                                title: `${vol.fullName} (${vol.locationName})`,
                                details: `${vol.email} | ${vol.phone}. Az önkéntes véglegesen törlődik a nyilvántartásból.`,
                              })
                            }
                            className="text-red-600 hover:text-red-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Törlés</span>
                          </button>
                        </div>
                        <div className="text-xs text-stone-600 space-y-0.5">
                          <div>E-mail: {vol.email} | Telefon: {vol.phone}</div>
                          <div>Helyszín: <strong>{vol.locationName}</strong></div>
                        </div>
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Feladatok:</span>
                          <div className="flex flex-wrap gap-1">
                            {vol.selectedTaskIds.map((tId) => {
                              const tObj = VOLUNTEER_TASKS.find((vt) => vt.id === tId);
                              return (
                                <span key={tId} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">
                                  {tObj ? tObj.title : tId}
                                </span>
                              );
                            })}
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

              {/* TAB 6: REVIEWS (With Approval & Deletion moderation!) */}
              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Vélemények moderációja és láthatósága:</span>
                      <span>
                        A beküldött vélemények alapértelmezetten <strong>jóváhagyásra várnak (függőben)</strong>. Csak azok jelennek meg a weboldal frontenden, amelyeket jóváhagysz, és amelyeknél a beküldő engedélyezte a nyilvános megjelenést. A kizárólag szervezőknek szóló privát visszajelzések soha nem kerülnek ki a látogatóknak.
                      </span>
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="p-10 text-center text-stone-500 text-xs bg-white rounded-xl border border-stone-200">
                      Még nincs beérkezett vélemény.
                    </div>
                  ) : (
                    reviews.map((r) => {
                      const isApproved = r.status === 'approved';
                      const isPending = !r.status || r.status === 'pending';
                      const isPrivate = r.publicAllowed === false;

                      return (
                        <div key={r.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {[...Array(r.rating)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                                ))}
                                <span className="font-mono font-bold text-xs text-stone-800 ml-1">
                                  {r.rating} / 5
                                </span>
                              </div>

                              {/* Status badges */}
                              {isPending && (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                                  🟡 Jóváhagyásra vár
                                </span>
                              )}
                              {isApproved && (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                                  🟢 Jóváhagyva
                                </span>
                              )}
                              {r.status === 'rejected' && (
                                <span className="text-[10px] font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                                  ⚪ Elrejtve
                                </span>
                              )}

                              {isPrivate ? (
                                <span className="text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded">
                                  🔒 Csak belső szervezői észrevétel (nem publikus)
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-stone-500">
                                  🌐 Nyilvános megjelenést kérő
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] font-mono text-stone-400">{r.submittedAt}</span>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-stone-900 mb-1">
                              Beküldő: {r.authorName || 'Anonim látogató'} · Hangulat: {r.atmosphereRating}/5 · Szervezés: {r.organizationRating}/5
                            </div>
                            <p className="text-xs text-stone-800 leading-relaxed font-medium bg-stone-50 p-2.5 rounded-lg border border-stone-200 italic">
                              "{r.feedbackText}"
                            </p>
                          </div>

                          {r.sellerFeedback && (
                            <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-950 border border-amber-200">
                              <strong className="block text-[11px] text-amber-900">Privát észrevétel konkrét árusról a szervezőknek:</strong>
                              <span>"{r.sellerFeedback}"</span>
                            </div>
                          )}

                          {/* Moderation Actions */}
                          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                            <div className="flex items-center gap-2">
                              {!isApproved && !isPrivate && (
                                <button
                                  type="button"
                                  onClick={() => onApproveReview(r.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer text-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Jóváhagyás (Megjelenítés a weboldalon)</span>
                                </button>
                              )}
                              {isApproved && (
                                <button
                                  type="button"
                                  onClick={() => onRejectReview(r.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg cursor-pointer text-xs"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Elrejtés a weboldalról</span>
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDeleteTarget({
                                  type: 'review',
                                  id: r.id,
                                  title: `Vélemény (${r.rating}★ · ${r.authorName || 'Anonim'})`,
                                  details: `Szöveg: "${r.feedbackText}". A vélemény véglegesen törlődik az adatbázisból!`,
                                })
                              }
                              className="text-red-700 hover:text-red-900 font-bold text-xs cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Végleges törlés</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 7: SUPABASE & VERCEL INSTRUCTIONS */}
              {activeTab === 'supabase' && (
                <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 text-xs text-stone-700 leading-relaxed">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm font-serif">
                    <Database className="w-4 h-4 text-emerald-800" />
                    <span>Hogyan működik most az adatbázis és mit kell módosítani a Vercel / Supabase-en?</span>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 text-emerald-950">
                    <strong className="block text-sm font-serif">1. Jelenleg azonnal és önállóan működik a weboldal:</strong>
                    <p>
                      Minden standfoglalás, lemondás, önkéntes regisztráció, céges jelentkezés és vélemény <strong>azonnal és megbízhatóan rögzítésre kerül a böngésző helyi adatbázisában (localStorage)</strong>. Ezzel egy időben a rendszer minden egyes foglalásról és jelentkezésről <strong>valós idejű e-mailes értesítést küld az ujbudazsibi@gmail.com címre</strong> a beépített értesítő hídon keresztül!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <strong className="block text-stone-900 text-sm font-serif">
                      2. Mikor és mit kell beállítanod a Supabase és Vercel felületen?
                    </strong>
                    <p>
                      Csak akkor szükséges bármit módosítanod, ha azt szeretnéd, hogy több különböző számítógépről vagy telefonról belépve is valós időben ugyanaz a központi felhő adatbázis szinkronizálódjon.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 pt-1">
                      <li>
                        <strong>Supabase projekt létrehozása:</strong> Nyiss fiókot a <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-800">supabase.com</a> oldalon, és hozz létre egy új ingyenes projektet (pl. <em>ujbudazsibi</em>).
                      </li>
                      <li>
                        <strong>Adatbázis táblák létrehozása:</strong> A projekt gyökérkönyvtárában található egy kész <code>supabase-schema.sql</code> fájl. A Supabase bal oldali menüjében kattints az <strong>SQL Editor</strong> gombra, illeszd be a fájl tartalmát, majd nyomd meg a <strong>RUN</strong> gombot. (Ez azonnal létrehozza az összes táblát: árusok, önkéntesek, partnerek, vélemények).
                      </li>
                      <li>
                        <strong>Vercel környezeti változók hozzáadása:</strong> A Vercel Dashboardon nyisd meg a projektedet, lépj a <strong>Settings → Environment Variables</strong> fülre, és add hozzá ezt a két kulcsot (a Supabase <em>Project Settings → API</em> menüpontjából):
                        <div className="bg-stone-900 text-amber-300 p-3 rounded-lg font-mono text-[11px] mt-1.5 space-y-1">
                          <div>VITE_SUPABASE_URL = "https://[a-te-projekted].supabase.co"</div>
                          <div>VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5..."</div>
                        </div>
                      </li>
                      <li>
                        <strong>Újratelepítés (Redeploy):</strong> A Vercel <em>Deployments</em> menüjében a legutóbbi verziónál kattints a <strong>Redeploy</strong> gombra. Ezzel az oldal automatikusan összekapcsolódik a felhő adatbázissal!
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 8: SENT EMAILS / MAILBOX */}
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
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                Bezárás
              </button>
            </div>
          </>
        )}

      </div>

      {/* Confirmation Modal for All Deletion Actions */}
      {confirmDeleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-red-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>Biztosan törlöd a következő tételt?</span>
            </div>
            <p className="text-xs text-stone-800 font-bold">
              {confirmDeleteTarget.title}
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              {confirmDeleteTarget.details}
            </p>
            <p className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              A módosítás azonnal érvénybe lép az adatbázisban és a felületen.
            </p>
            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(null)}
                className="px-3 py-1.5 font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
              >
                Mégse
              </button>
              <button
                type="button"
                onClick={executeConfirmedDeletion}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                Igen, véglegesen törlöm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
