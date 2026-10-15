import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Play,
  Pause,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  FileText,
  User,
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  RefreshCw,
  Wrench,
  Calendar,
  Users,
  Database,
  PhoneForwarded,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { VapiCall, ToolCallInvocation } from '../../../types';

function formatSeconds(secs: number): string {
  if (!secs || isNaN(secs) || secs < 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface AudioPlayerProps {
  recordingUrl?: string;
  callId: string;
  onRefreshRecording: () => Promise<void>;
  isRefreshing: boolean;
}

const CallAudioPlayer: React.FC<AudioPlayerProps> = ({
  recordingUrl,
  callId,
  onRefreshRecording,
  isRefreshing,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  // Reset state when recording URL or callId changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setIsLoadingAudio(!!recordingUrl);
  }, [recordingUrl, callId]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback error:', err);
          setHasError(true);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoadingAudio(false);
      setHasError(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleDownload = () => {
    if (!recordingUrl) return;
    const anchor = document.createElement('a');
    anchor.href = recordingUrl;
    anchor.download = `recording_${callId}.wav`;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  if (!recordingUrl) {
    return (
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-400">
          <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
          <span>No audio recording available for this call record.</span>
        </div>
        <button
          onClick={onRefreshRecording}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Checking...' : 'Check for Recording'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={recordingUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setHasError(true);
          setIsLoadingAudio(false);
          setIsPlaying(false);
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">Call Audio Recording</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Link Button */}
          <button
            onClick={onRefreshRecording}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 text-xs transition-colors"
            title="Refresh recording audio URL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Download Recording Button */}
          <button
            onClick={handleDownload}
            disabled={hasError}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Download authorized audio recording"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Download</span>
          </button>
        </div>
      </div>

      {hasError ? (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Audio stream URL expired or processing.</span>
          </div>
          <button
            onClick={onRefreshRecording}
            disabled={isRefreshing}
            className="px-3 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium text-xs self-start sm:self-auto flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Audio Link</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Scrubber Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-cyan-400 tabular-nums min-w-[38px]">
              {formatSeconds(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={isLoadingAudio || duration === 0}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <span className="text-[11px] font-mono text-slate-400 tabular-nums min-w-[38px] text-right">
              {formatSeconds(duration)}
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoadingAudio}
                className="w-8 h-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Rewind to beginning */}
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    setCurrentTime(0);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                title="Rewind to start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Speed rate toggle */}
              <button
                type="button"
                onClick={cyclePlaybackRate}
                className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 hover:bg-slate-800 transition-colors"
                title="Playback speed"
              >
                {playbackRate}x
              </button>
            </div>

            {/* Volume controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hidden sm:block"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getToolIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('appoint') || lower.includes('calendar') || lower.includes('schedule')) {
    return <Calendar className="w-4 h-4 text-emerald-400" />;
  }
  if (lower.includes('crm') || lower.includes('lead') || lower.includes('customer')) {
    return <Users className="w-4 h-4 text-blue-400" />;
  }
  if (lower.includes('knowledge') || lower.includes('doc') || lower.includes('query')) {
    return <Database className="w-4 h-4 text-purple-400" />;
  }
  if (lower.includes('transfer') || lower.includes('forward')) {
    return <PhoneForwarded className="w-4 h-4 text-amber-400" />;
  }
  if (lower.includes('sms') || lower.includes('message') || lower.includes('text')) {
    return <Send className="w-4 h-4 text-cyan-400" />;
  }
  return <Wrench className="w-4 h-4 text-cyan-400" />;
}

export const ConversationsTab: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { calls, fetchCallDetails } = useData();

  const userAssistantId = user?.assignedAssistantId;
  const userOrgId = user?.organizationId;
  const filteredCalls =
    isSuperAdmin && !userOrgId
      ? calls
      : userAssistantId
      ? calls.filter(
          (c) => c.assistantId === userAssistantId || (userOrgId && c.organizationId === userOrgId)
        )
      : calls.filter((c) => !userOrgId || c.organizationId === userOrgId);

  const [selectedCall, setSelectedCall] = useState<VapiCall | null>(filteredCalls[0] || null);
  const [filterType, setFilterType] = useState<string>('all');
  const [inspectorTab, setInspectorTab] = useState<'transcript' | 'tools' | 'analysis'>('transcript');
  const [analyzingCall, setAnalyzingCall] = useState(false);
  const [isRefreshingRecording, setIsRefreshingRecording] = useState(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  // Keep selectedCall in sync if calls list updates
  useEffect(() => {
    if (selectedCall) {
      const fresh = calls.find((c) => c.id === selectedCall.id);
      if (fresh) setSelectedCall(fresh);
    } else if (filteredCalls.length > 0) {
      setSelectedCall(filteredCalls[0]);
    }
  }, [calls]);

  const displayedCalls = filteredCalls.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  const handleExportTranscript = (call: VapiCall) => {
    const toolText =
      call.toolCalls && call.toolCalls.length > 0
        ? `\n\nTool Invocations & Automations:\n` +
          call.toolCalls
            .map(
              (t, i) =>
                `[${i + 1}] Tool: ${t.name}\nStatus: ${t.status || 'executed'}\nArguments: ${JSON.stringify(
                  t.arguments,
                  null,
                  2
                )}\nResult: ${JSON.stringify(t.result, null, 2)}\n`
            )
            .join('\n')
        : '';

    const content = `AuraVoice Call Record: ${call.id}
Date: ${call.startedAt || 'N/A'}
Duration: ${call.durationSeconds || 0} seconds
Customer: ${call.customerNumber || 'N/A'}
Assistant: ${call.assistantName || 'N/A'}
Assistant ID: ${call.assistantId || 'N/A'}

Summary:
${call.summary || 'N/A'}
${toolText}
Transcript:
${call.transcript || 'No transcript recorded.'}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `call_transcript_${call.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefreshCallData = async () => {
    if (!selectedCall) return;
    setIsRefreshingRecording(true);
    const updated = await fetchCallDetails(selectedCall.id);
    if (updated) {
      setSelectedCall(updated);
    }
    setIsRefreshingRecording(false);
  };

  const handleAiDeepAnalyze = async (call: VapiCall) => {
    if (!call.transcript) return;
    setAnalyzingCall(true);
    try {
      const res = await fetch('/api/ai/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: call.transcript,
          organizationName: user?.organizationName || 'Client Org',
        }),
      });
      if (res.ok) {
        const analysis = await res.json();
        call.analysis = {
          sentiment: analysis.sentiment || 'Positive',
          qualificationScore: analysis.qualificationScore || 85,
          actionItems: analysis.actionItems || [],
        };
        call.summary = analysis.summary || call.summary;
        setSelectedCall({ ...call });
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setAnalyzingCall(false);
    }
  };

  const toolCallsCount = selectedCall?.toolCalls?.length || 0;

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Conversations & Transcripts</h2>
          <p className="text-xs text-slate-400">
            Audit verbatim dialogue, actual audio recordings, and automated tool invocation records.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Calls ({filteredCalls.length})
          </button>
          <button
            onClick={() => setFilterType('webCall')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'webCall' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Web Calls
          </button>
          <button
            onClick={() => setFilterType('inboundPhoneCall')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'inboundPhoneCall'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inbound Phone
          </button>
        </div>
      </div>

      {displayedCalls.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Call Logs Recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once calls are processed by your assigned voice assistants, complete transcripts, real audio recordings, and
            tool invocation logs will populate here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Call List */}
          <div className="lg:col-span-5 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80 max-h-[700px] overflow-y-auto">
            {displayedCalls.map((call) => {
              const isSelected = selectedCall?.id === call.id;
              const toolsInCall = call.toolCalls?.length || 0;
              return (
                <div
                  key={call.id}
                  onClick={() => {
                    setSelectedCall(call);
                    // Proactively load fresh artifact if not yet present
                    if (!call.recordingUrl || !call.transcript) {
                      fetchCallDetails(call.id);
                    }
                  }}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-800/80 border-l-2 border-cyan-400' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                      {call.customerNumber || 'Caller'}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                      {call.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="truncate">{call.assistantName || 'Voice Agent'}</span>
                    {toolsInCall > 0 && (
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-800/40 flex items-center gap-1 shrink-0">
                        <Wrench className="w-2.5 h-2.5" />
                        <span>{toolsInCall} tool{toolsInCall > 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="tabular-nums">
                      {call.durationSeconds ? `${call.durationSeconds}s` : '0s'}
                    </span>
                    <span>
                      {call.startedAt ? new Date(call.startedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Call Detail Inspector */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-xl border border-slate-800 p-6 space-y-6">
            {selectedCall ? (
              <>
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">Call Details</h3>
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 select-all">
                        {selectedCall.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Agent: <span className="text-cyan-400 font-medium">{selectedCall.assistantName}</span> ·
                      Duration:{' '}
                      <span className="font-mono tabular-nums text-white">
                        {selectedCall.durationSeconds || 0}s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sync Fresh Call Artifacts */}
                    <button
                      onClick={handleRefreshCallData}
                      disabled={isRefreshingRecording}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="Fetch fresh call artifacts and recordings from provider"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshingRecording ? 'animate-spin' : ''}`}
                      />
                      <span className="hidden sm:inline">Sync Fresh</span>
                    </button>

                    <button
                      onClick={() => handleExportTranscript(selectedCall)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Download transcript and history"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>

                    <button
                      onClick={() => handleAiDeepAnalyze(selectedCall)}
                      disabled={analyzingCall || !selectedCall.transcript}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${analyzingCall ? 'animate-spin' : ''}`} />
                      <span>{analyzingCall ? 'Analyzing...' : 'AI Insights'}</span>
                    </button>
                  </div>
                </div>

                {/* Real Call Audio Player with seeking, duration & error handling */}
                <CallAudioPlayer
                  recordingUrl={selectedCall.recordingUrl}
                  callId={selectedCall.id}
                  onRefreshRecording={handleRefreshCallData}
                  isRefreshing={isRefreshingRecording}
                />

                {/* Sub-tab switcher */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setInspectorTab('transcript')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      inspectorTab === 'transcript'
                        ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Dialogue Transcript</span>
                  </button>

                  <button
                    onClick={() => setInspectorTab('tools')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      inspectorTab === 'tools'
                        ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Tool Invocations</span>
                    {toolCallsCount > 0 && (
                      <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/40">
                        {toolCallsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setInspectorTab('analysis')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      inspectorTab === 'analysis'
                        ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive Analysis</span>
                  </button>
                </div>

                {/* TAB 1: Verbatim Dialogue Transcript */}
                {inspectorTab === 'transcript' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
                      <span>Verbatim Dialogue</span>
                      <span className="text-slate-500 lowercase">
                        {selectedCall.startedAt ? new Date(selectedCall.startedAt).toLocaleTimeString() : ''}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3 max-h-80 overflow-y-auto leading-relaxed">
                      {selectedCall.transcript ? (
                        selectedCall.transcript.split('\n').map((line, i) => {
                          const isAgent = line.startsWith('Agent:') || line.startsWith('bot:');
                          const speaker = isAgent ? 'Agent' : line.split(':')[0] || 'Customer';
                          const speechText = line.includes(':') ? line.substring(line.indexOf(':') + 1) : line;

                          return (
                            <div key={i} className="flex gap-2">
                              <span
                                className={
                                  isAgent ? 'text-cyan-400 font-bold shrink-0' : 'text-emerald-400 font-bold shrink-0'
                                }
                              >
                                {speaker}:
                              </span>
                              <span className="text-slate-300">{speechText}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-500 italic py-4 text-center">
                          No audio dialogue recorded for this session. Click &quot;Sync Fresh&quot; above to retrieve transcripts from the voice infrastructure.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: Tool Invocations & Automations */}
                {inspectorTab === 'tools' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Executed Voice Tools & Integrations
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Automated actions invoked by the AI voice agent during this session.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                        {toolCallsCount} Executed
                      </span>
                    </div>

                    {toolCallsCount === 0 ? (
                      <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                        <Wrench className="w-8 h-8 text-slate-600 mx-auto" />
                        <div className="text-xs font-semibold text-slate-300">No Tool Invocations Recorded</div>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          This call was completed via direct natural speech dialogue without triggering external
                          calendar, CRM, knowledge query, or transfer tools.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedCall.toolCalls?.map((tool, idx) => {
                          const isExpanded = expandedToolId === tool.id || (toolCallsCount <= 2 && expandedToolId === null);
                          return (
                            <div
                              key={tool.id || idx}
                              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                            >
                              <div
                                onClick={() => setExpandedToolId(isExpanded ? '__none__' : tool.id)}
                                className="flex items-center justify-between cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                                    {getToolIcon(tool.name)}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-white font-mono">{tool.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      ID: {tool.id}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40 uppercase">
                                    {tool.status || 'Executed'}
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                                  {/* Arguments passed */}
                                  <div>
                                    <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                                      <Cpu className="w-3 h-3 text-cyan-400" />
                                      <span>Tool Input Arguments:</span>
                                    </div>
                                    <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto">
                                      {typeof tool.arguments === 'object'
                                        ? JSON.stringify(tool.arguments, null, 2)
                                        : tool.arguments || 'None'}
                                    </pre>
                                  </div>

                                  {/* Results returned */}
                                  {tool.result && (
                                    <div>
                                      <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                        <span>Execution Result:</span>
                                      </div>
                                      <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                                        {typeof tool.result === 'object'
                                          ? JSON.stringify(tool.result, null, 2)
                                          : tool.result}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: Executive Summary & Analysis */}
                {inspectorTab === 'analysis' && (
                  <div className="space-y-4">
                    {/* AI Executive Summary & Qualification Score */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Executive Summary</span>
                        {selectedCall.analysis?.qualificationScore && (
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                            Lead Qualification: {selectedCall.analysis.qualificationScore}/100
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedCall.summary || 'Summary generated upon call completion.'}
                      </p>
                    </div>

                    {/* Action Items if present */}
                    {selectedCall.analysis?.actionItems && selectedCall.analysis.actionItems.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="text-xs font-semibold text-slate-300">Extracted Action Items</span>
                        <ul className="space-y-1.5 pt-1">
                          {selectedCall.analysis.actionItems.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technical Metadata */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                      <span className="font-semibold text-slate-300">Call Metadata</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                        <div>Call Type: <span className="text-white">{selectedCall.type}</span></div>
                        <div>Status: <span className="text-emerald-400">{selectedCall.status}</span></div>
                        <div>Duration: <span className="text-white">{selectedCall.durationSeconds || 0}s</span></div>
                        <div>Assistant ID: <span className="text-cyan-400">{selectedCall.assistantId}</span></div>
                        {selectedCall.cost !== undefined && (
                          <div>Cost: <span className="text-white">${selectedCall.cost.toFixed(4)}</span></div>
                        )}
                        {selectedCall.endedReason && (
                          <div>Ended Reason: <span className="text-white">{selectedCall.endedReason}</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select a call from the list to inspect audio recording and transcripts.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
