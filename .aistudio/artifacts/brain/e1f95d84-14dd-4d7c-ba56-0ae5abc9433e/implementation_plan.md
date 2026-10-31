# Újbudai Bolhapiac & Zsibvásár — Interaktív Közösségi Asztalfoglaló

Egy átlagember számára is magától értetődő, tiszta és esztétikus webes felület a XI. kerület májusi hétvégi közösségi zsibvásárainak asztalfoglalásához. A látogatók és árusok 4 különböző újbudai helyszín között válogathatnak, interaktív 2D utcaalaprajzon láthatják a lezárt utcaszakaszt a 36 számozott asztallal, a gyereksarokkal és a grillsarokkal, pontos méretezési útmutatóval ellenőrizhetik a standot, kiválaszthatják az árusított kategóriákat, és pár kattintással lefoglalhatják asztalukat azonnali fizetéssel és digitális árusi engedéllyel.

---

## Felhasználói visszajelzések & Megerősített döntések

> [!IMPORTANT]
> A pontosítási fázisban megerősített döntések:
> - **Utcai megjelenítés**: 2D felülnézeti sematikus utcaalaprajz számozott asztalokkal, utcabútorokkal, zöldfelületekkel és a kijelölt zónákkal (gyereksarok, grillsarok).
> - **Foglalási és fizetési modell**: Azonnali online kártyás fizetés (szimulált, biztonságos felülettel) és azonnali digitális eladói engedély (QR-kódos standjegy).
> - **Májusi helyszínek**: 4 különböző XI. kerületi hétvégi helyszín (Bartók Béla Negyed, Gazdagrét, Bikás park / Kelenföld, Őrmező).

---

## 1. Áttekintés & Alapkoncepció

- **Miről szól a rendszer?**  
  A XI. kerületben májusban minden hétvégén egy-egy helyi lakóutca lezárásával közösségépítő zsibvásár valósul meg. Az oldal célja, hogy a helyi lakosok és hobbiárusok műszaki vagy digitális előképzettség nélkül is könnyen átlássák: melyik hétvégén hol lesz a piac, mely asztalok szabadok, mekkora a hely, mik a pakolási szabályok, és néhány érintéssel lefoglalhassák és kifizessthessék a helyüket.
- **Kiknek szól?**  
  - *Árusok / helyi lakosok*: családok, gyűjtők, kézművesek, szekrényürítők, akik egyszerűen szeretnének asztalt bérelni 1 napra vagy teljes hétvégére.
  - *Látogatók / családok*: akik megnéznék a programokat, a gyereksarkot (arcfestés, játszóház, megőrző), a grillsarkot, és hogy milyen kategóriájú árusok lesznek kint.
- **Kiemelt értékek**:  
  - 100%-ban átlátható asztalméretezés (120×80 cm asztal + 50–50 cm két oldalsó zóna, szigorúan szabadon hagyandó 100 cm-es első közlekedőfolyosó).
  - Érthető árusítási kategóriák (ruha, könyv/vinyl, antikvitás, gyerekjáték, kézműves, lakberendezés, retró elektronika).
  - Áttekinthető, rendezett utcatérkép 36 asztallal és közösségi pontokkal.

---

## 2. Felhasználói élmény & Vizuális tervezés

### Főbb felhasználói lépések (User Flows)
1. **Helyszín- és időpontválasztás**:  
   A felső szűrősávban 4 májusi időpont és helyszín közül választhat a felhasználó:
   - *Május 2–3.*: Bartók Béla Negyed (Zenta utca sétálószakasz)
   - *Május 9–10.*: Gazdagréti Sétány (Toroczkó u. zöldövezet)
   - *Május 16–17.*: Kelenföld / Bikás park (Etele út melletti sétány)
   - *Május 23–24.*: Őrmező (Menyecske utca ligetes szakasz)
2. **Interaktív 2D Utcaalaprajz**:  
   - A lezárt utcaszakasz 2D felülnézetben jelenik meg: útburkolati jelzések, utcafák, járdaszegély, korzó sáv.
   - 36 számozott asztal két sorban (Északi és Déli járdafront), színkódolt státusszal: Szabad (zöldes-menta), Lefoglalt (visszafogott szürke), Saját kiválasztás (élénk borostyán/arany fókusz).
   - Külön jelölt közösségi szigetek: **Gyereksarok** (arcfestés, kézműves foglalkozás, felügyelt játszószőnyeg) és **Grillsarok & Kávézó** (helyi kézműves büfé, piknikpadok, hulladékgyűjtő pont).
