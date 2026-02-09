
import React from 'react';
import { School, ApplicationStatus } from '../types';

interface DashboardProps {
  followedSchools: School[];
  progress: Record<string, ApplicationStatus>;
}

const Dashboard: React.FC<DashboardProps> = ({ followedSchools, progress }) => {
  const sortedDeadlines = [...followedSchools].sort((a, b) => 
    new Date(a.applicationEnd).getTime() - new Date(b.applicationEnd).getTime()
  );

  const upcoming = sortedDeadlines.filter(s => {
    const days = Math.ceil((new Date(s.applicationEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return days >= 0;
  });

  // Fix: Explicitly cast Object.values(progress) to ApplicationStatus[] to resolve "Type 'unknown' cannot be used as an index type" error on line 21.
  const stats = (Object.values(progress) as ApplicationStatus[]).reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const funnelStages: { key: ApplicationStatus; label: string; color: string }[] = [
    { key: 'planning', label: '规划中', color: 'bg-slate-400' },
    { key: 'applied', label: '已递交', color: 'bg-indigo-400' },
    { key: 'interviewing', label: '面试', color: 'bg-amber-400' },
    { key: 'accepted', label: '录取', color: 'bg-emerald-400' },
  ];

  return (
    <div className="bg-[#0F172A] text-white rounded-[2.5rem] p-8 mb-8 shadow-2xl relative overflow-hidden group border border-white/5">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 relative z-10 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">升学进度仪表盘</h2>
          <p className="text-slate-400 text-sm font-medium max-w-sm">
            实时追踪您心仪学校的申请漏斗，把握每一个关键时间节点。
          </p>
        </div>
        
        <div className="flex-1 w-full md:max-w-xs">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">进度漏斗 (Funnel)</span>
            <span className="text-[10px] font-black text-indigo-400">{followedSchools.length} 所学校</span>
          </div>
          <div className="flex h-3 w-full rounded-full bg-white/5 overflow-hidden gap-0.5">
            {funnelStages.map(stage => {
              const count = stats[stage.key] || 0;
              const width = followedSchools.length > 0 ? (count / followedSchools.length) * 100 : 0;
              return (
                <div 
                  key={stage.key}
                  style={{ width: `${width}%` }}
                  className={`${stage.color} h-full transition-all duration-1000 ease-out`}
                  title={`${stage.label}: ${count}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
             {funnelStages.map(stage => (
               <div key={stage.key} className="flex flex-col items-center">
                 <span className="text-[9px] font-bold text-slate-500">{stage.label}</span>
                 <span className="text-xs font-black">{stats[stage.key] || 0}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">紧迫日程 (Deadlines)</h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">倒计时</span>
          </div>
          <div className="space-y-3">
            {upcoming.length > 0 ? upcoming.slice(0, 2).map(school => (
              <div key={school.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center border border-white/5">
                  <span className="text-[8px] font-bold text-slate-400">{new Date(school.applicationEnd).getDate()}</span>
                  <span className="text-[10px] font-black">{new Date(school.applicationEnd).toLocaleDateString('zh-CN', {month: 'short'})}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{school.nameZh}</p>
                  <p className="text-[10px] text-slate-500 font-medium">截止: {school.applicationEnd}</p>
                </div>
                <span className="text-[10px] font-black text-rose-400">
                  {Math.ceil((new Date(school.applicationEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d
                </span>
              </div>
            )) : <p className="text-xs text-slate-500 italic py-2">暂无关注中的截止日期</p>}
          </div>
        </div>

        <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">面试提醒 (Interviews)</h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">窗口期</span>
          </div>
          <div className="space-y-3">
            {followedSchools.filter(s => progress[s.id] === 'interviewing').length > 0 ? 
              followedSchools.filter(s => progress[s.id] === 'interviewing').slice(0, 2).map(school => (
                <div key={school.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{school.nameZh}</p>
                    <p className="text-[10px] text-amber-200/60 font-medium">{school.interviewDate}</p>
                  </div>
                </div>
              )) : <p className="text-xs text-slate-500 italic py-2">目前没有正在面试的学校</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
