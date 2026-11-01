import {
  CategoryItem,
  LocationData,
  TableData,
  VolunteerTask,
  VolunteerApplication,
  KidsFleaTable,
  CommercialVendorBooking,
  StreetMusicianApplication,
  MarketReview,
  formatGdprName,
} from '../types/market';

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'clothes',
    label: 'Ruházat és kiegészítők',
    iconName: 'Shirt',
    badgeColor: 'text-rose-800 bg-rose-50 border-rose-300',
    description: 'Vintage ruhák, kabátok, cipők, kendők, táskák és ékszerek',
  },
  {
    id: 'books_vinyl',
    label: 'Könyvek és bakelitlemezek',
    iconName: 'Disc3',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-300',
    description: 'Képregények, regények, művészeti albumok, LP lemezek, CD-k',
  },
  {
    id: 'antiques',
    label: 'Antikvitás és ritkaságok',
    iconName: 'Clock',
    badgeColor: 'text-stone-800 bg-stone-100 border-stone-300',
    description: 'Porcelánok, órák, régi pénzek, réztárgyak, emlékek',
  },
  {
    id: 'kids_toys',
    label: 'Gyerekjátékok és babaholmik',
    iconName: 'Baby',
    badgeColor: 'text-blue-800 bg-blue-50 border-blue-300',
    description: 'Társasjátékok, LEGO, plüssök, fa játékok, kinőtt babaruhák',
  },
  {
    id: 'handmade',
    label: 'Kézműves és egyedi holmik',
    iconName: 'Sparkles',
    badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-300',
    description: 'Saját készítésű kerámiák, grafikák, horgolt díszek, szappanok',
  },
  {
    id: 'home_decor',
    label: 'Lakberendezés és konyha',
    iconName: 'Lamp',
    badgeColor: 'text-indigo-800 bg-indigo-50 border-indigo-300',
    description: 'Lámpák, képek, vázák, vintage konyhai eszközök, kisbútorok',
  },
  {
    id: 'retro_electronics',
    label: 'Retró elektronika és barkács',
    iconName: 'Radio',
    badgeColor: 'text-cyan-800 bg-cyan-50 border-cyan-300',
    description: 'Fényképezőgépek, rádiók, walkmanek, mechanikus eszközök, szerszámok',
  },
];

// Unified volunteer tasks without barrier setup or heavy porter tasks
export const VOLUNTEER_TASKS: VolunteerTask[] = [
  {
    id: 'checkin_greeting',
    title: 'Árusok fogadása és asztalokhoz kísérése',
    timeSlot: '07:30 – 08:30',
    description: 'Az érkező eladók szeretetteljes fogadása a kapuknál, standjegy ellenőrzése és a lefoglalt asztal megmutatása.',
  },
  {
    id: 'tables_labeling',
    title: 'Standok számozása és információs táblák kihelyezése',
    timeSlot: '07:30 – 08:30',
    description: 'A fa asztalok sorszámtábláinak és a tájékoztató irányjelzőknek a feltűzése a reggeli nyitás előtt.',
  },
  {
    id: 'green_box_coordinator',
    title: 'Zöld Doboz (ingyen elvihető sarok) felügyelete',
    timeSlot: '08:30 – 17:00 (választható 2-3 órás műszak)',
    description: 'A felajánlott tiszta könyvek, palánták, használati tárgyak esztétikus elrendezése a cserebere asztalon.',
  },
  {
    id: 'kids_flea_helper',
    title: 'Gyerekzsibi kisárusok koordinálása',
    timeSlot: '08:30 – 17:00 (választható műszak)',
    description: 'A 4 gyermek standnál árusító kicsik és szüleik bátorítása, segítségnyújtás az árak kiírásában.',
  },
  {
    id: 'street_musician_helper',
    title: 'Utcazenész szőnyeg idősávok és hangosítási segítség',
    timeSlot: '09:00 – 17:00',
    description: 'A fellépő akusztikus zenészek fogadása, a szőnyeg és székek rendben tartása a grillsarok mellett.',
  },
  {
    id: 'info_desk',
    title: 'Központi lakossági infópult',
    timeSlot: '09:00 – 17:00 (választható műszak)',
    description: 'Látogatók eligazítása, programfüzetek átadása, kérdések megválaszolása a bolhapiacon.',
  },
];