3. **Stand adatlap & Méret-vizualizáló (Asztalra kattintáskor)**:  
   - Modális vagy oldalsó fiók nézet, amely felnagyítva megmutatja az asztal arányait:
     - Asztallap: `120 cm × 80 cm` (masszív fa sörpad asztal).
     - Oldalsó pakoló zóna: `+50 cm` balra és `+50 cm` jobbra (állvány, láda elhelyezésére).
     - Elülső zóna: `SZIGORÚAN SZABADON HAGYANDÓ` (a vásárlói sétány akadálymentessége érdekében előre nem pakolható).
     - Napi bérleti díj (pl. 4 500 Ft / nap vagy 8 000 Ft / teljes hétvége).
4. **Regisztráció & Árusítási Kategóriák bekérése**:  
   - Név, e-mail cím, telefonszám, lakcím (XI. kerületi lakcím esetén jelölőnégyzet kedvezményhez).
   - Árusítási kategóriák (több is választható):
     - Ruházat & Kiegészítők
     - Könyvek, Képregények & Vinyl lemezek
     - Antikvitás & Bolti ritkaságok
     - Gyerekjátékok & Babaholmik
     - Kézműves & Egyedi alkotások
     - Lakberendezés & Dísztárgyak
     - Retró elektronika & Barkács
   - Rövid bemutató megjegyzés az eladandó portékáról.
5. **Azonnali kártyás fizetés szimuláció & Standjegy**:  
   - Összegző, SimplePay/Stripe stílusú bankkártyás fizetési űrlap valós validációval.
   - Sikeres tranzakció után azonnal letölthető / képernyőn felmutatható **Digitális Standengedély**:
     - Asztalszám, helyszín, dátum, QR kód, árus neve, regisztrált kategóriák.
   - Az asztal státusza az alaprajzon azonnal foglaltra vált.

### Vizuális arculat & Esztétika
- **Stílusirányzat**: Természetközeli, meleg urbanisztikus, barátságos közösségi dizájn (Budapest XI. kerületi tavaszi hangulat, platánfák zöldje, meleg terrakotta és homokkő árnyalatok, tiszta fehér és pala szürke struktúra).
- **Színpaletta**:
  - Alap háttér: `#F8FAFC` (világos pala) és meleg papírfehér kártyák.
  - Elsődleges márkaszin: Újbuda-zöld (`#15803D` / `#166534`) a szabad asztalokhoz és kiemelt gombokhoz.
  - Fókusz és kiemelés: Meleg borostyán (`#D97706`) az aktív kiválasztáshoz.
  - Foglalt asztalok: Semleges pala (`#94A3B8`).
  - Gyereksarok: Pasztell levendula-kék zóna (`#6366F1`).
  - Grillsarok: Meleg fahéj-narancs zóna (`#EA580C`).
- **Tipográfia**:
  - Kiemelt címek: `Plus Jakarta Sans` tiszta modern geometriával.
  - Törzsszöveg: Jól olvasható, 15-16px méretű rendszer-betűcsalád optimális sortávolsággal.
  - Méretek és asztalszámok: `font-mono tabular-nums` a pontos műszaki arányokhoz.

---

## 3. Kulcsfontosságú termékdöntések & Kompromisszumok

- **Döntés 1: 2D sematikus utcaalaprajz térkép-API helyett**  
  - *Választás*: Egyedi, méretarányos, interaktív SVG/HTML5 2D alaprajz, kiegészítve a helyszín valós utcaképével és címeivel.
  - *Miért?*: A Google Maps műholdképe nem mutatja meg az asztalok fizikai helyét, nem biztosít 120x80 cm-es arányos elhelyezést és nem teszi lehetővé a látványos kattintást közvetlenül az asztallapra. A 2D alaprajz azonnal érthető minden nagymama és fiatal árus számára.
