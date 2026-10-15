import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, Clock, DollarSign, PhoneCall, TrendingUp, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';

export const AnalyticsTab: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { calls, assistants } = useData();

  const userOrgId = user?.organizationId;
  const orgCalls = isSuperAdmin && !userOrgId
    ? calls
    : calls.filter((c) => !userOrgId || c.organizationId === userOrgId);

  const totalCalls = orgCalls.length;
  const totalSeconds = orgCalls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const avgDuration = totalCalls > 0 ? Math.round(totalSeconds / totalCalls) : 0;
  const totalCost = orgCalls.reduce((acc, c) => acc + (c.cost || 0), 0);

  // Group calls by date for chart
  const callsByDay: Record<string, { date: string; calls: number; durationMinutes: number }> = {};
  orgCalls.forEach((call) => {
    const day = call.startedAt
      ? new Date(call.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
      : 'Today';
    if (!callsByDay[day]) {
      callsByDay[day] = { date: day, calls: 0, durationMinutes: 0 };
    }
    callsByDay[day].calls += 1;
    callsByDay[day].durationMinutes += Math.round((call.durationSeconds || 0) / 60);
  });
  const chartData = Object.values(callsByDay);

  // Outcome distribution
  const webCallsCount = orgCalls.filter((c) => c.type === 'webCall').length;
  const inboundCount = orgCalls.filter((c) => c.type === 'inboundPhoneCall').length;
  const outboundCount = orgCalls.filter((c) => c.type === 'outboundPhoneCall').length;

  const distributionData = [
    { name: 'Web Calls', value: webCallsCount, color: '#06B6D4' },
    { name: 'Inbound Phone', value: inboundCount, color: '#3B82F6' },
    { name: 'Outbound Calls', value: outboundCount, color: '#10B981' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Analytics & Usage Telemetry</h2>
        <p className="text-xs text-slate-400">
          Aggregated call durations, channel breakdowns, and operational metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Calls</span>
            <PhoneCall className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalCalls}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Logged conversations</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Talk Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {Math.round(totalSeconds / 60)} <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">{totalSeconds} total seconds</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Average Duration</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {avgDuration} <span className="text-sm font-normal text-slate-400">sec</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Per session benchmark</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Estimated Vapi Cost</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            ${totalCost.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Voice & LLM tokens</div>
        </div>
      </div>

      {totalCalls === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Telemetry Data Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once calls are processed by your assistants, time series call volume charts and channel distribution graphics will display here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Bar Chart */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">Call Volume Over Time</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.length > 0 ? chartData : [{ date: 'Today', calls: totalCalls, durationMinutes: 0 }]}>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="calls" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">Channel Distribution</h3>
            <div className="h-48 w-full flex items-center justify-center">
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={40}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1E293B',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500">No channel data</div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Web Calls</span>
                </span>
                <span className="font-mono text-white tabular-nums">{webCallsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Inbound Phone</span>
                </span>
                <span className="font-mono text-white tabular-nums">{inboundCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Outbound Calls</span>
                </span>
                <span className="font-mono text-white tabular-nums">{outboundCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
