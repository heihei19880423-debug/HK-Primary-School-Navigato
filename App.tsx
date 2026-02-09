
import React, { useState, useEffect, useMemo } from 'react';
import { HK_SCHOOLS } from './data/schools';
import { School, Curriculum, SchoolType, ApplicationStatus } from './types';
import SchoolCard from './components/SchoolCard';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import SchoolForm from './components/SchoolForm';
import ComparisonDrawer from './components/ComparisonDrawer';
import DistrictExplorer from './components/DistrictExplorer';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [customSchools, setCustomSchools] = useState<School[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, ApplicationStatus>>({});
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

    const savedCustom = localStorage.getItem('hk_custom_schools');
    if (savedCustom) setCustomSchools(JSON.parse(savedCustom));

    const savedProgress = localStorage.getItem('hk_school_progress');
    if (savedProgress) setProgress(JSON.parse(savedProgress));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allSchools = useMemo(() => {
    return [...HK_SCHOOLS, ...customSchools];
  }, [customSchools]);

  const toggleFollow = (id: string) => {
    const isNowFollowing = !followedIds.includes(id);
    const updated = isNowFollowing ? [...followedIds, id] : followedIds.filter(fid => fid !== id);
    setFollowedIds(updated);
    localStorage.setItem('hk_followed_schools', JSON.stringify(updated));
    if (isNowFollowing && !progress[id]) updateProgress(id, 'planning');
  };

  const updateProgress = (id: string, status: ApplicationStatus) => {
    const newProgress = { ...progress, [id]: status };
    setProgress(newProgress);
    localStorage.setItem('hk_school_progress', JSON.stringify(newProgress));
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) {
        alert("最多只能同时对比 3 所学校");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleAddSchool = (newSchool: School) => {
    const updated = [...customSchools, newSchool];
    setCustomSchools(updated);
    localStorage.setItem('hk_custom_schools', JSON.stringify(updated));
    setIsFormOpen(false);
  };

  const allDistricts = useMemo(() => {
    const districts = new Set<string>();
    allSchools.forEach(s => districts.add(s.district));
    return Array.from(districts).sort();
  }, [allSchools]);

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
            <div className="relative flex-1 max-w-md hidden md:block">
              <input 
                type="text" 
                placeholder="搜索 100 所名校、区域、课程..."
                className="bg-slate-200/50 hover:bg-slate-200 border-none rounded-2xl px-5 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-4 h-4 absolute right-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/50">
               <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>列表</button>
               <button onClick={() => setViewMode('district')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${viewMode === 'district' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>区域</button>
            </div>
            <button onClick={() => setIsFormOpen(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">+ 新增</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <Dashboard followedSchools={followedSchools} progress={progress} />

            <div className="flex items-center justify-between">
               <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex overflow-x-auto shadow-sm no-scrollbar">
                {['All', ...Object.values(Curriculum)].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {tab === 'All' ? '全港综合' : tab}
                  </button>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">排序:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer">
                  <option value="rank">按全港排名</option>
                  <option value="deadline">按报名截止</option>
                </select>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 gap-6 animate-fadeIn">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">找到 {filteredSchools.length} 所学校符合条件</h3>
                   {selectedDistrict !== 'All' && (
                     <button onClick={() => setSelectedDistrict('All')} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">清除区域筛选 ×</button>
                   )}
                </div>
                {filteredSchools.map(school => (
                  <SchoolCard key={school.id} school={school} isFollowing={followedIds.includes(school.id)} isComparing={compareIds.includes(school.id)} currentStatus={progress[school.id]} onFollow={toggleFollow} onCompare={toggleCompare} onUpdateStatus={updateProgress} />
                ))}
              </div>
            ) : (
              <DistrictExplorer schools={filteredSchools} onSelectSchool={(s) => { setSearchTerm(s.nameZh); setViewMode('list'); }} />
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full mr-3 shadow-lg shadow-indigo-200"></span>
                    AI 升学智库
                  </h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black">在线联网</span>
                </div>
                <AIAssistant schools={allSchools} />
              </div>
              
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-xl">
                 <h4 className="font-black text-lg mb-2">准备好面试了吗？</h4>
                 <p className="text-white/80 text-xs leading-relaxed mb-6 font-medium">我们的 AI 顾问可以为您生成针对特定名校的模拟面试问题。</p>
                 <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl text-xs font-black shadow-lg hover:bg-slate-50 transition-all">开启模拟面试</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ComparisonDrawer comparedSchools={comparedSchools} onRemove={toggleCompare} />
      {isFormOpen && <SchoolForm onClose={() => setIsFormOpen(false)} onSubmit={handleAddSchool} existingRankCount={allSchools.length} />}
    </div>
  );
};

export default App;
