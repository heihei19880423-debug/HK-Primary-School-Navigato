
import React, { useState, useEffect, useMemo } from 'react';
import { HK_SCHOOLS } from './data/schools';
import { School, Curriculum, SchoolType } from './types';
import SchoolCard from './components/SchoolCard';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import SchoolForm from './components/SchoolForm';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [customSchools, setCustomSchools] = useState<School[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | Curriculum>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rank' | 'deadline'>('rank');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load followed and custom data from local storage
  useEffect(() => {
    const savedFollowed = localStorage.getItem('hk_followed_schools');
    if (savedFollowed) setFollowedIds(JSON.parse(savedFollowed));

    const savedCustom = localStorage.getItem('hk_custom_schools');
    if (savedCustom) setCustomSchools(JSON.parse(savedCustom));
  }, []);

  const allSchools = useMemo(() => {
    return [...HK_SCHOOLS, ...customSchools];
  }, [customSchools]);

  const toggleFollow = (id: string) => {
    const updated = followedIds.includes(id) 
      ? followedIds.filter(fid => fid !== id)
      : [...followedIds, id];
    setFollowedIds(updated);
    localStorage.setItem('hk_followed_schools', JSON.stringify(updated));
  };

  const handleAddSchool = (newSchool: School) => {
    const updated = [...customSchools, newSchool];
    setCustomSchools(updated);
    localStorage.setItem('hk_custom_schools', JSON.stringify(updated));
    setIsFormOpen(false);
  };

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    allSchools.forEach(s => s.language.forEach(l => langs.add(l)));
    return Array.from(langs).sort();
  }, [allSchools]);

  const allDistricts = useMemo(() => {
    const districts = new Set<string>();
    allSchools.forEach(s => districts.add(s.district));
    return Array.from(districts).sort();
  }, [allSchools]);

  const filteredSchools = useMemo(() => {
    let result = [...allSchools];
    
    if (activeTab !== 'All') {
      result = result.filter(school => school.curriculum.includes(activeTab as Curriculum));
    }
    if (selectedType !== 'All') {
      result = result.filter(school => school.type === selectedType);
    }
    if (selectedLanguage !== 'All') {
      result = result.filter(school => school.language.includes(selectedLanguage));
    }
    if (selectedDistrict !== 'All') {
      result = result.filter(school => school.district === selectedDistrict);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(school => 
        school.name.toLowerCase().includes(lowerSearch) || 
        school.nameZh.includes(searchTerm) ||
        school.location.toLowerCase().includes(lowerSearch) ||
        school.district.toLowerCase().includes(lowerSearch)
      );
    }

    if (sortBy === 'rank') {
      result.sort((a, b) => a.ranking - b.ranking);
    } else {
      result.sort((a, b) => new Date(a.applicationEnd).getTime() - new Date(b.applicationEnd).getTime());
    }

    return result;
  }, [allSchools, activeTab, searchTerm, selectedType, selectedLanguage, selectedDistrict, sortBy]);

  const followedSchools = allSchools.filter(s => followedIds.includes(s.id));

  const handleExportToExcel = () => {
    const exportData = filteredSchools.map(school => ({
      '排名 (Rank)': school.ranking,
      '校名 (Name)': school.name,
      '中文名 (ZH Name)': school.nameZh,
      '区域 (District)': school.district,
      '学费 (Tuition)': school.tuitionFee,
      '课程 (Curriculum)': school.curriculum.join(', '),
      '教学语言 (Language)': school.language.join(', '),
      '截止日期 (Deadline)': school.applicationEnd,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HK_Schools");
    XLSX.writeFile(workbook, `HK_Primary_Rankings_${new Date().toLocaleDateString()}.xlsx`);
  };

  const tabs = [
    { id: 'All', label: '全部学校' },
    { id: Curriculum.DSE, label: 'DSE' },
    { id: Curriculum.IB, label: 'IB (IP)' },
    { id: Curriculum.AP, label: 'AP' },
    { id: Curriculum.British, label: 'British' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12 transition-all duration-300">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">H</div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase hidden sm:block">HK Primary <span className="text-indigo-600">Navigator</span></h1>
          </div>
          
          <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">
            <div className="relative flex-1 hidden md:block">
              <input 
                type="text" 
                placeholder="搜索校名、地区..."
                className="bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex-none bg-indigo-600 text-white px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              添加学校
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Dashboard followedSchools={followedSchools} />

            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex overflow-x-auto no-scrollbar shadow-sm">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-none px-6 py-3 text-xs font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-wider ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 items-end bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sort 排序方式</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="rank">按综合排名排序</option>
                  <option value="deadline">按申请截止日期</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">District 区域</span>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="All">所有全港地区</option>
                  {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Type 学校类型</span>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="All">所有类型</option>
                  {Object.values(SchoolType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3 ml-auto pt-4 sm:pt-0">
                <button onClick={handleExportToExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all hover:-translate-y-0.5">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
                   导出 EXCEL
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                共找到 <span className="text-indigo-600">{filteredSchools.length}</span> 所匹配学校
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredSchools.map(school => (
                <SchoolCard 
                  key={school.id} 
                  school={school} 
                  isFollowing={followedIds.includes(school.id)}
                  onFollow={toggleFollow}
                  showCategoryRank={activeTab !== 'All'}
                  isCustom={customSchools.some(s => s.id === school.id)}
                />
              ))}
              
              {filteredSchools.length === 0 && (
                <div className="bg-white rounded-3xl p-16 border border-dashed border-slate-200 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <p className="text-slate-500 font-bold">没有搜索到符合条件的学校。</p>
                  <button onClick={() => {setSearchTerm(''); setActiveTab('All'); setSelectedDistrict('All'); setSelectedType('All');}} className="mt-4 text-indigo-600 font-black text-xs uppercase hover:underline">清除所有筛选</button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-24">
               <h3 className="font-black text-slate-800 text-sm mb-6 uppercase tracking-[0.2em] flex items-center">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full mr-3"></span>
                AI 升学顾问
              </h3>
              <AIAssistant schools={allSchools} />
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">关于本排名</p>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  此排名综合考虑了学校的学术声誉、设施、师生比例及升中表现，旨在为家长提供参考。具体选择应结合孩子性格与家庭需求。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <SchoolForm 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleAddSchool}
          existingRankCount={allSchools.length}
        />
      )}
    </div>
  );
};

export default App;
