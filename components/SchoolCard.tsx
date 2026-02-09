
import React, { useState } from 'react';
import { School } from '../types';

interface SchoolCardProps {
  school: School;
  isFollowing: boolean;
  onFollow: (id: string) => void;
  showCategoryRank?: boolean;
  isCustom?: boolean;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school, isFollowing, onFollow, showCategoryRank, isCustom }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const daysLeft = getDaysLeft(school.applicationEnd);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.name + ' ' + school.location + ' Hong Kong')}`;

  return (
    <div className={`bg-white rounded-3xl shadow-sm border ${isFollowing ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-slate-200'} overflow-hidden hover:shadow-xl transition-all duration-300`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1.5 flex-1 pr-4">
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded shadow-sm">
                RANK #{school.ranking}
              </span>
              {daysLeft > 0 ? (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm ${daysLeft < 7 ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
                  ⏳ 剩余 {daysLeft} 天
                </span>
              ) : (
                <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded">已截止</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">{school.name}</h3>
              <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
            <p className="text-base text-slate-500 font-semibold">{school.nameZh}</p>
          </div>
          <button 
            onClick={() => onFollow(school.id)}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${
              isFollowing ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
            }`}
          >
            {isFollowing ? '正在追踪' : '追踪日程'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-black">District 区域</p>
            <span className="text-xs text-indigo-600 font-bold">{school.district}</span>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-black">Tuition 学费</p>
            <p className="text-xs text-slate-900 font-black">{school.tuitionFee}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-black">Deadline 截止</p>
            <p className="text-xs text-rose-600 font-black">{school.applicationEnd}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-black">Language 语言</p>
            <p className="text-xs text-slate-700 font-bold">{school.language.join(' / ')}</p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-amber-600 font-black bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
            面试安排: {school.interviewDate}
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-black text-indigo-600 hover:underline">
            {isExpanded ? '收起指南' : '面试全攻略 →'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-6 border-t border-dashed border-slate-200 bg-indigo-50/30 -mx-6 px-6 pb-6 animate-fadeIn">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-indigo-700 uppercase font-black">核心能力要求</p>
                  <p className="text-sm text-slate-700 bg-white p-4 rounded-2xl border border-indigo-100 leading-relaxed">{school.interviewRequirements}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-emerald-700 uppercase font-black">历年面试心得</p>
                  <p className="text-sm text-slate-700 bg-white p-4 rounded-2xl border border-emerald-100 leading-relaxed">{school.interviewTips}</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolCard;