// Standard Table Dimensions: Exactly 250 cm wide x 100 cm deep
export const STANDARD_DIMENSIONS = {
  width: 120, // 120 cm table width
  depth: 80, // 80 cm table depth
  clearanceSide: 65, // 65 cm left + 65 cm right (65 + 120 + 65 = 250 cm total width)
  totalWidth: 250, // 250 cm total occupied width
  totalDepth: 100, // 100 cm total depth
  clearanceFront: 0, // strictly 0 front clearance
};

function generateTables(
  reservedMap: Record<
    number,
    {
      name: string;
      email: string;
      phone: string;
      districtAddress: string;
      postalCode: string;
      isImmediateNeighbor: boolean;
      categories: string[];
      note: string;
      bookingRef: string;
      amountPaid: number;
    }
  >
): TableData[] {
  const tables: TableData[] = [];
  for (let i = 1; i <= 36; i++) {
    const isNorth = i <= 18;
    const reservedInfo = reservedMap[i];
    tables.push({
      id: i,
      side: isNorth ? 'north' : 'south',
      status: reservedInfo ? 'reserved' : 'available',
      price: reservedInfo?.amountPaid ?? 4500,
      dimensions: STANDARD_DIMENSIONS,
      reservedBy: reservedInfo,
    });
  }
  return tables;
}

function generateKidsFleaTables(): KidsFleaTable[] {
  return [
    {
      id: 'GY-1',
      name: 'Gyerekzsibi #1',
      status: 'reserved',
      reservedBy: {
        parentName: 'Horváth Ágnes',
        childName: 'Horváth Bence',
        childAge: 9,
        email: 'horvath.agi@freemail.hu',
        phone: '+36 30 222 3344',
        itemsDescription: 'Kinőtt LEGO készletek, társasjátékok és saját rajzolt képregények zsebpénzért',
        bookingRef: 'GY-B-01',
        bookedAt: '2026-10-25',
      },
    },
    {
      id: 'GY-2',
      name: 'Gyerekzsibi #2',
      status: 'available',
    },
    {
      id: 'GY-3',
      name: 'Gyerekzsibi #3',
      status: 'available',
    },
    {
      id: 'GY-4',
      name: 'Gyerekzsibi #4',
      status: 'available',
    },
  ];
}

const today = new Date();
const addDays = (d: Date, days: number) => {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res.toISOString().split('T')[0];
};