- **Döntés 2: Kategóriák és kínálat-átláthatóság**  
  - *Választás*: A látogatói nézetben szűrni is lehet az asztalok között termékkategória szerint (pl. "Hol árulnak könyveket?"), így a vevők is céltudatosan sétálhatnak oda.
  - *Miért?*: Ez kettős értéket ad: az eladók regisztrálnak, a látogatók pedig kedvet kapnak a vásárláshoz.
- **Döntés 3: Helyszíni fizetés vs. Online kártyás fizetés**  
  - *Választás*: Azonnali kártyás fizetés szimuláció digitális standjeggyel.
  - *Miért?*: Kizárja az üres asztalfoglalásokat ("no-show"), egyszerűsíti a szervezők dolgát a helyszínen, hisz a belépéskor csak a standjegy QR-kódját vagy asztalszámát kell leolvasni.

---

## 4. Műszaki architektúra & Adatstratégia

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Fő Konténer)                           │
├────────────────────────────────┬───────────────────────────────────────┤
│ TopBar (Helyszín- & Dátumváltó)│ Információs sáv (Szabályzat, Időpont) │
└────────────────────────────────┴───────────────────────────────────────┘
                                 │
         ┌───────────────────────┴────────────────────────┐
         ▼                                                ▼
┌─────────────────────────────────┐      ┌───────────────────────────────┐
│     InteractiveStreetCanvas     │      │         SidePanel /           │
│  - Lezárt úttest 2D alaprajz    │      │        TableDetailView        │
│  - 36 asztal rácsban (É/D oldal)│◄────►│  - Asztal méretrajz (120x80)  │
│  - Gyereksarok & Játszóház      │      │  - 50-50 cm pakolási zóna     │
│  - Grillsarok & Büféteraszkert  │      │  - Foglaltsági állapot        │
│  - Fák, padok, bejárat, WC-k    │      │  - "Asztal lefoglalása" gomb  │
└─────────────────────────────────┘      └───────────────┬───────────────┘
                                                         │
                                                         ▼
                                         ┌───────────────────────────────┐
                                         │       BookingModalFlow        │
                                         │ 1. Árus adatai & Kategóriák   │
                                         │ 2. Méret- és házirend elfogadás│
                                         │ 3. Kártyás fizetés szimuláció │
                                         │ 4. Digitális engedély / Jegy  │
                                         └───────────────────────────────┘
```

### Állapotkezelés & Adatmodell
- `Location`: Azonosító, név, kerületrész, cím, májusi dátum, leírás, megközelítés (tömegközlekedés).
- `Table`:
  - `id`: szám (1-36)
  - `side`: 'north' | 'south'
  - `status`: 'available' | 'reserved' | 'selected'
  - `price`: 4 500 Ft
  - `dimensions`: `{ width: 120, depth: 80, clearanceSide: 50, clearanceFront: 0 }`
  - `occupant`: `{ name, categories: string[], description, bookingRef }`
- `Category`: `['clothes', 'books_vinyl', 'antiques', 'kids_toys', 'handmade', 'home_decor', 'retro_electronics']`
- `CommunityZones`:
  - `kidsZone`: Arcfestés, ugróiskola, babakocsi-tároló, árnyékolt játszószőnyeg.
  - `grillZone`: Rostonsültek, friss kávé, házi limonádé, pihenőpadok.

---

## 5. Ellenőrzési & Verifikációs terv
1. 4 kerületi helyszín zökkenőmentes váltása, egyedi foglaltsági állapottal.
2. 36 asztal kattinthatósága, vizuális állapotjelzés (szabad, lefoglalt, kiválasztott).
3. Méretrajz helyes megjelenítése: 120×80 cm asztal, 50-50 cm oldalsó pakolótér vizuális arányai és a figyelmeztetés ("Előre nem pakolható!").
4. Kategóriaválasztó több kategória jelölésére, reszponzív űrlap.
5. Fizetési lépés szimulációja, kártyaadat-ellenőrzéssel és visszajelzéssel.
6. Kiállított standjegy megjelenítése QR-kóddal, nyomtatási/mentési funkcióval.
7. Gyerek- és grillsarok részletes programkártyái és utcabútori jelölései.
