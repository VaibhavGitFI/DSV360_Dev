import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Sparkles, Loader2 } from 'lucide-react';

const StatsPanel = ({ teams, projects, onAnalyze, isAnalyzing, analysisResult }) => {
  
  const data = teams.map((team) => {
    const teamProjects = projects.filter((p) => p.teamId === team.id);
    const revenue = teamProjects.reduce((sum, p) => sum + p.revenue, 0);
    return {
      name: team.name,
      revenue,
      projects: teamProjects.length,
      color: team.color
    };
  });

  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getColorHex = (colorName) => {
    const map = {
      blue: '#3b82f6',
      emerald: '#10b981',
      violet: '#8b5cf6'
    };
    return map[colorName] || '#cbd5e1';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      
      <div className="mb-6">
        <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">
          Total Projected Profit
        </h2>
        <div className="text-4xl font-black text-slate-800">
          ${totalRevenue.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 h-64">
        
        {/* Bar Chart */}
        <div className="h-full w-full">
          <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Revenue by Team</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={getColorHex(entry.color)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="h-full w-full">
          <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="projects"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={getColorHex(entry.color)} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* AI Advisor Section */}
      <div className="mt-auto border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            AI Advisor
          </h3>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Allocation'}
          </button>
        </div>

        {analysisResult ? (
          <div className="bg-slate-50 rounded-xl p-4 text-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">Efficiency Score</span>
              <span
                className={`font-bold ${
                  analysisResult.efficiencyScore > 80 ? 'text-green-600' : 'text-orange-500'
                }`}
              >
                {analysisResult.efficiencyScore}/100
              </span>
            </div>

            <p className="text-slate-600 mb-3">{analysisResult.summary}</p>

            <ul className="space-y-1">
              {analysisResult.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-500 text-xs">
                  <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm py-4">
            Ask Gemini to analyze your current workload and revenue distribution.
          </div>
        )}
      </div>

    </div>
  );
};

export default StatsPanel;