export const INITIAL_LOCATIONS: LocationData[] = [
  {
    id: 'bartok',
    name: 'Bartók Béla negyed',
    neighborhood: 'Szentimreváros / Gellért tér',
    streetName: 'Zenta utca (Gellért tértől a Bartók Béla útig lezárt szakasz)',
    postalCodes: ['1111', '1114'], // Exact neighborhood postal codes for 4050 Ft
    weekendDates: '2026. Május 2–3. (szombat–vasárnap)',
    dateBadge: 'Május 2–3.',
    eventDateIso: addDays(today, 16), // > 8 days away: allows testing cancellation & table release!
    description: 'Kulturális negyed hangulata platánfák alatt, művészeti kávézók szomszédságában, zöld sétálóövezetben.',
    transport: 'M4 metró, 47/49 villamos (Szent Gellért tér megálló)',
    coordinates: '47.4815° N, 19.0521° E',
    tables: generateTables({
      2: {
        name: 'Varga Zsuzsanna',
        email: 'varga.zsuzsi@freemail.hu',
        phone: '+36 30 421 9876',
        districtAddress: '1111 Budapest, Bartók Béla út 24.',
        postalCode: '1111',
        isImmediateNeighbor: true,
        categories: ['antiques', 'home_decor'],
        note: 'Herendi és Zsolnay kisplasztikák, art déco lámpák és faliórák',
        bookingRef: 'UJB-BB-002',
        amountPaid: 4050,
      },
      5: {
        name: 'Kovács Péter',
        email: 'peter.kovacs82@gmail.com',
        phone: '+36 20 555 1234',
        districtAddress: '1115 Budapest, Halmi utca 12.',
        postalCode: '1115',
        isImmediateNeighbor: false,
        categories: ['books_vinyl'],
        note: '60-as és 80-as évekbeli rock bakelitlemezek, képregény ritkaságok',
        bookingRef: 'UJB-BB-005',
        amountPaid: 4500,
      },
      8: {
        name: 'Németh Lili',
        email: 'lili.nemeth@citromail.hu',
        phone: '+36 70 889 0123',
        districtAddress: '1114 Budapest, Fadrusz utca 8.',
        postalCode: '1114',
        isImmediateNeighbor: true,
        categories: ['handmade', 'clothes'],
        note: 'Újrahasznosított farmer táskák és kézzel hímzett vászonruhák',
        bookingRef: 'UJB-BB-008',
        amountPaid: 4050,
      },
      12: {
        name: 'Horváth Gábor',
        email: 'horvath.gabor.foto@gmail.com',
        phone: '+36 30 765 4321',
        districtAddress: '1118 Budapest, Ménesi út 31.',
        postalCode: '1118',
        isImmediateNeighbor: false,
        categories: ['retro_electronics'],
        note: 'Analóg fényképezőgépek (Zenit, Praktica), objektívek és régi rádiók',
        bookingRef: 'UJB-BB-012',
        amountPaid: 4500,
      },
      20: {
        name: 'Szabó Márton',
        email: 'marton.szabo@chello.hu',
        phone: '+36 30 333 4455',
        districtAddress: '1111 Budapest, Bertalan Lajos u. 15.',
        postalCode: '1111',
        isImmediateNeighbor: true,
        categories: ['books_vinyl', 'antiques'],
        note: 'Első kiadású versek, régi képeslapok és Budapest térképek',
        bookingRef: 'UJB-BB-020',
        amountPaid: 4050,
      },
      24: {
        name: 'Molnár Klára',
        email: 'klara.molnar@gmail.com',
        phone: '+36 20 999 8877',
        districtAddress: '1117 Budapest, Október huszonharmadika u. 9.',
        postalCode: '1117',
        isImmediateNeighbor: false,
        categories: ['kids_toys'],
        note: 'Fajátékok, mesekönyvek és alig használt társasjátékok',
        bookingRef: 'UJB-BB-024',
        amountPaid: 4500,
      },
    }),
    kidsFleaTables: generateKidsFleaTables(),
  },
  {
    id: 'gazdagret',
    name: 'Gazdagréti közösségi sétány',
    neighborhood: 'Gazdagrét',
    streetName: 'Toroczkó utca (Közösségi Ház melletti lezárt zöldfelület)',
    postalCodes: ['1118', '1112'],
    weekendDates: '2026. Május 9–10. (szombat–vasárnap)',
    dateBadge: 'Május 9–10.',
    eventDateIso: addDays(today, 12), // 12 days away: cancellation allowed!
    description: 'Családi és lakótelepi közösségi vásár parkosított sétányon, óriási játszótérrel és kényelmes pihenőkkel.',
    transport: '8E, 139, 153 buszok (Gazdagréti tér / Toroczkó u.)',
    coordinates: '47.4760° N, 19.0010° E',
    tables: generateTables({
      1: {
        name: 'Farkas Nóra',
        email: 'farkas.nora@gmail.com',
        phone: '+36 30 111 2233',
        districtAddress: '1118 Budapest, Rétköz utca 14.',
        postalCode: '1118',
        isImmediateNeighbor: true,
        categories: ['kids_toys', 'clothes'],
        note: 'Kinőtt babaruhák, kismama holmik, fejlesztő fa játékok',
        bookingRef: 'UJB-GR-001',
        amountPaid: 4050,
      },
      4: {
        name: 'Bognár László',
        email: 'bognar.barkacs@t-online.hu',
        phone: '+36 70 234 5678',
        districtAddress: '1116 Budapest, Fehérvári út 182.',
        postalCode: '1116',
        isImmediateNeighbor: false,
        categories: ['retro_electronics'],
        note: 'Barkácsgépek, műszerész szerszámok és retró magnókazetták',
        bookingRef: 'UJB-GR-004',
        amountPaid: 4500,
      },
      7: {
        name: 'Papp Katalin',
        email: 'katalin.papp@freemail.hu',
        phone: '+36 20 444 5566',
        districtAddress: '1112 Budapest, Toroczkó u. 6.',
        postalCode: '1112',
        isImmediateNeighbor: true,
        categories: ['handmade', 'home_decor'],
        note: 'Kézzel öntött szójaviasz gyertyák és fazekas bögrék',
        bookingRef: 'UJB-GR-007',
        amountPaid: 4050,
      },
    }),
    kidsFleaTables: generateKidsFleaTables(),
  },
  {
    id: 'kelenfold',
    name: 'Kelenföld / Bikás park',
    neighborhood: 'Kelenföld',
    streetName: 'Etele sétány (A Bikás Park északi sétaútja lezárt aszfaltozott résszel)',
    postalCodes: ['1115', '1119'],
    weekendDates: '2026. Május 16–17. (szombat–vasárnap)',
    dateBadge: 'Május 16–17.',
    eventDateIso: addDays(today, 19),
    description: 'A kerület legnagyobb zöldparkja mellett, közvetlen metrókapcsolat, piknikhangulat és hatalmas forgalom.',
    transport: 'M4 metró, 1-es villamos, 7/114 buszok (Bikás park megálló)',
    coordinates: '47.4645° N, 19.0345° E',
    tables: generateTables({
      3: {
        name: 'Sipos Dániel',
        email: 'sipos.dani@gmail.com',
        phone: '+36 30 678 9012',
        districtAddress: '1115 Budapest, Bártfai utca 22.',
        postalCode: '1115',
        isImmediateNeighbor: true,
        categories: ['retro_electronics', 'books_vinyl'],
        note: 'Retro játékkonzolok (Game Boy, PS1), játékok és magazinok',
        bookingRef: 'UJB-KF-003',
        amountPaid: 4050,
      },
      6: {
        name: 'Lukács Emese',
        email: 'lukacs.emese@gmail.com',
        phone: '+36 20 888 7766',
        districtAddress: '1119 Budapest, Tétényi út 45.',
        postalCode: '1119',
        isImmediateNeighbor: true,
        categories: ['clothes'],
        note: '90-es évekbeli vintage pulóverek, bőrdzsekik és farmerok',
        bookingRef: 'UJB-KF-006',
        amountPaid: 4050,
      },
    }),
    kidsFleaTables: generateKidsFleaTables(),
  },
  {
    id: 'ormeze',
    name: 'Őrmező zöldövezet',
    neighborhood: 'Őrmező',
    streetName: 'Menyecske utca (A játszótér és kutyafuttató közötti csendes utcaszakasz)',
    postalCodes: ['1112'],
    weekendDates: '2026. Május 23–24. (szombat–vasárnap)',
    dateBadge: 'Május 23–24.',
    eventDateIso: addDays(today, 26),
    description: 'Nyugodt, zöldövezeti záró hétvége ligetes fákkal, madárcsicsergéssel és igazi környékbeli családi hangulattal.',
    transport: 'M4 metró Kelenföld felől, 150/154 buszok (Menyecske u.)',
    coordinates: '47.4601° N, 19.0189° E',
    tables: generateTables({
      2: {
        name: 'Rácz Miklós',
        email: 'racz.miki@t-email.hu',
        phone: '+36 30 555 7788',
        districtAddress: '1112 Budapest, Menyecske utca 18.',
        postalCode: '1112',
        isImmediateNeighbor: true,
        categories: ['antiques', 'retro_electronics'],
        note: 'Mechanikus karórák, gramofonlemezek és antik távcsövek',
        bookingRef: 'UJB-OM-002',
        amountPaid: 4050,
      },
    }),
    kidsFleaTables: generateKidsFleaTables(),
  },
];

