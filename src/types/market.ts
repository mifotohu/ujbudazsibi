export interface TableDimensions {
  width: number; // 120 cm (table itself)
  depth: number; // 80 cm
  clearanceSide: number; // 65 cm each side (total width: 65 + 120 + 65 = 250 cm)
  totalWidth: number; // 250 cm
  totalDepth: number; // 100 cm
  clearanceFront: number; // strictly 0 cm (pedestrian walkway clearance)
}

export interface TableOccupant {
  name: string; // full name stored for admin
  email?: string;
  phone?: string;
  districtAddress?: string;
  postalCode?: string;
  isImmediateNeighbor?: boolean;
  categories: string[];
  note: string;
  bookingRef: string;
  bookedAt?: string;
  amountPaid?: number;
}

export type TableStatus = 'available' | 'reserved' | 'selected';

export interface TableData {
  id: number;
  side: 'north' | 'south';
  status: TableStatus;
  price: number; // 4 500 Ft (XI. district resident) or 4 050 Ft (immediate neighborhood resident)
  dimensions: TableDimensions;
  reservedBy?: TableOccupant;
}

// 4 Kids Flea Market Tables (Gyerekzsibi)
export interface KidsFleaTable {
  id: string; // 'GY-1', 'GY-2', 'GY-3', 'GY-4'
  name: string; // e.g. 'Gyerekzsibi #1'
  status: 'available' | 'reserved';
  reservedBy?: {
    parentName: string;
    childName: string;
    childAge: number;
    email: string;
    phone: string;
    itemsDescription: string;
    bookingRef: string;
    bookedAt: string;
  };
}

export interface LocationData {
  id: string;
  name: string;
  neighborhood: string;
  streetName: string;
  postalCodes: string[]; // e.g. ['1111', '1114'] for local neighborhood discount
  weekendDates: string;
  dateBadge: string;
  eventDateIso: string; // ISO date format YYYY-MM-DD for 8-day cancellation rule
  description: string;
  transport: string;
  coordinates: string;
  tables: TableData[];
  kidsFleaTables: KidsFleaTable[];
}

export interface CategoryItem {
  id: string;
  label: string;
  iconName: string;
  badgeColor: string;
  description: string;
}

export interface BookingFormState {
  fullName: string;
  email: string;
  phone: string;
  postalCode: string;
  streetAddress: string;
  isDistrictResident?: boolean;
  categories: string[];
  itemsDescription: string;
  agreedRules: boolean;
  agreedGdpr: boolean;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

export interface ConfirmedBooking {
  bookingId: string;
  tableId: number;
  locationId: string;
  locationName: string;
  streetName: string;
  weekendDates: string;
  eventDateIso: string;
  sellerName: string; // full name
  email: string;
  phone: string;
  postalCode: string;
  streetAddress: string;
  isImmediateNeighbor: boolean;
  categories: string[];
  itemsDescription: string;
  totalPaid: number;
  createdAt: string;
  qrCodeData: string;
}

// Commercial Vendor Concession Booking (Kids Corner / Grill Corner)
export type CommercialType = 'kids_corner' | 'grill_corner';

export interface CommercialVendorBooking {
  id: string;
  type: CommercialType;
  locationId: string;
  locationName: string;
  weekendDates: string;
  companyName: string;
  taxNumber: string; // Adószám
  billingAddress: string;
  contactPerson: string;
  email: string;
  phone: string;
  programOrMenuOffer: string;
  feePaid: number; // 15 000 Ft or 35 000 Ft
  status: 'pending' | 'approved';
  createdAt: string;
}

// Street Musician Application
export interface StreetMusicianApplication {
  id: string;
  musicianOrBandName: string;
  contactName: string;
  email: string;
  phone: string;
  genre: string; // pl. akusztikus gitár, harmonika, hegedű, népzene
  instruments: string;
  locationId: string;
  locationName: string;
  preferredTimeSlot: string; // pl. '11:00 – 12:00' vagy 'Egész napos jelenlét'
  note: string;
  createdAt: string;
}

// Anonymous Market Feedback / Review
export interface MarketReview {
  id: string;
  rating: number; // 1 to 5
  atmosphereRating: number;
  organizationRating: number;
  feedbackText: string;
  sellerFeedback?: string; // specific private feedback about sellers for organizer
  authorName?: string;
  publicAllowed?: boolean; // oldalon megjelenhet? true: igen, false: csak belső szervezői visszajelzés
  status?: 'pending' | 'approved' | 'rejected'; // jóváhagyási státusz adminisztrátornak
  submittedAt: string;
}

export interface VolunteerTask {
  id: string;
  title: string;
  timeSlot: string;
  description: string;
}

export interface VolunteerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  locationId: string;
  locationName: string;
  selectedTaskIds: string[];
  otherOffer: string;
  createdAt: string;
}

// GDPR Anonymizer: "Kovács Péter" -> "K. Péter", "Nagy Erika" -> "N. Erika"
export function formatGdprName(fullName: string): string {
  if (!fullName) return 'Árus';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const lastNameInitial = parts[0].charAt(0).toUpperCase();
  const restOfName = parts.slice(1).join(' ');
  return `${lastNameInitial}. ${restOfName}`;
}
