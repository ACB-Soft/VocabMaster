import React, { useState } from 'react';
import { UserStats, NotificationSettings, Word } from '../types/vocab';
import { StorageService } from '../services/storage';
import { NotificationService } from '../services/notifications';
import { Bell, Target, RotateCcw, Download, Brain, Layers, HelpCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface SettingsModeProps {
  stats: UserStats;
  words: Word[];
  onWordsUpdated: () => void;
}

export const SettingsMode: React.FC<SettingsModeProps> = ({ stats, words, onWordsUpdated }) => {
  const [dailyGoal, setDailyGoal] = useState(stats.dailyGoal);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    StorageService.getSettings()
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLeitnerInfoExpanded, setIsLeitnerInfoExpanded] = useState(true);

  const handleGoalChange = (newGoal: number) => {
    setDailyGoal(newGoal);
    const updatedStats = { ...stats, dailyGoal: newGoal };
    StorageService.saveStats(updatedStats);
    onWordsUpdated();
  };

  const handleNotificationToggle = async () => {
    if (!notificationSettings.enabled) {
      const perm = await NotificationService.requestPermission();
      if (perm === 'granted') {
        const updated = { ...notificationSettings, enabled: true };
        setNotificationSettings(updated);
        StorageService.saveSettings(updated);
        NotificationService.scheduleDailyReminder(updated.reminderTime);
      } else {
        alert('Bildirim izni reddedildi. Lütfen tarayıcı ayarlarınızdan izin verin.');
      }
    } else {
      const updated = { ...notificationSettings, enabled: false };
      setNotificationSettings(updated);
      StorageService.saveSettings(updated);
    }
  };

  const handleReminderTimeChange = (time: string) => {
    const updated = { ...notificationSettings, reminderTime: time };
    setNotificationSettings(updated);
    StorageService.saveSettings(updated);
    if (updated.enabled) {
      NotificationService.scheduleDailyReminder(time);
    }
  };

  const exportBackupJSON = () => {
    const data = {
      words,
      stats,
      settings: notificationSettings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vocabmaster_yedek_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleReset = () => {
    StorageService.resetAllProgress();
    onWordsUpdated();
    setShowResetConfirm(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Ayarlar</h2>
        <p className="text-xs text-slate-400">Çalışma Hedefleri, Bildirimler ve Rehber</p>
      </div>

      {/* Daily Goal Picker */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Günlük Kelime Hedefi</h3>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          {[10, 20, 30, 50].map((goal) => (
            <button
              key={goal}
              onClick={() => handleGoalChange(goal)}
              className={`py-2.5 rounded-2xl font-bold border transition ${
                dailyGoal === goal
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {goal} Kelime
            </button>
          ))}
        </div>
      </div>

      {/* Leitner System Educational Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 transition-all">
        <div 
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsLeitnerInfoExpanded(!isLeitnerInfoExpanded)}
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Leitner Kutuları Nedir?</h3>
          </div>
          <button type="button" className="p-1 text-slate-400 hover:text-white">
            {isLeitnerInfoExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isLeitnerInfoExpanded && (
          <div className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800/80 animate-fadeIn">
            <p className="leading-relaxed">
              <strong>Leitner Kutuları</strong>, Alman bilim insanı Sebastian Leitner tarafından geliştirilen ve bilginin kısa süreli hafızadan <strong>uzun süreli (kalıcı) hafızaya</strong> aktarılmasını sağlayan dünyanın en etkili <strong>Aralıklı Tekrar (Spaced Repetition)</strong> sistemidir.
            </p>

            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 text-[11px]">
              <h4 className="font-bold text-indigo-400 uppercase text-[10px] tracking-wider mb-1">5 Kutu Mantığı Nasıl Çalışır?</h4>
              
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                <div>
                  <strong className="text-white">Kutu 1 (Yeni / Zor):</strong> Tüm yeni kelimeler buradan başlar. Zihninizde henüz oturmamıştır, sıklıkla tekrar edilir.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                <div>
                  <strong className="text-white">Kutu 2 (Öğreniliyor):</strong> Doğru bildiğiniz kelimeler Kutu 2'ye yükselir (2 günde bir tekrar edilir).
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                <div>
                  <strong className="text-white">Kutu 3 (Pekiştirildi):</strong> Tekrar doğru bildiğinizde Kutu 3'e geçer (5 günde bir tekrar edilir).
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                <div>
                  <strong className="text-white">Kutu 4 (İleri Düzey):</strong> Üst üste doğru bildikçe Kutu 4'e yükselir (10 günde bir tekrar edilir).
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                <div>
                  <strong className="text-white">Kutu 5 (Kalıcı Hafıza):</strong> Dördüncü kez doğru bildiğinizde Kutu 5'e ulaşır ve kelime <strong>kalıcı hafızanıza</strong> aktarılmış olur (30 günde bir kontrol edilir).
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200/90 leading-relaxed">
              <strong>⚠️ Yanlış Cevap Verilirse:</strong> Bir kelime Kutu 4'te bile olsa, yanlış cevap verdiğinizde veya "Bilmiyorum" dediğinizde <strong>otomatik olarak Kutu 1'e geri düşer</strong>. Böylece unutmaya meyilli olduğunuz kelimeler sürekli karşınıza çıkar, bildiklerinizle vakit kaybetmezsiniz.
            </div>
          </div>
        )}
      </div>

      {/* Notification Reminders */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Günlük Hatırlatıcı Bildirimler</h3>
          </div>

          <button
            onClick={handleNotificationToggle}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              notificationSettings.enabled ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                notificationSettings.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {notificationSettings.enabled && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Hatırlatma Saati:</span>
            <input
              type="time"
              value={notificationSettings.reminderTime}
              onChange={(e) => handleReminderTimeChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Backup & Reset Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white mb-1">Veri Yönetimi & Yedekleme</h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportBackupJSON}
            className="py-2.5 px-3 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium flex items-center justify-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Yedek İndir (JSON)</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="py-2.5 px-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 font-medium flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>İlerlemeyi Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center text-slate-100 shadow-2xl">
            <h3 className="font-bold text-base text-white mb-2">Emin misiniz?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Tüm kelime öğrenme seviyeleri (Leitner kutuları) ve çalışma istatistikleri sıfırlanacaktır.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                İptal
              </button>
              <button
                onClick={handleReset}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
