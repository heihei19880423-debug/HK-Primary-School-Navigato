
import React, { useState } from 'react';
import { School, ApplicationStatus } from '../types';

interface SchoolCardProps {
  school: School;
  isFollowing: boolean;
  isComparing: boolean;
  currentStatus?: ApplicationStatus;
  onFollow: (id: string) => void;
  onCompare: (id: string) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ 
  school, isFollowing, isComparing, currentStatus, onFollow, onCompare, onUpdateStatus 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const daysLeft = getDaysLeft(school.applicationEnd);

  const statusMap: Record<ApplicationStatus, { label: string, color: string }> = {
    planning: { label: '计划中', color: 'bg-slate-100 text-slate-600' },
    applied: { label: '已申请', color: 'bg-blue-100 text-blue-600' },
    interviewing: { label: '面试中', color: 'bg-amber-100 text-amber-600' },
    accepted: { label: '已录取', color: 'bg-emerald-100 text-emerald-600' },
    waitlisted: { label: '候补中', color: 'bg-purple-100 text-purple-600' },
    rejected: { label: '未录取', color: 'bg-rose-100 text-rose-600' },
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border transition-all duration-500 ${isFollowing ? 'border-indigo-200 ring-2 ring-indigo-50/50' : 'border-slate-200'}`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1.5 flex-1 pr-4">
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="text-[10px] font-black text-white bg-slate-900 px-2.5 py-1 rounded-lg shadow-sm">
                RANK #{school.ranking}
              </span>
              {daysLeft > 0 ? (
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${daysLeft < 7 ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-100 text-indigo-700'}`}>
                  ⏳ {daysLeft} 天截止
                </span>
              ) : (
                <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg">已截止</span>
              )}
              {isFollowing && currentStatus && (
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${statusMap[currentStatus].color}`}>
                  ● {statusMap[currentStatus].label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">{school.name}</h3>
              <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
            <p className="text-base text-slate-500 font-semibold">{school.nameZh}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onCompare(school.id)}
              className={`p-2.5 rounded-xl transition-all border ${
                isComparing ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </button>
            <button 
              onClick={() => onFollow(school.id)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${
                isFollowing ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
              }`}
            >
              {isFollowing ? '取消关注' : '关注进展'}
            </button>
          </div>
        </div>

        {isFollowing && (
          <div className="mt-5 pt-5 border-t border-slate-50 flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">申请状态:</span>
             <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                {(Object.keys(statusMap) as ApplicationStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => onUpdateStatus(school.id, status)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                      currentStatus === status 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {statusMap[status].label}
                  </button>
                ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-black">District</p>
            <span className="text-xs text-indigo-600 font-bold">{school.district}</span>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-black">Tuition</p>
            <p className="text-xs text-slate-900 font-black">{school.tuitionFee}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-black">Curriculum</p>
            <p className="text-xs text-slate-700 font-bold">{school.curriculum.join(', ')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-black">Interview</p>
            <p className="text-xs text-amber-600 font-black">{school.interviewDate}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-black text-indigo-600 flex items-center gap-1 group">
             {isExpanded ? '收起面试指南 ↑' : '面试通关秘籍 ↓'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-6 border-t border-dashed border-slate-200 animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-3 bg-indigo-500 rounded-full"></div>
                <p className="text-[10px] text-indigo-700 uppercase font-black tracking-widest">能力指标</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{school.interviewRequirements}</p>
            </div>
            <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-3 bg-emerald-500 rounded-full"></div>
                <p className="text-[10px] text-emerald-700 uppercase font-black tracking-widest">学长心得</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{school.interviewTips}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolCard;
