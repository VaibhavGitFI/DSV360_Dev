import React from 'react';
import { DollarSign, GripVertical, Layout, Smartphone, Cpu, PenTool } from 'lucide-react';

const ProjectCard = ({ project, onDragStart }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'Web': return <Layout size={16} className="text-blue-500" />;
      case 'Mobile': return <Smartphone size={16} className="text-green-500" />;
      case 'AI': return <Cpu size={16} className="text-purple-500" />;
      case 'Design': return <PenTool size={16} className="text-pink-500" />;
      default: return <Layout size={16} />;
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group mb-3"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-slate-50 rounded-md group-hover:bg-slate-100 transition-colors">
            {getIcon(project.type)}
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {project.type}
          </span>
        </div>

        <GripVertical
          size={16}
          className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <h3 className="font-semibold text-slate-800 mb-1">{project.name}</h3>
      <p className="text-xs text-slate-500 mb-3 line-clamp-1">
        {project.description}
      </p>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
        <div className="flex items-center text-slate-700 font-bold">
          <DollarSign size={14} className="text-slate-400" />
          {project.revenue.toLocaleString()}
        </div>

        <div className="text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
          ID: {project.id}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
