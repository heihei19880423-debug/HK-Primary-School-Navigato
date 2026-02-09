
import React, { useState } from 'react';
import { School } from '../types';

interface ComparisonDrawerProps {
  comparedSchools: School[];
  onRemove: (id: string) => void;
}

const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({ comparedSchools, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (comparedSchools.length === 0) return null;

  const features = [
    { label: '综合排名', key: 'ranking' },
    { label: '所属区域', key: 'district' },
    { label: '学校类型', key: 'type' },
    { label: '每年学费', key: 'tuitionFee' },
    { label: '课程体系', key: 'curriculum' },
    { label: '面试窗口', key: 'interviewDate' },
  ];

  return (
    <>
      {/* Floating Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-xl border border-indigo-100 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-slideUp">
        <div className="flex -space-x-3">
          {comparedSchools.map(s => (
            <div key={s.id} className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-md">
              {s.name.substring(0, 1)}
            </div>
          ))}
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">已选择对比</span>
          <span className="text-sm font-black text-slate-800 leading-none">{comparedSchools.length} / 3 所学校</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
        >
          查看横向对比
        </button>
      </div>

      {/* Comparison Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800">学校横向对比</h2>
                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">School Comparison Matrix</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-slate-50 p-3 rounded-full hover:bg-slate-100 transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-x-auto p-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-slate-50/50 rounded-tl-2xl border-b-2 border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">属性特征</span>
                    </th>
                    {comparedSchools.map(s => (
                      <th key={s.id} className="p-4 text-center bg-slate-50/50 border-b-2 border-slate-100 last:rounded-tr-2xl min-w-[200px]">
                        <div className="relative inline-block">
                          <button 
                            onClick={() => onRemove(s.id)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-md hover:scale-110 transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          <div className="text-sm font-black text-slate-800 mb-1">{s.nameZh}</div>
                          <div className="text-[10px] font-bold text-slate-400">{s.name}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((f, idx) => (
                    <tr key={f.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                      <td className="p-4 text-sm font-black text-slate-600 border-b border-slate-100">{f.label}</td>
                      {comparedSchools.map(s => (
                        <td key={s.id} className="p-4 text-center border-b border-slate-100">
                          <div className={`inline-block px-4 py-2 rounded-xl text-xs font-bold ${
                            f.key === 'ranking' ? 'bg-slate-900 text-white' : 'text-slate-700'
                          }`}>
                            {Array.isArray(s[f.key as keyof School]) 
                              ? (s[f.key as keyof School] as any[]).join(', ') 
                              : s[f.key as keyof School]}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-8 bg-indigo-600 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-xs font-bold opacity-80 leading-relaxed max-w-md">
                  提示：对比结果仅供参考。建议联系学校官方网站获取最新招生简章及学费明细。
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-2xl text-sm font-black hover:bg-slate-50 transition-all active:scale-95"
              >
                完成对比
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComparisonDrawer;
