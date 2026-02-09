
import React from 'react';
import { School } from '../types';

interface DashboardProps {
  followedSchools: School[];
}

const Dashboard: React.FC<DashboardProps> = ({ followedSchools }) => {
  const sortedDeadlines = [...followedSchools].sort((a, b) => 
    new Date(a.applicationEnd).getTime() - new Date(b.applicationEnd).getTime()
  );

  const upcomingDeadlines = sortedDeadlines.filter(s => {
    const days = Math.ceil((new Date(s.applicationEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return days >= 0;
  });

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-[2.5rem] p-8 mb-8 shadow-2xl relative overflow-hidden group">
      {/* Decorative background circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">申请日程提醒中心</h2>
          <p className="text-indigo-200/80 text-sm font-medium">您正在追踪的重点学校申请及面试时间线。</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 mt-6 md:mt-0 text-center min-w-[140px]">
          <span className="text-4xl font-black block leading-none mb-1">{followedSchools.length}</span>
          <p className="text-[10px] uppercase font-black tracking-widest text-indigo-300">已追踪学校</p>
        </div>
      </div>

      {followedSchools.length === 0 ? (
        <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10 border-dashed relative z-10">
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-indigo-100 font-bold mb-2">尚未追踪任何学校</p>
          <p className="text-indigo-200/60 text-xs">点击下方学校列表中的“追踪日程”按钮，即可在此处查看倒计时提醒。</p>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {upcomingDeadlines.length > 0 ? upcomingDeadlines.slice(0, 5).map(school => {
             const daysLeft = Math.ceil((new Date(school.applicationEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
             return (
              <div key={school.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between group/item hover:bg-white/15 transition-all border border-white/5 hover:border-white/10">
                <div className="flex items-center space-x-5">
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black ${daysLeft < 7 ? 'bg-rose-500 shadow-lg shadow-rose-900/20' : 'bg-white/10'}`}>
                    <span className="text-[10px] uppercase leading-none mb-1">{new Date(school.applicationEnd).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg leading-none">{new Date(school.applicationEnd).getDate()}</span>
                  </div>
                  <div>
                    <p className="font-black text-white group-hover/item:text-indigo-200 transition-colors">{school.nameZh}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">截止日期: {school.applicationEnd}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${daysLeft < 7 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {daysLeft} 天后截止
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">面试窗口</p>
                  <span className="text-xs font-bold px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/20">
                    {school.interviewDate}
                  </span>
                </div>
              </div>
             );
          }) : (
            <p className="text-center py-8 text-indigo-300 italic">所有追踪的学校申请已截止。</p>
          )}
          
          {upcomingDeadlines.length > 5 && (
            <p className="text-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] pt-2">
              还有 {upcomingDeadlines.length - 5} 个待处理申请
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
