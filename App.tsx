
import React, { useState, useEffect, useMemo } from 'react';
import { HK_SCHOOLS } from './data/schools';
import { School, Curriculum, SchoolType, ApplicationStatus } from './types';
import SchoolCard from './components/SchoolCard';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import SchoolForm from './components/SchoolForm';
import ComparisonDrawer from './components/ComparisonDrawer';
import DistrictExplorer from './components/DistrictExplorer';
import { monitorSchoolAdmissions } from './services/geminiService';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [customSchools, setCustomSchools] = useState<School[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [monitoredIds, setMonitoredIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, ApplicationStatus>>({});
  const [schoolNotes, setSchoolNotes] = useState<Record<string, string>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'district'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | Curriculum>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rank' | 'deadline'>('rank');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const savedFollowed = localStorage.getItem('hk_followed_schools');
    if (savedFollowed) setFollowedIds(JSON.parse(savedFollowed));

    const savedMonitored = localStorage.getItem('hk_monitored_schools');
    if (savedMonitored) setMonitoredIds(JSON.parse(savedMonitored));

    const savedCustom = localStorage.getItem('hk_custom_schools');
    if (savedCustom) setCustomSchools(JSON.parse(savedCustom));

    const savedProgress = localStorage.getItem('hk_school_progress');
    if (savedProgress) setProgress(JSON.parse(savedProgress));

    const savedNotes = localStorage.getItem('hk_school_notes');
    if (savedNotes) setSchoolNotes(JSON.parse(savedNotes));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allSchools = useMemo(() => {
    return [...HK_SCHOOLS, ...customSchools];
  }, [customSchools]);

  // Cleaner for sync logs
  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '');
  };

  const toggleFollow = (id: string) => {
    const isNowFollowing = !followedIds.includes(id);
    const updated = isNowFollowing ? [...followedIds, id] : followedIds.filter(fid => fid !== id);
    setFollowedIds(updated);
    localStorage.setItem('hk_followed_schools', JSON.stringify(updated));
    if (isNowFollowing && !progress[id]) updateProgress(id, 'planning');
  };

  const toggleMonitor = (id: string) => {
    const updated = monitoredIds.includes(id) 
      ? monitoredIds.filter(mid => mid !== id)
      : [...monitoredIds, id];
    setMonitoredIds(updated);
    localStorage.setItem('hk_monitored_schools', JSON.stringify(updated));
  };

  const updateProgress = (id: string, status: ApplicationStatus) => {
    const newProgress = { ...progress, [id]: status };
    setProgress(newProgress);
    localStorage.setItem('hk_school_progress', JSON.stringify(newProgress));
  };

  const updateNote = (id: string, note: string) => {
    const newNotes = { ...schoolNotes, [id]: note };
    setSchoolNotes(newNotes);
    localStorage.setItem('hk_school_notes', JSON.stringify(newNotes));
  };

  const handleGlobalSync = async () => {
    if (monitoredIds.length === 0) {
      alert("请先在学校卡片上开启‘官网监控’开关。");
      return;
    }
    setIsSyncing(true);
    const monitoredSchools = allSchools.filter(s => monitoredIds.includes(s.id));
    const names = monitoredSchools.map(s => s.nameZh);
    
    const result = await monitorSchoolAdmissions(names);
    setSyncLog(result ? cleanMarkdown(result) : "监控同步未发现明显更新。");
    setIsSyncing(false);
  };

  const filteredSchools = useMemo(() => {
    let result = [...allSchools];
    if (activeTab !== 'All') result = result.filter(school => school.curriculum.includes(activeTab as Curriculum));
    if (selectedType !== 'All') result = result.filter(school => school.type === selectedType);
    if (selectedDistrict !== 'All' && viewMode === 'list') result = result.filter(school => school.district === selectedDistrict);
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(school => 
        school.name.toLowerCase().includes(lowerSearch) || 
        school.nameZh.includes(searchTerm) ||
        school.district.toLowerCase().includes(lowerSearch)
      );
    }
    if (sortBy === 'rank') result.sort((a, b) => a.ranking - b.ranking);
    else result.sort((a, b) => new Date(a.applicationEnd).getTime() - new Date(b.applicationEnd).getTime());
    return result;
  }, [allSchools, activeTab, searchTerm, selectedType, selectedDistrict, sortBy, viewMode]);

  const followedSchools = allSchools.filter(s => followedIds.includes(s.id));
  const comparedSchools = allSchools.filter(s => compareIds.includes(s.id));

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 transition-all duration-300">
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform">H</div>
            <h1 className={`text-xl font-extrabold tracking-tight uppercase hidden sm:block ${isScrolled ? 'text-slate-800' : 'text-slate-900'}`}>HK Primary <span className="text-indigo-600">Navigator</span></h1>
          </div>
          
          <div className="flex items-center gap-4 flex-1 justify-end max-w-3xl">
            <div className="relative flex-1 max-w-md hidden md:block group">
              <input 
                type="text" 
                placeholder="🔍 输入学校中文或英文名称直接搜索..."
                className="bg-slate-200/50 hover:bg-slate-200 border-2 border-transparent rounded-2xl px-5 py-2.5 text-sm w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/20 focus:bg-white outline-none font-bold transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={handleGlobalSync}
              disabled={isSyncing}
              className={`bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-emerald-700 shadow-lg transition-all ${isSyncing ? 'animate-pulse' : ''}`}
            >
              {isSyncing ? '同步官网动态...' : '🚀 官网监控同步'}
            </button>
            <button onClick={() => setIsFormOpen(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">+ 新增</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-32">
        {syncLog && (
          <div className="mb-8 bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] animate-fadeIn relative">
            <button onClick={() => setSyncLog(null)} className="absolute top-4 right-4 text-emerald-400 hover:text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              监控报告 (官网动态)
            </h4>
            <div className="text-xs text-emerald-700 leading-relaxed whitespace-pre-wrap font-medium">
              {syncLog}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <Dashboard followedSchools={followedSchools} progress={progress} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex overflow-x-auto shadow-sm no-scrollbar">
                {['All', ...Object.values(Curriculum)].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {tab === 'All' ? '全港综合' : tab}
                  </button>
                ))}
              </div>
              
              <div className="md:hidden">
                 <input 
                  type="text" 
                  placeholder="搜索学校..."
                  className="bg-white border border-slate-200 rounded-2xl px-5 py-2.5 text-sm w-full outline-none font-bold shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 animate-fadeIn">
              {filteredSchools.length > 0 ? (
                filteredSchools.map(school => (
                  <SchoolCard 
                    key={school.id} 
                    school={school} 
                    isFollowing={followedIds.includes(school.id)} 
                    isMonitored={monitoredIds.includes(school.id)}
                    isComparing={compareIds.includes(school.id)} 
                    currentStatus={progress[school.id]} 
                    note={schoolNotes[school.id] || ''}
                    onFollow={toggleFollow} 
                    onMonitor={toggleMonitor}
                    onCompare={(id) => setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} 
                    onUpdateStatus={updateProgress} 
                    onUpdateNote={updateNote}
                  />
                ))
              ) : (
                <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <h3 className="text-slate-800 font-black text-lg">未找到匹配的学校</h3>
                  <p className="text-slate-400 text-sm mt-1">请尝试更换关键词，或者点击右上角“新增”自行添加。</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full mr-3 shadow-lg shadow-indigo-200"></span>
                    AI 监控顾问
                  </h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black">ACTIVE</span>
                </div>
                <AIAssistant schools={allSchools} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ComparisonDrawer comparedSchools={comparedSchools} onRemove={(id) => setCompareIds(prev => prev.filter(i => i !== id))} />
      {isFormOpen && <SchoolForm onClose={() => setIsFormOpen(false)} onSubmit={(s) => { setCustomSchools([...customSchools, s]); setIsFormOpen(false); }} existingRankCount={allSchools.length} />}
    </div>
  );
};

export default App;
