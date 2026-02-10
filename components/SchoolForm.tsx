
import React, { useState } from 'react';
import { School, Curriculum, SchoolType } from '../types';
import { lookupSchoolDetails } from '../services/geminiService';

interface SchoolFormProps {
  onClose: () => void;
  onSubmit: (school: School) => void;
  existingRankCount: number;
}

const SchoolForm: React.FC<SchoolFormProps> = ({ onClose, onSubmit, existingRankCount }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameZh: '',
    location: '',
    district: '',
    tuitionFee: '',
    type: SchoolType.Private,
    curriculum: [] as Curriculum[],
    language: [] as string[],
    applicationStart: '',
    applicationEnd: '',
    interviewDate: '',
    website: '',
    description: '',
    notes: ''
  });

  const handleAISearch = async () => {
    const nameToSearch = formData.name || formData.nameZh;
    if (!nameToSearch) {
      alert("请先输入学校名称以便 AI 进行检索。");
      return;
    }
    
    setLoading(true);
    const details = await lookupSchoolDetails(nameToSearch);
    
    if (details) {
      setFormData(prev => ({
        ...prev,
        ...details,
        // Ensure language is always an array
        language: Array.isArray(details.language) ? details.language : [],
        // Map curriculum string names to enum if necessary
        curriculum: Array.isArray(details.curriculum) ? details.curriculum : []
      }));
    } else {
      alert("未能在官网找到详细信息，请手动填写。");
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchool: School = {
      ...formData,
      id: `custom-${Date.now()}`,
      ranking: existingRankCount + 1,
      interviewRequirements: "请完善面试要求信息",
      interviewTips: "请完善面试建议信息"
    };
    onSubmit(newSchool);
  };

  const toggleCurriculum = (c: Curriculum) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.includes(c) 
        ? prev.curriculum.filter(item => item !== c)
        : [...prev.curriculum, c]
    }));
  };

  const languages = ["English", "Cantonese", "Putonghua", "German", "French"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800">添加新学校信息</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">输入校名后可尝试使用 AI 自动填表</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">学校名称 (中/英)</label>
                  <input 
                    placeholder="输入中文或英文校名"
                    type="text" 
                    className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" 
                    value={formData.nameZh || formData.name} 
                    onChange={e => setFormData({...formData, nameZh: e.target.value, name: e.target.value})} 
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="button"
                    onClick={handleAISearch}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap h-[46px]"
                  >
                    {loading ? (
                      <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> 正在云端检索...</>
                    ) : (
                      <>✨ AI 智能补全</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">学校英文名称</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">行政区域</label>
                <input required placeholder="例如: Kowloon City (九龍城區)" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">地理位置 (详细地址)</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">学费 (每年)</label>
                <input required placeholder="例如: HK$50,000 / yr" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.tuitionFee} onChange={e => setFormData({...formData, tuitionFee: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">课程体系 (可多选)</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Curriculum).map(c => (
                  <button key={c} type="button" onClick={() => toggleCurriculum(c)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.curriculum.includes(c) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">学校类型</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as SchoolType})}>
                  {Object.values(SchoolType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">官网地址</label>
                <input type="url" placeholder="https://" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">申请截止日期</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold" 
                  value={formData.applicationEnd} onChange={e => setFormData({...formData, applicationEnd: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">面试期</label>
                <input placeholder="例如: 10月中旬" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.interviewDate} onChange={e => setFormData({...formData, interviewDate: e.target.value})} />
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">教学语言</label>
                <div className="flex flex-wrap gap-1 mt-1">
                   {languages.map(l => (
                     <label key={l} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-[10px] cursor-pointer hover:bg-slate-200">
                        <input type="checkbox" checked={formData.language.includes(l)} 
                          onChange={e => {
                            const newLangs = e.target.checked ? [...formData.language, l] : formData.language.filter(x => x !== l);
                            setFormData({...formData, language: newLangs});
                          }} />
                        {l}
                     </label>
                   ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">学校简介</label>
              <textarea 
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-medium" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all">
                确认并保存学校
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolForm;
