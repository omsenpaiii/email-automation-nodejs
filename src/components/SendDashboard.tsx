'use client';
import React from 'react';
import { SendStatus, EmailLog } from '@/types';
import { Play, Pause, Square, AlertCircle, CheckCircle } from 'lucide-react';

interface SendDashboardProps {
  status: SendStatus;
  total: number;
  sent: number;
  failed: number;
  delayStr: string;
  setDelayStr: (val: string) => void;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  logs: EmailLog[];
}

export default function SendDashboard({
  status, total, sent, failed, delayStr, setDelayStr, onStart, onPause, onStop, logs
}: SendDashboardProps) {
  
  const pending = total - sent - failed;
  const progressPercent = total > 0 ? ((sent + failed) / total) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Send Delivery Engine</h2>
      
      <div className="flex items-center gap-6 mb-6">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Total</span>
          <span className="text-2xl font-bold">{total}</span>
        </div>
        <div className="h-10 w-px bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold text-blue-600">Pending</span>
          <span className="text-2xl font-bold text-blue-800">{pending}</span>
        </div>
        <div className="h-10 w-px bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold text-green-600">Sent</span>
          <span className="text-2xl font-bold text-green-800">{sent}</span>
        </div>
        <div className="h-10 w-px bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold text-red-600">Failed</span>
          <span className="text-2xl font-bold text-red-800">{failed}</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mr-2">Delay between emails (seconds):</label>
        <input 
          type="number"
          min="1"
          value={delayStr}
          onChange={(e) => setDelayStr(e.target.value)}
          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
          disabled={status === 'sending'}
        />
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="flex gap-3 mb-6">
        {(status === 'idle' || status === 'paused' || status === 'stopped') && total > 0 && pending > 0 && (
          <button onClick={onStart} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition">
            <Play className="w-4 h-4" /> {status === 'idle' ? 'Start Sending' : 'Resume'}
          </button>
        )}
        {status === 'sending' && (
          <button onClick={onPause} className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium transition">
            <Pause className="w-4 h-4" /> Pause
          </button>
        )}
        {(status === 'sending' || status === 'paused') && (
          <button onClick={onStop} className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition">
            <Square className="w-4 h-4" /> Stop
          </button>
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-4">Delivery Logs</h3>
          <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-100 rounded-md p-2 bg-gray-50">
            {logs.map(log => (
              <div key={log.id} className="text-sm flex py-1 border-b border-gray-200 last:border-0 items-start">
                <span className="w-20 text-gray-400 shrink-0 text-xs mt-0.5">{log.timestamp}</span>
                {log.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${log.success ? 'text-green-700' : 'text-red-700'} truncate`}>{log.email}</p>
                  {!log.success && <p className="text-xs text-red-500 break-words">{log.error}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
