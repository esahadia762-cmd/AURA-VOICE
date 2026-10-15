import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Radio,
  Clock,
  User,
  Bot,
  AlertCircle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';

export const LiveCallsTab: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const {
    assistants,
    activeCalls,
    initiateTestCall,
    endActiveCall,
    isVapiConnected,
  } = useData();

  const userOrgId = user?.organizationId;
  const orgAssistants = isSuperAdmin && !userOrgId
    ? assistants
    : assistants.filter((a) => a.assignedOrgId === userOrgId);

  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(
    orgAssistants[0]?.id || ''
  );
  const [isMuted, setIsMuted] = useState(false);
  const [callerName, setCallerName] = useState('Browser Audio Caller');
  const [callStarting, setCallStarting] = useState(false);
  const [liveDuration, setLiveDuration] = useState(0);

  // Active call reference
  const currentLiveCall = activeCalls[0];

  useEffect(() => {
    if (!selectedAssistantId && orgAssistants.length > 0) {
      setSelectedAssistantId(orgAssistants[0].id);
    }
  }, [orgAssistants, selectedAssistantId]);

  // Duration timer
  useEffect(() => {
    let interval: any;
    if (currentLiveCall) {
      interval = setInterval(() => {
        setLiveDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setLiveDuration(0);
    }
    return () => clearInterval(interval);
  }, [currentLiveCall]);

  const handleStartTestCall = async () => {
    if (!selectedAssistantId) return;
    setCallStarting(true);
    await initiateTestCall(selectedAssistantId);
    setCallStarting(false);
  };

  const handleEndCall = () => {
    if (currentLiveCall) {
      endActiveCall(currentLiveCall.id);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Live Calls & WebRTC Testing</h2>
          <p className="text-xs text-slate-400">
            Real-time telephone streams, live transcript monitoring, and browser audio test calling.
          </p>
        </div>

        {/* Live Call Count Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <Radio className={`w-3.5 h-3.5 ${activeCalls.length > 0 ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-white tabular-nums">{activeCalls.length}</span>
            <span className="text-slate-400">Active Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Audio Console */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            {/* Console Header */}
            <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${currentLiveCall ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {currentLiveCall ? currentLiveCall.assistantName : 'Voice Test Console'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {currentLiveCall ? `Channel ID: ${currentLiveCall.id}` : 'WebRTC Audio Channel Ready'}
                  </div>
                </div>
              </div>

              {currentLiveCall && (
                <div className="flex items-center gap-2 font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-md text-xs font-bold border border-cyan-800/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{formatTimer(liveDuration)}</span>
                </div>
              )}
            </div>

            {/* Audio Visualization / Status Area */}
            <div className="p-8 flex flex-col items-center justify-center min-h-[260px] bg-gradient-to-b from-slate-950 to-slate-900 space-y-6">
              {currentLiveCall ? (
                <>
                  <div className="relative">
                    {/* Glowing pulse rings */}
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                    <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-2xl shadow-cyan-500/40 relative z-10">
                      <Mic className="w-10 h-10 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <div className="text-base font-bold text-white">Live Call in Progress</div>
                    <div className="text-xs text-slate-400">
                      Streaming audio with sub-second turnaround
                    </div>
                  </div>

                  {/* Frequency bars */}
                  <div className="flex items-center gap-1.5 h-12">
                    {[30, 60, 90, 45, 80, 25, 95, 70, 40, 85, 30, 65, 90, 50, 75, 35].map((val, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-cyan-500 to-sky-300 rounded-full animate-pulse transition-all"
                        style={{ height: `${Math.max(20, (val * (i % 2 === 0 ? 1 : 0.8)))}%` }}
                      />
                    ))}
                  </div>

                  {/* Interactive Call Controls */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3.5 rounded-full border transition-all ${
                        isMuted
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                      }`}
                      title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={handleEndCall}
                      className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End Live Call</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                    <PhoneCall className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">No Active Calls</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Start a browser test call or wait for inbound customer calls to connect to your phone numbers.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Live Transcript Stream */}
            <div className="border-t border-slate-800 p-6 bg-slate-950/60 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Real-Time Transcript</span>
                {currentLiveCall && <span className="text-cyan-400">Syncing with Vapi WebRTC</span>}
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 text-xs font-mono space-y-2 max-h-40 overflow-y-auto">
                {currentLiveCall?.transcript ? (
                  currentLiveCall.transcript.split('\n').map((line, idx) => (
                    <div key={idx} className="leading-relaxed">
                      <span className={line.startsWith('Agent:') ? 'text-cyan-400 font-semibold' : 'text-slate-300'}>
                        {line}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">
                    Live speech transcripts will generate here in real time as the caller and agent converse.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Start Browser Test Call */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Test Voice Assistant</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate a web call directly from your browser to evaluate prompts and voices.
              </p>
            </div>

            {orgAssistants.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
                <div className="text-xs text-slate-300 font-medium">No Voice Assistant Available</div>
                <p className="text-[11px] text-slate-400">
                  {isSuperAdmin
                    ? 'Sync assistants from Vapi or create client organizations first.'
                    : 'Contact your platform administrator to assign an assistant.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Select Voice Assistant
                  </label>
                  <select
                    value={selectedAssistantId}
                    onChange={(e) => setSelectedAssistantId(e.target.value)}
                    disabled={!!currentLiveCall}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-medium"
                  >
                    {orgAssistants.map((assistant) => (
                      <option key={assistant.id} value={assistant.id}>
                        {assistant.name} ({assistant.model?.model || 'gpt-4o'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Caller Identification
                  </label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    disabled={!!currentLiveCall}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="text-slate-300 font-medium">Test Call Specifications</div>
                  <div>Audio Protocol: WebRTC / Full Duplex</div>
                  <div>Microphone: Enabled with echo cancellation</div>
                </div>

                <button
                  onClick={handleStartTestCall}
                  disabled={!!currentLiveCall || callStarting}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{callStarting ? 'Connecting...' : 'Launch Browser Test Call'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
