import React, { useState } from 'react';
import { Word, WordCategory, PartOfSpeech } from '../types/vocab';
import { StorageService } from '../services/storage';
import { Search, Plus, Upload, Download, X, Volume2 } from 'lucide-react';

interface LibraryModeProps {
  words: Word[];
  onWordsUpdated: () => void;
}

export const LibraryMode: React.FC<LibraryModeProps> = ({ words, onWordsUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBox, setSelectedBox] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // New Word Form State
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newCategory, setNewCategory] = useState<WordCategory>('Özel Yüklenenler');
  const [newPart, setNewPart] = useState<PartOfSpeech>('noun');
  const [newExampleEn, setNewExampleEn] = useState('');
  const [newExampleTr, setNewExampleTr] = useState('');

  // Import File State
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const filteredWords = words.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || w.category === selectedCategory;
    const matchesBox = selectedBox === 'ALL' || String(w.leitnerBox) === selectedBox;

    return matchesSearch && matchesCategory && matchesBox;
  });

  const handleAddWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newTranslation.trim()) return;

    StorageService.addWord({
      word: newWord.trim(),
      translation: newTranslation.trim(),
      category: newCategory,
      partOfSpeech: newPart,
      exampleEn: newExampleEn.trim() || undefined,
      exampleTr: newExampleTr.trim() || undefined
    });

    onWordsUpdated();
    setShowAddModal(false);
    setNewWord('');
    setNewTranslation('');
    setNewExampleEn('');
    setNewExampleTr('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
      if (file.name.endsWith('.json')) {
        setImportFormat('json');
      } else {
        setImportFormat('csv');
      }
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!importText.trim()) return;

    const res = StorageService.importWordsFromCSVOrJSON(importText, importFormat);
    onWordsUpdated();
    setImportStatus(`${res.added} adet kelime başarıyla eklendi! (${res.errors} hatalı satır atlandı)`);
    setTimeout(() => {
      setImportStatus(null);
      setShowImportModal(false);
      setImportText('');
    }, 2000);
  };

  const downloadSampleCSV = () => {
    const sample = `Word,Translation,PartOfSpeech,Category,ExampleEn,ExampleTr
reluctant,isteksiz,adjective,Önemli Sıfatlar,He was reluctant to sign.,İmzalamada isteksizdi.
meticulous,titiz,adjective,Akademik Kelimeler,She is meticulous with details.,Detaylar konusunda titizdir.
bring about,sebep olmak,phrasal,Phrasal Verbs,Innovations bring about changes.,Yenilikler değişikliklere yol açar.`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ornek_kelime_arsivi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      {/* Header & Quick Action Buttons */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Kelime Bankası</h2>
          <p className="text-xs text-slate-400">Toplam {words.length} Kelime Kayıtlı</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 active:scale-95 transition"
            title="CSV / JSON Yükle"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ekle</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="İngilizce veya Türkçe kelime ara..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Horizontal Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">Tüm Kategoriler ({words.length})</option>
          <option value="Önemli İsimler">📁 Önemli İsimler</option>
          <option value="Önemli Fiiller">📁 Önemli Fiiller</option>
          <option value="Önemli Sıfatlar">📁 Önemli Sıfatlar</option>
          <option value="Önemli Zarflar">📁 Önemli Zarflar</option>
          <option value="Phrasal Verbs">📁 Phrasal Verbs</option>
          <option value="Önemli Bağlaçlar">📁 Önemli Bağlaçlar</option>
          <option value="Edat Öbekleri">📁 Edat Öbekleri</option>
          <option value="Özel Yüklenenler">Özel Yüklenenler</option>
        </select>

        <select
          value={selectedBox}
          onChange={(e) => setSelectedBox(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">Tüm Leitner Kutuları</option>
          <option value="1">Kutu 1 (Yeni/Zor)</option>
          <option value="2">Kutu 2</option>
          <option value="3">Kutu 3</option>
          <option value="4">Kutu 4</option>
          <option value="5">Kutu 5 (Tam Öğrenildi)</option>
        </select>
      </div>

      {/* Word List */}
      <div className="space-y-2.5">
        {filteredWords.map((w) => (
          <div
            key={w.id}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-white truncate">{w.word}</span>
                <button
                  type="button"
                  onClick={() => playAudio(w.word)}
                  className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Telaffuz Dinle"
                  aria-label="Telaffuz"
                >
                  <Volume2 className="w-3 h-3 text-indigo-400" />
                </button>
                <span className="text-[10px] px-2 py-0.2 rounded-md bg-slate-800 text-slate-400 uppercase font-mono">
                  {w.partOfSpeech}
                </span>
              </div>

              <p className="text-xs text-emerald-400 font-medium truncate">{w.translation}</p>

              {w.exampleEn && (
                <p className="text-[11px] text-slate-400 italic truncate mt-1">"{w.exampleEn}"</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                w.leitnerBox === 5
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                Kutu {w.leitnerBox}
              </span>

              <span className="text-[10px] text-slate-500 font-mono">
                {w.timesCorrect}/{w.timesReviewed} Doğru
              </span>
            </div>
          </div>
        ))}

        {filteredWords.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            Aradığınız kriterlere uygun kelime bulunamadı.
          </div>
        )}
      </div>

      {/* Add Custom Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-base text-white mb-4">Yeni Kelime Ekle</h3>

            <form onSubmit={handleAddWordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">İngilizce Kelime *</label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="örn: meticulous"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Türkçe Karşılığı *</label>
                <input
                  type="text"
                  required
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder="örn: titiz, çok dikkatli"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Kelime Türü</label>
                  <select
                    value={newPart}
                    onChange={(e) => setNewPart(e.target.value as PartOfSpeech)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="noun">Isim (Noun)</option>
                    <option value="verb">Fiil (Verb)</option>
                    <option value="adjective">Sıfat (Adjective)</option>
                    <option value="adverb">Zarf (Adverb)</option>
                    <option value="phrasal">Phrasal Verb</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as WordCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="Önemli İsimler">Önemli İsimler</option>
                    <option value="Önemli Fiiller">Önemli Fiiller</option>
                    <option value="Önemli Sıfatlar">Önemli Sıfatlar</option>
                    <option value="Önemli Zarflar">Önemli Zarflar</option>
                    <option value="Phrasal Verbs">Phrasal Verbs</option>
                    <option value="Önemli Bağlaçlar">Önemli Bağlaçlar</option>
                    <option value="Edat Öbekleri">Edat Öbekleri</option>
                    <option value="Akademik Kelimeler">Akademik Kelimeler</option>
                    <option value="Özel Yüklenenler">Özel Yüklenenler</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">İngilizce Örnek Cümle (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={newExampleEn}
                  onChange={(e) => setNewExampleEn(e.target.value)}
                  placeholder="örn: She is meticulous about her work."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
              >
                Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSV / JSON Import Archive Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-base text-white mb-1">5000+ Kelimelik Arşiv Yükle</h3>
            <p className="text-xs text-slate-400 mb-4">
              CSV veya JSON dosyanızı seçin veya metin alanına yapıştırın.
            </p>

            <div className="space-y-3 text-xs mb-4">
              <button
                onClick={downloadSampleCSV}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-medium border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Örnek CSV Şablonunu İndir</span>
              </button>

              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center hover:border-indigo-500/50 transition">
                <input
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
                  <span className="font-semibold text-white block">Dosya Seç (CSV veya JSON)</span>
                  <span className="text-[10px] text-slate-500">5000+ kelimeye kadar desteklenir</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Veya Metin Olarak Yapıştırın:</label>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Word,Translation&#10;abandon,terk etmek&#10;abundant,bol"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {importStatus && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium text-center">
                  {importStatus}
                </div>
              )}

              <button
                onClick={handleProcessImport}
                disabled={!importText.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold transition disabled:opacity-50"
              >
                İçeri Aktar ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
