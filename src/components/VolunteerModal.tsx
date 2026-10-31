import React, { useState } from 'react';
import { LocationData, VolunteerApplication, VolunteerTask } from '../types/market';
import { VOLUNTEER_TASKS } from '../data/mockData';
import { sendEmailNotification } from '../lib/supabase';
import {
  X,
  Heart,
  CheckCircle2,
  Mail,
  Send,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface VolunteerModalProps {
  isOpen: boolean;
  locations: LocationData[];
  selectedLocationId: string;
  onClose: () => void;
  onSubmitVolunteer: (application: VolunteerApplication) => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({
  isOpen,
  locations,
  selectedLocationId,
  onClose,
  onSubmitVolunteer,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationId, setLocationId] = useState(selectedLocationId);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [otherOffer, setOtherOffer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Kérjük, add meg a neved, e-mail címed és telefonszámod!');
      return;
    }
    if (selectedTasks.length === 0 && !otherOffer.trim()) {
      setErrorMsg('Kérjük, válassz legalább egy feladatot vagy írd meg az egyéb felajánlásodat!');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const loc = locations.find((l) => l.id === locationId) || locations[0];
    const newVol: VolunteerApplication = {
      id: `vol-${Date.now().toString().slice(-4)}`,
      fullName,
      email,
      phone,
      locationId,
      locationName: loc.name,
      selectedTaskIds: selectedTasks,
      otherOffer,
      createdAt: new Date().toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Dispatches notification to ujbudazsibi@gmail.com
    await sendEmailNotification({
      to: 'ujbudazsibi@gmail.com',
      subject: `[Újbudazsibi Önkéntes] Új segítő jelentkezett: ${fullName}`,
      htmlContent: `
        <h3>Új Önkéntes Jelentkezés</h3>
        <p><strong>Név:</strong> ${fullName}</p>
        <p><strong>Elérhetőség:</strong> ${phone} | ${email}</p>
        <p><strong>Helyszín:</strong> ${loc.name}</p>
        <p><strong>Választott feladatok:</strong> ${selectedTasks.join(', ')}</p>
        <p><strong>Egyéb felajánlás:</strong> ${otherOffer || 'Nincs'}</p>
      `,
    });

    onSubmitVolunteer(newVol);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setSelectedTasks([]);
    setOtherOffer('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-xl w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1A3626] text-[#E7C286] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-[#E7C286]/30 text-[#E7C286]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                Önkéntesnek jelentkezem a közösségi piacra
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Segíts megteremteni az Újbudazsibi barátságos, zökkenőmentes hangulatát!
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
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-stone-900 font-serif">
              Köszönjük a jelentkezésedet!
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Jelentkezésedet rögzítettük és elküldtük az értesítést. A vásár előtt koordinátorunk telefonon és e-mailben is felveszi veled a kapcsolatot a részletekkel!
            </p>

            <div className="pt-3">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Vissza a vásárhoz
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Location selector */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Melyik májusi helyszínen szeretnél segíteni? *
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} · {loc.dateBadge} ({loc.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            {/* Personal info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Név *
                </label>
                <input
                  type="text"
                  required
                  placeholder="pl. Balogh Péter"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail cím *
                </label>
                <input
                  type="email"
                  required
                  placeholder="peter@pelda.hu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Telefonszám *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+36 30 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
                />
              </div>
            </div>

            {/* Task selection list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-800">
                  Milyen feladatokat vállalnál be szívesen? *
                </label>
                <span className="text-[11px] text-stone-500">Több is jelölhető</span>
              </div>

              <div className="space-y-2">
                {VOLUNTEER_TASKS.map((task) => {
                  const isChecked = selectedTasks.includes(task.id);
                  return (
                    <label
                      key={task.id}
                      className={`flex items-start gap-3 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTask(task.id)}
                        className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-stone-900">
                            {task.title}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded self-start sm:self-center">
                            {task.timeSlot}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                          {task.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Other offer textarea */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Egyéb saját felajánlás vagy ötlet
              </label>
              <textarea
                rows={2}
                value={otherOffer}
                onChange={(e) => setOtherOffer(e.target.value)}
                placeholder="pl. Saját fényképezőgéppel fotózást vállalok, süteményt sütnék a csapatnak..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
            )}

            {/* Footer buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
              >
                Mégse
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1A3626] hover:bg-[#254834] text-[#FDFBF7] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer border border-[#1A3626]"
              >
                {isSubmitting ? (
                  <span>Küldés folyamatban...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#E7C286]" />
                    <span>Jelentkezés beküldése önkéntesnek</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
