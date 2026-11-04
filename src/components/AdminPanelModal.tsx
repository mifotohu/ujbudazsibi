import React, { useState, useEffect } from 'react';
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
import {
  getSentEmails,
  testSendEmailNotification,
  testSupabaseConnection,
  SUPABASE_CONFIG,
  ORGANIZER_EMAIL,
} from '../lib/supabase';
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
  Bell,
  Megaphone,
  Copy,
  Send,
  HelpCircle,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  locations: LocationData[];
  volunteers: VolunteerApplication[];
  commercialVendors: CommercialVendorBooking[];
  musicians: StreetMusicianApplication[];
  reviews: MarketReview[];
  siteNotification?: string;
  onSaveNotification?: (text: string) => void;
  onDeleteNotification?: () => void;
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
  siteNotification = '',
  onSaveNotification,
  onDeleteNotification,
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('ujbudazsibi_admin_auth_v1') === 'true' ||
        sessionStorage.getItem('ujbudazsibi_admin_auth_v1') === 'true'
      );
    } catch {
      return false;
    }
  });
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState<
    'sellers' | 'commercial' | 'kids_flea' | 'musicians' | 'volunteers' | 'reviews' | 'emails' | 'supabase' | 'notification'
  >('sellers');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationDraft, setNotificationDraft] = useState(siteNotification);

  useEffect(() => {
    setNotificationDraft(siteNotification);
  }, [siteNotification]);

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

  // Email Diagnostic & Test State
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{
    success: boolean;
    message: string;
    requiresActivation?: boolean;
  } | null>(null);

  // Supabase Connection Test & SQL Copy State
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{
    connected: boolean;
    message: string;
    url?: string;
    tablesFound?: boolean;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleRunEmailTest = async () => {
    setIsTestingEmail(true);
    setEmailTestResult(null);
    try {
      const res = await testSendEmailNotification();
      setEmailTestResult(res);
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        message: `Hiba a küldés során: ${err?.message || err}`,
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleRunSupabaseTest = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setSupabaseTestResult(res);
    } catch (err: any) {
      setSupabaseTestResult({
        connected: false,
        message: `Hiba: ${err?.message || err}`,
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopySqlSchema = () => {
    const sql = `-- ====================================================================
-- Újbudazsibi (www.ujbudazsibi.hu) — Supabase PostgreSQL Adatbázis Séma
-- Készült: Vercel + Supabase éles telepítéshez
-- ====================================================================

-- 1. Árusok és asztalfoglalások tábla
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref VARCHAR(50) UNIQUE NOT NULL,
  table_id INTEGER NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  street_name TEXT NOT NULL,
  weekend_dates VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  seller_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  street_address TEXT NOT NULL,
  is_immediate_neighbor BOOLEAN DEFAULT FALSE,
  categories TEXT[] DEFAULT '{}',
  items_description TEXT,
  total_paid INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Vállalkozói / Céges Koncessziók
CREATE TABLE IF NOT EXISTS public.commercial_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_type VARCHAR(50) NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  weekend_dates VARCHAR(100) NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  tax_number VARCHAR(50) NOT NULL,
  billing_address TEXT NOT NULL,
  contact_person VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  program_or_menu TEXT NOT NULL,
  fee_paid INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Gyerekzsibi tábla
CREATE TABLE IF NOT EXISTS public.kids_flea_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_code VARCHAR(20) NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  parent_name VARCHAR(150) NOT NULL,
  child_name VARCHAR(150) NOT NULL,
  child_age INTEGER NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  items_description TEXT,
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Önkéntesek tábla
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  tasks TEXT[] DEFAULT '{}',
  other_offer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Utcazenész jelentkezések
CREATE TABLE IF NOT EXISTS public.street_musicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  instruments VARCHAR(150),
  location_id VARCHAR(50) NOT NULL,
  preferred_time_slot VARCHAR(100),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Közösségi vélemények tábla
CREATE TABLE IF NOT EXISTS public.market_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  author_name VARCHAR(150),
  role VARCHAR(50),
  feedback_text TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Értesítési hírsáv tábla
CREATE TABLE IF NOT EXISTS public.site_notifications (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'current_banner',
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Kiküldött e-mailes értesítések naplója
CREATE TABLE IF NOT EXISTS public.sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient VARCHAR(150) NOT NULL,
  subject TEXT NOT NULL,
  html_preview TEXT,
  status VARCHAR(50) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS BIZTONSÁGI SZABÁLYOK (ENGEDÉLYEZVE A PUBLIKUS ÍRÁS ÉS OLVASÁS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_flea_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.street_musicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Admin can update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Admin can delete bookings" ON public.bookings FOR DELETE USING (true);

CREATE POLICY "Public can insert volunteers" ON public.volunteers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read volunteers" ON public.volunteers FOR SELECT USING (true);
CREATE POLICY "Admin can delete volunteers" ON public.volunteers FOR DELETE USING (true);

CREATE POLICY "Public can insert commercial" ON public.commercial_vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read commercial" ON public.commercial_vendors FOR SELECT USING (true);
CREATE POLICY "Admin can delete commercial" ON public.commercial_vendors FOR DELETE USING (true);

CREATE POLICY "Public can insert kids" ON public.kids_flea_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read kids" ON public.kids_flea_bookings FOR SELECT USING (true);
CREATE POLICY "Admin can delete kids" ON public.kids_flea_bookings FOR DELETE USING (true);

CREATE POLICY "Public can insert musicians" ON public.street_musicians FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read musicians" ON public.street_musicians FOR SELECT USING (true);
CREATE POLICY "Admin can delete musicians" ON public.street_musicians FOR DELETE USING (true);

CREATE POLICY "Public can insert reviews" ON public.market_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read reviews" ON public.market_reviews FOR SELECT USING (true);
CREATE POLICY "Admin can update reviews" ON public.market_reviews FOR UPDATE USING (true);
CREATE POLICY "Admin can delete reviews" ON public.market_reviews FOR DELETE USING (true);

CREATE POLICY "Public can read notifications" ON public.site_notifications FOR SELECT USING (true);
CREATE POLICY "Admin can manage notifications" ON public.site_notifications FOR ALL USING (true);

CREATE POLICY "Public can insert sent emails" ON public.sent_emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read sent emails" ON public.sent_emails FOR SELECT USING (true);
`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === DEFAULT_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('ujbudazsibi_admin_auth_v1', 'true');
        sessionStorage.setItem('ujbudazsibi_admin_auth_v1', 'true');
      } catch {}
      setPasswordError('');
    } else {
      setPasswordError('Helytelen jelszó! Kérjük, próbáld újra.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('ujbudazsibi_admin_auth_v1');
      sessionStorage.removeItem('ujbudazsibi_admin_auth_v1');
    } catch {}
  };

  const handleOpenInNewWindow = () => {
    window.open(window.location.origin + window.location.pathname + '#admin', '_blank');
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
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenInNewWindow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1A3626] bg-[#EFE8DA] hover:bg-[#E2D8C3] border border-[#D5C7AF] transition-colors cursor-pointer shadow-2xs"
              title="Admin felület megnyitása külön böngészőlapon (így párhuzamosan ellenőrizheted a weboldalt)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-700" />
              <span className="hidden sm:inline">Megnyitás külön lapon</span>
              <span className="sm:hidden">Külön lap</span>
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-red-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Kijelentkezés a védett admin felületről"
              >
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden md:inline">Zárolás</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Bezárás"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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

            {/* TÁBLÁZAT ÉS KATEGÓRIA SÁV (Tiszta, reszponzív fülsáv görgetősáv és dobozolás nélkül) */}
            <div className="bg-[#EFE8DA] px-4 sm:px-6 py-3 border-b border-stone-300/90 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('sellers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'sellers'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs font-bold border border-[#1A3626]'
                    : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-white hover:text-stone-900 shadow-2xs'
                }`}
              >
                Árusok ({allBookings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('commercial')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'commercial'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs font-bold border border-[#1A3626]'
                    : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-white hover:text-stone-900 shadow-2xs'
                }`}
              >
                Céges partnerek ({commercialVendors.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kids_flea')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'kids_flea'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs font-bold border border-[#1A3626]'
                    : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-white hover:text-stone-900 shadow-2xs'
                }`}
              >
                Gyerekzsibi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('musicians')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'musicians'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs font-bold border border-[#1A3626]'
                    : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-white hover:text-stone-900 shadow-2xs'
                }`}
              >
                Zenészek ({musicians.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('volunteers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'volunteers'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs font-bold border border-[#1A3626]'
                    : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-white hover:text-stone-900 shadow-2xs'
                }`}
              >
                Önkéntesek ({volunteers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs font-bold border border-[#1A3626]'
                    : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-white hover:text-stone-900 shadow-2xs'
                }`}
              >
                Vélemények ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('emails')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'emails'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs font-bold border border-[#1A3626]'
                    : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-white hover:text-stone-900 shadow-2xs'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>Postafiók ({getSentEmails().length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('supabase')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'supabase'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs font-bold border border-[#1A3626]'
                    : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-white hover:text-stone-900 shadow-2xs'
                }`}
              >
                Vercel & Supabase
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notification')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'notification'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs font-bold border border-[#1A3626]'
                    : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-white hover:text-stone-900 shadow-2xs'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Hírsáv / Értesítés {siteNotification && siteNotification.trim() ? '(Aktív)' : ''}</span>
              </button>
            </div>

            {/* KÜLÖN SZŰRŐ ÉS EXPORTÁLÓ SÁV (Önálló, tágas, reszponzív kezelősáv) */}
            <div className="bg-[#FAF6EE] px-4 sm:px-6 py-3.5 border-b border-stone-300 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              <div className="w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleExportToGoogleSheets}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1A3626] hover:bg-[#254d37] text-[#E7C286] border border-[#C88A36]/50 shadow-xs transition-colors cursor-pointer whitespace-nowrap font-serif"
                  title="Összes jelentkező exportálása Google Táblázatba (.xlsx formátum, külön fülekkel)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google Sheets export (.xlsx 7 füllel)</span>
                </button>
              </div>

              {/* Helyszín szűrő és Keresőmező külön jól látható egységként */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto flex-1 md:justify-end">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-[11px] font-bold text-stone-600 hidden sm:inline whitespace-nowrap">
                    Szűrés:
                  </span>
                  <select
                    value={selectedLocationFilter}
                    onChange={(e) => setSelectedLocationFilter(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white text-stone-800 font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-none shadow-2xs"
                  >
                    <option value="all">Minden helyszín (Összes)</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Keresés név, stand, cím..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Tartalom törzse - Tágas térközzel lejjebb tolva */}
            <div className="p-5 sm:p-7 flex-1 overflow-y-auto space-y-5 bg-[#FAF8F5]">
              
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

              {/* TAB 7: SUPABASE & VERCEL INSTRUCTIONS & CONNECTION TEST */}
              {activeTab === 'supabase' && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-6 text-xs text-stone-700 leading-relaxed">
                  
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-800" />
                        <h4 className="font-bold text-stone-900 text-sm font-serif">
                          Adatbázis állapota és felhő szinkronizáció
                        </h4>
                      </div>
                      <p className="text-stone-600 mt-1">
                        Jelenlegi üzemmód:{' '}
                        {SUPABASE_CONFIG.isConfigured ? (
                          <span className="font-bold text-emerald-800">
                            Supabase felhő adatbázis összekapcsolva ({SUPABASE_CONFIG.url})
                          </span>
                        ) : (
                          <span className="font-bold text-amber-800">
                            Böngésző helyi adatbázis (localStorage) aktív + E-mail értesítő híd
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleRunSupabaseTest}
                        disabled={isTestingSupabase}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-lg cursor-pointer transition-colors shadow-2xs text-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                        <span>{isTestingSupabase ? 'Kapcsolat tesztelése...' : 'Kapcsolat ellenőrzése'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Test Result Callout if run */}
                  {supabaseTestResult && (
                    <div
                      className={`p-4 rounded-xl border ${
                        supabaseTestResult.connected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {supabaseTestResult.connected ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <strong className="block text-sm font-bold">
                            {supabaseTestResult.connected
                              ? '✅ Sikeres Supabase kapcsolat!'
                              : 'ℹ️ Supabase felhő állapot:'}
                          </strong>
                          <p className="leading-relaxed">{supabaseTestResult.message}</p>
                          {supabaseTestResult.url && (
                            <div className="font-mono text-[11px] bg-white/70 p-1.5 rounded mt-1 border border-emerald-200">
                              Adatbázis URL: {supabaseTestResult.url}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* What needs to be changed in Vercel & Supabase */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-stone-900 font-serif">
                      Mit kell módosítanod a Vercel és Supabase felületen?
                    </h5>
                    <p className="text-stone-600">
                      A weboldal <strong>azonnal működőképes önállóan is</strong>, az asztalfoglalások, lemondások, önkéntesek és vélemények azonnal elmentődnek helyben és e-mailben is.
                      Ha szeretnéd, hogy a foglalások egy központi felhő adatbázisban tárolódjanak (hogy több eszközről is ugyanazt lássátok), végezd el ezt a 3 egyszerű lépést:
                    </p>
                  </div>

                  {/* Step 1: SQL Schema */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-stone-900 text-sm font-bold block">
                          1. Lépés: Supabase SQL séma létrehozása (1 kattintás)
                        </strong>
                        <span className="text-stone-600 text-xs">
                          Nyisd meg a Supabase-t, lépj az <strong>SQL Editor</strong> menübe, és illeszd be ezt a kész sémát:
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopySqlSchema}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0 text-xs"
                      >
                        {copiedSql ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Másolva a vágólapra!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Teljes SQL Séma Másolása</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 italic">
                      A séma tartalmazza a <code>bookings</code> (árusok), <code>volunteers</code> (önkéntesek), <code>commercial_vendors</code> (cégek), <code>kids_flea_bookings</code> (gyerekzsibi), <code>market_reviews</code> (vélemények) és <code>site_notifications</code> táblákat, valamint a nyilvános engedélyeket (RLS Policies), így nem fog "403 Forbidden" hibát dobni.
                    </p>
                  </div>

                  {/* Step 2: Vercel Environment Variables */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <strong className="text-stone-900 text-sm font-bold block">
                      2. Lépés: Vercel környezeti változók (Environment Variables)
                    </strong>
                    <p className="text-stone-600 text-xs">
                      A Vercel felületen a projekted <strong>Settings → Environment Variables</strong> fülén add hozzá ezt a két értéket (a Supabase <em>Project Settings → API</em> menüpontjából):
                    </p>
                    <div className="bg-stone-900 text-amber-300 p-3 rounded-lg font-mono text-[11px] space-y-1">
                      <div>VITE_SUPABASE_URL = "https://[a-te-projekted].supabase.co"</div>
                      <div>VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."</div>
                    </div>
                  </div>

                  {/* Step 3: Redeploy */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <strong className="text-stone-900 text-sm font-bold block">
                      3. Lépés: Újratelepítés (Redeploy)
                    </strong>
                    <p className="text-stone-600 text-xs">
                      A környezeti változók mentése után a Vercel <strong>Deployments</strong> fülén kattints a legutóbbi verziónál a három pontra (•••) és válaszd a <strong>Redeploy</strong> opciót. Kész!
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 8: SENT EMAILS / MAILBOX & LIVE DIAGNOSTIC */}
              {activeTab === 'emails' && (
                <div className="space-y-5">
                  
                  {/* ORGANIZER MAILBOX HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A3626] text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-stone-700">
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[#E7C286]" />
                        <h4 className="font-bold text-white text-base font-serif">
                          Központi szervezői postafiók: {ORGANIZER_EMAIL}
                        </h4>
                      </div>
                      <p className="text-stone-300 text-xs mt-1 max-w-xl">
                        Minden standfoglalás, önkéntes jelentkezés, céges megkeresés és vásári vélemény erre a Gmail címre érkezik be.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href="https://mail.google.com/mail/u/0/#inbox"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-[#E7C286] text-stone-950 font-bold rounded-xl shrink-0 flex items-center gap-1.5 hover:bg-[#d8b375] transition-colors cursor-pointer text-xs shadow-2xs"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Gmail megnyitása</span>
                      </a>
                    </div>
                  </div>

                  {/* LIVE EMAIL TEST & FORM-SUBMIT ACTIVATION DIAGNOSTIC BOX */}
                  <div className="bg-white rounded-2xl border border-amber-300 p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-emerald-800" />
                          <h5 className="font-bold text-stone-900 text-sm font-serif">
                            Élő kézbesítési teszt és FormSubmit aktiválás ellenőrzése
                          </h5>
                        </div>
                        <p className="text-stone-600 text-xs mt-0.5">
                          Kattints a teszt gombra, hogy azonnal megbizonyosodj az {ORGANIZER_EMAIL} címre érkező levelek állapotáról.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRunEmailTest}
                        disabled={isTestingEmail}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-2xs shrink-0 text-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTestingEmail ? 'animate-spin' : ''}`} />
                        <span>{isTestingEmail ? 'Tesztlevél küldése...' : 'Teszt e-mail küldése most'}</span>
                      </button>
                    </div>

                    {/* Test result output */}
                    {emailTestResult && (
                      <div
                        className={`p-4 rounded-xl border ${
                          emailTestResult.requiresActivation
                            ? 'bg-amber-50 border-amber-400 text-amber-950'
                            : emailTestResult.success
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            : 'bg-red-50 border-red-400 text-red-950'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {emailTestResult.requiresActivation ? (
                            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                          ) : emailTestResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                          ) : (
                            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-2 flex-1">
                            <strong className="block text-sm font-bold">
                              {emailTestResult.requiresActivation
                                ? '⚠️ FONTOS: EGYSZERI FORM-AKTIVÁLÁS SZÜKSÉGES A GMAILBEN!'
                                : emailTestResult.success
                                ? '✅ A tesztüzenet sikeresen elküldve!'
                                : 'Értesítési állapot:'}
                            </strong>
                            <p className="text-xs leading-relaxed">{emailTestResult.message}</p>

                            {/* Detailed steps if activation is pending */}
                            {emailTestResult.requiresActivation && (
                              <div className="p-3 bg-white/80 rounded-lg border border-amber-300 text-xs text-amber-950 space-y-2">
                                <strong className="block font-bold">Miért nem láttad még az értesítéseket?</strong>
                                <p>
                                  A levéltovábbító szolgáltató (FormSubmit) spamszűrési biztonsági szabálya miatt az első használatkor egy jóváhagyó e-mailt küld a(z) <code>ujbudazsibi@gmail.com</code> címre. <strong>Amíg erre nem kattintasz rá egyszer, a szolgáltató visszatartja az üzeneteket!</strong>
                                </p>
                                <strong className="block font-bold pt-1">Teendő (mindössze 30 másodperc):</strong>
                                <ol className="list-decimal pl-5 space-y-1">
                                  <li>Nyisd meg a Gmailt a(z) <strong>ujbudazsibi@gmail.com</strong> fiókban.</li>
                                  <li>Keresd a <em>"FormSubmit"</em> feladótól érkező levelet (nézd meg a <strong>Spam</strong> és <strong>Promóciók</strong> mappában is!).</li>
                                  <li>Kattints a levélben lévő kék <strong>"Activate Form"</strong> gombra.</li>
                                </ol>
                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                  <a
                                    href="https://mail.google.com/mail/u/0/#search/formsubmit"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-amber-900 text-white font-bold rounded-lg text-xs hover:bg-amber-800 transition-colors inline-flex items-center gap-1"
                                  >
                                    <Search className="w-3.5 h-3.5" />
                                    <span>FormSubmit keresése a Gmailben</span>
                                  </a>
                                  <a
                                    href="https://mail.google.com/mail/u/0/#spam"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-stone-200 text-stone-800 font-bold rounded-lg text-xs hover:bg-stone-300 transition-colors inline-flex items-center gap-1"
                                  >
                                    <span>Spam mappa megnyitása</span>
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Helpful tips if no test has been clicked yet */}
                    {!emailTestResult && (
                      <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
                        <strong className="block text-stone-800 font-bold">
                          💡 Tudnivaló a foglalási e-mailekről:
                        </strong>
                        <p>
                          A rendszer minden asztalfoglalásról, önkéntesről és lemondásról automatikusan elküldi az adatokat a Gmail postafiókodba. Ha nem látod az Elsődleges beérkező levelek között, ellenőrizd a <strong>Spam (Levélszemét)</strong> vagy <strong>Promóciók</strong> mappát, mert a Gmail automata szűrője előfordulhat, hogy oda sorolja be!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SENT EMAILS LOG */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-stone-900 text-sm font-serif">
                      A rendszer által kiküldött legutóbbi értesítések naplója ({getSentEmails().length} db):
                    </h5>

                    {getSentEmails().length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-500 text-xs">
                        Még nem történt kiküldött értesítés ebben a böngészési munkamenetben. Kattints a fenti "Teszt e-mail küldése most" gombra!
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
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    mail.status.includes('Aktiváció')
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
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

                            <div className="text-xs text-stone-600 flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-stone-700">Címzett:</span>
                              <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-[11px] text-stone-800">
                                {mail.to}
                              </span>
                              {mail.responseDetails && (
                                <span className="text-[11px] text-stone-500 italic">
                                  ({mail.responseDetails})
                                </span>
                              )}
                            </div>

                            <div
                              className="bg-[#FAF8F5] p-3 rounded-lg border border-stone-200 text-xs text-stone-700 leading-relaxed font-sans max-h-48 overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: mail.htmlContent }}
                            />

                            <div className="flex justify-end pt-1">
                              <a
                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                  mail.to
                                )}&su=${encodeURIComponent(mail.subject)}`}
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
                </div>
              )}

              {/* NOTIFICATION TAB (Felső hírsáv kezelése, max 200 karakter) */}
              {activeTab === 'notification' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-300 shadow-2xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1A3626] text-[#E7C286] flex items-center justify-center shrink-0 shadow-2xs">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-stone-900 font-serif">
                            Weboldal felső értesítési sáv (Max. 200 karakter)
                          </h4>
                          <p className="text-xs text-stone-600 mt-0.5">
                            Itt adhatsz meg a weboldal tetején megjelenő kiemelt hirdetményt vagy figyelmeztetést.
                          </p>
                        </div>
                      </div>
                      <div>
                        {siteNotification && siteNotification.trim() ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>Jelenleg aktív a weboldalon</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-300">
                            <span>Jelenleg nincs aktív hirdetmény</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-stone-800">
                          Élő előnézet (így látják a látogatók a www.ujbudazsibi.hu-n):
                        </label>
                        <span className="text-[11px] text-stone-500">
                          {notificationDraft.trim() ? 'Megjelenik a weboldalon' : 'Rejtve marad (nincs üres doboz)'}
                        </span>
                      </div>

                      {notificationDraft.trim() ? (
                        <div className="bg-[#DC2626] text-white rounded-xl border border-red-700 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="p-1.5 rounded-lg bg-white text-red-700 shrink-0 font-bold shadow-xs">
                              <Bell className="w-4 h-4 fill-current" />
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                              {notificationDraft}
                            </p>
                          </div>
                          <span className="text-[10px] text-white/90 font-mono shrink-0 font-semibold uppercase tracking-wider bg-black/20 px-2.5 py-1 rounded">
                            Piros hírsáv előnézet
                          </span>
                        </div>
                      ) : (
                        <div className="bg-[#FAF8F5] border border-dashed border-stone-300 rounded-xl p-4 text-center text-xs text-stone-500">
                          <p className="italic">
                            Jelenleg nincs megadva értesítés szöveg. A weboldal tetején nem látszik semmilyen üres sáv vagy doboz.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Input editor with max 200 char enforcement */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-stone-900">
                          Értesítés szövege (maximum 200 karakterig) *
                        </label>
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            notificationDraft.length >= 200
                              ? 'bg-red-100 text-red-700'
                              : notificationDraft.length > 170
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {notificationDraft.length} / 200 karakter
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        maxLength={200}
                        value={notificationDraft}
                        onChange={(e) => setNotificationDraft(e.target.value.slice(0, 200))}
                        placeholder="Írd ide a legfontosabb információt (pl. szabad asztalok száma, időjárás infó, lemondási határidő)..."
                        className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-stone-300 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-stone-900 resize-none font-sans shadow-2xs leading-relaxed"
                      />
                    </div>

                    {/* Quick suggestion templates */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-stone-500 block">
                        Javasolt sablonok egy kattintással:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setNotificationDraft(
                              '📢 Figyelem: A tavaszi vásárokra már csak néhány szabad asztal maradt! Foglalj időben a fenti térképen!'
                            )
                          }
                          className="text-[11px] px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 transition-colors text-left cursor-pointer"
                        >
                          Fogyó asztalok felhívás
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setNotificationDraft(
                              '☀️ Időjárás tájékoztató: Hétvégén napos, kellemes tavaszi idő várható, a vásár zavartalanul megrendezésre kerül!'
                            )
                          }
                          className="text-[11px] px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 transition-colors text-left cursor-pointer"
                        >
                          Kedvező időjárás infó
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setNotificationDraft(
                              '⚠️ Fontos emlékeztető: Standlemondás díjmentesen legkésőbb a vásár előtt 8 nappal lehetséges az ujbudazsibi@gmail.com címen!'
                            )
                          }
                          className="text-[11px] px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 transition-colors text-left cursor-pointer"
                        >
                          8 napos lemondási szabály
                        </button>
                      </div>
                    </div>

                    {/* Actions: Save & Delete */}
                    <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationDraft('');
                          onDeleteNotification?.();
                        }}
                        className="px-4 py-2.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Értesítés törlése (sáv elrejtése a weboldalról)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSaveNotification?.(notificationDraft.trim());
                        }}
                        className="px-6 py-2.5 text-xs font-bold bg-[#1A3626] hover:bg-[#254d37] text-[#E7C286] border border-[#C88A36]/50 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 font-serif"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Mentés és közzététel a weboldalon</span>
                      </button>
                    </div>

                  </div>
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
