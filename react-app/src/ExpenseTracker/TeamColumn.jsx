import React, { useMemo } from 'react';
import ProjectCard from './ProjectCard';
import { TrendingUp, AlertCircle } from 'lucide-react';

const TeamColumn = ({ team, projects, onDrop, onDragOver, onDragStart }) => {
  
  const totalRevenue = useMemo(
    () => projects.reduce((sum, p) => sum + p.revenue, 0),
    [projects]
  );

  const isOverCapacity = projects.length > team.capacity;
  const bandwidthPercent = Math.min((projects.length / team.capacity) * 100, 100);

  const colorStyles = {
    blue: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
    emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
    violet: { border: 'border-violet-200', bg: 'bg-violet-50', text: 'text-violet-700', bar: 'bg-violet-500' },
  };

  const style = colorStyles[team.color] || colorStyles.blue;

  return (
    <div
      className={`flex-1 min-w-[300px] flex flex-col h-full rounded-2xl border ${style.border} bg-slate-50/50 backdrop-blur-sm overflow-hidden`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, team.id)}
    >
      {/* Header */}
      <div className={`p-4 border-b ${style.border} bg-white/50`}>
        <div className="flex justify-between items-center mb-2">
          <h2 className={`font-bold text-lg ${style.text}`}>{team.name}</h2>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${style.bg} ${style.text}`}>
            {projects.length} / {team.capacity} Projects
          </span>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Revenue</p>
            <div className="flex items-center gap-1 text-slate-800 font-bold text-xl">
              <TrendingUp size={18} className={style.text} />
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mt-3 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isOverCapacity ? 'bg-red-500' : style.bar
            }`}
            style={{ width: `${bandwidthPercent}%` }}
          ></div>
        </div>

        {isOverCapacity && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-red-500 font-bold animate-pulse">
            <AlertCircle size={10} /> Over Capacity
          </div>
        )}
      </div>

      {/* Project List */}
      <div className="flex-1 p-3 overflow-y-auto transition-colors duration-200 hover:bg-slate-100/50">
        {projects.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <span className="text-sm">Drop projects here</span>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TeamColumn;
