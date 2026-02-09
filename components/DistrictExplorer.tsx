
import React from 'react';
import { School } from '../types';

interface DistrictExplorerProps {
  schools: School[];
  onSelectSchool: (s: School) => void;
}

const DistrictExplorer: React.FC<DistrictExplorerProps> = ({ schools, onSelectSchool }) => {
  const grouped = schools.reduce((acc, s) => {
    acc[s.district] = acc[s.district] || [];
    acc[s.district].push(s);
    return acc;
  }, {} as Record<string, School[]>);

  const districts = Object.keys(grouped).sort();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      {districts.map(district => (
        <div key={district} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                <h3 className="text-lg font-black text-slate-800">{district}</h3>
             </div>
             <span className="bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1 rounded-full">
               {grouped[district].length} 所学校
             </span>
          </div>
          
          <div className="space-y-3">
            {grouped[district].slice(0, 5).map(school => (
              <button 
                key={school.id}
                onClick={() => onSelectSchool(school)}
                className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{school.nameZh}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">{school.name}</p>
                </div>
                <div className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-1 rounded group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  #{school.ranking}
                </div>
              </button>
            ))}
            {grouped[district].length > 5 && (
              <button 
                onClick={() => onSelectSchool(grouped[district][0])}
                className="w-full text-center py-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                查看该区所有 {grouped[district].length} 所学校
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DistrictExplorer;
