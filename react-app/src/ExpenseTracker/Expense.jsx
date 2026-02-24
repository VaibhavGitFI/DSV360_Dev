import React, { useState, useCallback } from 'react';
import { INITIAL_PROJECTS, INITIAL_TEAMS } from './constants';
import TeamColumn from "./TeamColumn";
import ProjectCard from './ProjectCard';
import StatsPanel from './StatsPanel';
//import { analyzeAllocation } from './services/geminiService';
import { LayoutDashboard, Box } from 'lucide-react';

const Expense = () => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [teams] = useState(INITIAL_TEAMS);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const unassignedProjects = projects.filter((p) => p.teamId === null);

  const handleDragStart = (e, projectId) => {
    e.dataTransfer.setData('projectId', projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback((e, targetTeamId) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, teamId: targetTeamId };
        }
        return p;
      })
    );

    setAnalysisResult(null);
  }, []);

  const handleAnalysis = async () => {
    if (!process.env.API_KEY) {
      alert('Please set the API_KEY to use AI features.');
      return;
    }
    setIsAnalyzing(true);
    //const result = await analyzeAllocation(teams, projects);
   // setAnalysisResult(result);
    setIsAnalyzing(false);
  };

 return (
  <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-[1600px] mx-auto">

    {/* Header */}
    <header className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg text-white">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">RevenueFlow</h1>
          <p className="text-slate-500 text-sm">Strategic Project Allocation</p>
        </div>
      </div>
    </header>

    {/* ⭐ ROW 1 — StatsPanel takes full width */}
    <div className="w-full">
      <StatsPanel
        teams={teams}
        projects={projects}
        onAnalyze={handleAnalysis}
        isAnalyzing={isAnalyzing}
        analysisResult={analysisResult}
      />
    </div>

    {/* ⭐ ROW 2 — Sidebar + Teams side-by-side */}
    <div className="flex flex-1 gap-6 overflow-hidden">

      {/* Sidebar Column */}
      <div
        className="w-72 shrink-0 flex flex-col bg-slate-200/50 rounded-2xl border border-slate-200 overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
      >
        <div className="p-4 bg-slate-300/50 border-b">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <Box size={18} /> Project Backlog
          </h2>
          <span className="text-xs text-slate-500 mt-1 block">Drag to assign</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {unassignedProjects.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              All projects assigned! <br /> Great job.
            </div>
          ) : (
            unassignedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onDragStart={handleDragStart} />
            ))
          )}
        </div>
      </div>

      {/* Team Columns */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-fit pb-2">
          {teams.map((team) => (
            <TeamColumn
              key={team.id}
              team={team}
              projects={projects.filter((p) => p.teamId === team.id)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>

    </div>

  </div>
);


};

export default Expense;
