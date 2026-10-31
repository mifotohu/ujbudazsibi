import React from 'react';
import { X, ShieldCheck, FileText, Lock, Building, Mail } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-2xl w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-800 text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                Adatkezelési nyilatkozat és tájékoztató
              </h3>
              <p className="text-xs text-stone-600">
                Újbudazsibi (www.ujbudazsibi.hu) · GDPR & Számviteli tájékoztató
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-stone-700 leading-relaxed">
          
          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-1 font-serif">
              1. Az adatkezelő adatai és elérhetősége
            </h4>
            <p>
              <strong>Adatkezelő:</strong> Újbudazsibi Közösségi Rendezvényszervezés (Budapest Főváros XI. Kerület Újbuda)<br />
              <strong>Központi kapcsolattartási e-mail:</strong> <a href="mailto:ujbudazsibi@gmail.com" className="text-emerald-800 font-bold underline">ujbudazsibi@gmail.com</a><br />
              <strong>Weboldal:</strong> www.ujbudazsibi.hu
            </p>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-1 font-serif">
              2. Irányadó jogszabályi háttér
            </h4>
            <p>
              Az adatkezelés megfelel az alábbi hatályos jogszabályoknak:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 mt-1">
              <li>Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR)</li>
              <li>2011. évi CXII. törvény az információs önrendelkezési jogról és az információszabadságról (Infotv.)</li>
              <li>2000. évi C. törvény a számvitelről (Számv. tv. 169. § — bizonylatmegőrzési kötelezettség 8 évig)</li>
              <li>2013. évi V. törvény a Polgári Törvénykönyvről (Ptk.)</li>
            </ul>
          </div>

          <div className="p-3.5 bg-white border border-stone-300 rounded-xl space-y-1.5">
            <h4 className="font-bold text-stone-900 text-sm font-serif">
              3. Harmadik fél adatfeldolgozók és adattovábbítás
            </h4>
            <p className="text-[11px]">
              Tájékoztatjuk az árusokat és vállalkozókat, hogy a foglalás és fizetés során megadott adataik (név, lakcím/számlázási cím, e-mail, telefonszám, befizetett összeg) a törvényi kötelezettségek teljesítése érdekében harmadik feleknek átadásra kerülnek:
            </p>
            <ul className="list-disc pl-5 text-[11px] space-y-1 text-stone-800">
              <li>
                <strong>Fizetési szolgáltató:</strong> Stripe Payments Europe Ltd. / OTP SimplePay (biztonságos online tranzakciókezelés)
              </li>
              <li>
                <strong>Online számlázó rendszer:</strong> Számlázz.hu (KBOSS.hu Kft.) vagy Billingo Technologies Zrt. (elektronikus bizonylat kiállítása)
              </li>
              <li>
                <strong>Könyvelőiroda:</strong> a szervezőség szerződött, regisztrált mérlegképes könyvelője a hatósági adó- és pénzügyi bevallások elkészítéséhez
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-1 font-serif">
              4. A kezelt adatok köre és célja
            </h4>
            <p>
              • <strong>Árusok és lakosok:</strong> név, e-mail, telefonszám, XI. kerületi lakcím (a kerületi lakossági kedvezmény és belépés ellenőrzésére), standszám, árusítási kategóriák.<br />
              • <strong>GDPR anonimizáció a felületen:</strong> a weboldal látogatói felületén a lefoglalt standoknál kizárólag a vezetéknév kezdőbetűje és a keresztnév jelenik meg (pl. <em>K. Miklós</em>), teljes személyes adatokat külső látogató nem láthat.<br />
              • <strong>Anonim vélemények:</strong> a látogatói értékelések nem tartalmaznak személyes azonosítót, kizárólag a szervezői adminisztráció minőségbiztosítási céljaira szolgálnak.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-1 font-serif">
              5. Érintetti jogok és jogorvoslat
            </h4>
            <p>
              Az érintett bármikor kérelmezheti az adatkezelőtől a rá vonatkozó személyes adatokhoz való hozzáférést, azok helyesbítését vagy törlését (kivéve a számviteli törvény által kötelezően 8 évig megőrzendő számlázási adatokat). Kérelmét az <a href="mailto:ujbudazsibi@gmail.com" className="text-emerald-800 font-bold underline">ujbudazsibi@gmail.com</a> címen terjesztheti elő. Jogorvoslatért a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH, 1055 Budapest, Falk Miksa utca 9-11., www.naih.hu) fordulhat.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F4EFE6] border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Megértettem és elfogadom
          </button>
        </div>

      </div>
    </div>
  );
};