export const INITIAL_VOLUNTEERS: VolunteerApplication[] = [
  {
    id: 'vol-001',
    fullName: 'Kelemen Ádám',
    email: 'adam.kelemen@ujbuda-mail.hu',
    phone: '+36 30 912 3456',
    locationId: 'bartok',
    locationName: 'Bartók Béla negyed',
    selectedTaskIds: ['checkin_greeting', 'green_box_coordinator'],
    otherOffer: 'Szívesen segítek a Zöld Doboz rendezésében és a látogatók köszöntésében.',
    createdAt: '2026-10-28 14:20',
  },
  {
    id: 'vol-002',
    fullName: 'Bálint Zsófia',
    email: 'zsofi.balint@freemail.hu',
    phone: '+36 70 654 3210',
    locationId: 'gazdagret',
    locationName: 'Gazdagréti közösségi sétány',
    selectedTaskIds: ['kids_flea_helper', 'info_desk'],
    otherOffer: 'Pedagógus vagyok, szívesen segítek a kicsiknek a Gyerekzsibi standoknál.',
    createdAt: '2026-10-29 09:45',
  },
];

// Initial commercial concession applications
export const INITIAL_COMMERCIAL_VENDORS: CommercialVendorBooking[] = [
  {
    id: 'comm-01',
    type: 'kids_corner',
    locationId: 'bartok',
    locationName: 'Bartók Béla negyed',
    weekendDates: '2026. Május 2–3.',
    companyName: 'Bóbita Családi Animáció Kft.',
    taxNumber: '24981762-2-43',
    billingAddress: '1114 Budapest, Bartók Béla út 52.',
    contactPerson: 'Sárvári Eszter',
    email: 'sarvari.eszter@bobita-animacio.hu',
    phone: '+36 30 456 7890',
    programOrMenuOffer: 'Professzionális arcfestés (bőrbarát szerves festékekkel), csillámtetoválás, óriás fa társasjátékok és felügyelt kreatív sarok. Saját 6x6 m-es fehér sátrat és szőnyeget hozunk.',
    feePaid: 15000,
    status: 'approved',
    createdAt: '2026-10-20',
  },
  {
    id: 'comm-02',
    type: 'grill_corner',
    locationId: 'bartok',
    locationName: 'Bartók Béla negyed',
    weekendDates: '2026. Május 2–3.',
    companyName: 'Újbudai Kézműves Gasztro Kft.',
    taxNumber: '19876543-2-43',
    billingAddress: '1111 Budapest, Budafoki út 16.',
    contactPerson: 'Molnár Viktor',
    email: 'molnar.viktor@ujbudagasztro.hu',
    phone: '+36 20 123 9988',
    programOrMenuOffer: 'Faszenes grillen sült bajor kolbászok, vegán grillezett gomolya és fűszeres zöldségek, helyi specialty kávé és hideg házi gyümölcsszörpök. Saját food truckkal / faházzal települünk ki, a fizetést saját POS terminállal és készpénzzel intézzük.',
    feePaid: 35000,
    status: 'approved',
    createdAt: '2026-10-22',
  },
];

// Initial Street Musician applications
export const INITIAL_MUSICIANS: StreetMusicianApplication[] = [
  {
    id: 'mus-01',
    musicianOrBandName: 'Szentimrei Akusztikus Duó',
    contactName: 'Nagy Balázs',
    email: 'balazs.nagy.git@gmail.com',
    phone: '+36 30 777 8899',
    genre: 'Akusztikus gitár és ének (békebeli sanzonok és jazz standardek)',
    instruments: '2 akusztikus gitár, cajon',
    locationId: 'bartok',
    locationName: 'Bartók Béla negyed',
    preferredTimeSlot: '11:00 – 12:30 és 14:30 – 16:00',
    note: 'Helyi kerületi zeneiskolai tanárok vagyunk, örömmel játszunk a korzón sétálóknak a szőnyegen.',
    createdAt: '2026-10-26',
  },
];

// Initial Anonymous Reviews (Admin only)
export const INITIAL_REVIEWS: MarketReview[] = [
  {
    id: 'rev-01',
    rating: 5,
    atmosphereRating: 5,
    organizationRating: 5,
    feedbackText: 'Nagyon barátságos volt a hangulat a Bartókon! Végre egy igazi közösségi vásár, ahol a szomszédokkal is lehetett beszélgetni.',
    sellerFeedback: 'A 20-as asztalnál a könyves árus bácsi elképesztően kedves volt, régi József Attila kötetet találtam nála.',
    publicAllowed: true,
    status: 'approved',
    submittedAt: '2026-10-29',
  },
  {
    id: 'rev-02',
    rating: 4,
    atmosphereRating: 5,
    organizationRating: 4,
    feedbackText: 'A Zöld Doboz ötlet zseniális, 3 szép szobanövény palántát hoztam el a kislányommal. Jó lenne több árnyékoló pad a sétányra.',
    sellerFeedback: '',
    publicAllowed: true,
    status: 'approved',
    submittedAt: '2026-10-30',
  },
];
