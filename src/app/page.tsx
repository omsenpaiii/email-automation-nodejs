'use client';
import React, { useState, useRef, useEffect } from 'react';
import CSVUploader from '@/components/CSVUploader';
import TemplateEditor from '@/components/TemplateEditor';
import SMTPSettings from '@/components/SMTPSettings';
import SendDashboard from '@/components/SendDashboard';
import { ContactRow, SMTPConfig, SendStatus, EmailLog } from '@/types';

const DEFAULT_SUBJECT = `Quick note re: {{position}} — {{company}}`;

const DEFAULT_BODY = `Hi {{name}},

I hope this message finds you well. I came across the {{position}} opening at {{company}} and wanted to reach out directly — I believe my background is a strong match for what your team is looking for.

I recently applied through your job opening, but I know applications can get lost in the volume. A few highlights that are directly relevant:

• Hands-on experience building and shipping production-grade projects aligned with the {{position}} role
• Strong problem-solving skills demonstrated through real-world work, not just coursework
• A genuine passion for {{company}}'s mission and the impact your team is making

I'd love the opportunity to have a brief conversation — even 10 minutes — to share how I could contribute to your team's goals.

I've attached my resume for your reference. Would you be open to a quick chat this week?

Looking forward to hearing from you.

Best regards,
{{sendername}}`;

export default function Home() {
  const [csvData, setCsvData] = useState<ContactRow[]>([]);
  const [templateBody, setTemplateBody] = useState(DEFAULT_BODY);
  const [templateSubject, setTemplateSubject] = useState(DEFAULT_SUBJECT);
  const [senderName, setSenderName] = useState('');
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({ host: '', port: 587, user: '', pass: '' });
  
  const [status, setStatus] = useState<SendStatus>('idle');
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [delayStr, setDelayStr] = useState('10');

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Handle persistence — load saved templates, fall back to defaults
  useEffect(() => {
    const savedBody = localStorage.getItem('rr_template_body_v2');
    const savedSubject = localStorage.getItem('rr_template_subject_v2');
    const savedSender = localStorage.getItem('rr_sender_name');
    if (savedBody && savedBody.trim()) setTemplateBody(savedBody);
    if (savedSubject && savedSubject.trim()) setTemplateSubject(savedSubject);
    if (savedSender) setSenderName(savedSender);
  }, []);

  useEffect(() => {
    localStorage.setItem('rr_template_body_v2', templateBody);
    localStorage.setItem('rr_template_subject_v2', templateSubject);
    localStorage.setItem('rr_sender_name', senderName);
  }, [templateBody, templateSubject, senderName]);

  const sendNextEmail = async (currentIndex: number) => {
    if (statusRef.current !== 'sending') return;
    if (currentIndex >= csvData.length) {
      setStatus('completed');
      return;
    }

    const contact = csvData[currentIndex];
    
    // Replace variables (e.g., {{name}} -> contact.name)
    const replaceVars = (text: string) => text.replace(/\{\{(\w+)\}\}/g, (match, p1) => {
      if (p1.toLowerCase() === 'sendername') return senderName || match;
      return contact[p1.toLowerCase()] || match;
    });
    const subject = replaceVars(templateSubject);
    const text = replaceVars(templateBody);

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp: smtpConfig,
          to: contact.email,
          subject,
          text
        })
      });
      const data = await res.json();
      
      const newLog: EmailLog = {
        id: contact.email + Date.now(),
        email: contact.email,
        success: res.ok,
        error: res.ok ? undefined : data.error || 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setLogs(prev => [newLog, ...prev]);
    } catch (err: any) {
      const newLog: EmailLog = {
        id: contact.email + Date.now(),
        email: contact.email,
        success: false,
        error: err.message,
        timestamp: new Date().toLocaleTimeString()
      };
      setLogs(prev => [newLog, ...prev]);
    }

    // Schedule next
    if (statusRef.current === 'sending') {
      const ms = parseInt(delayStr) * 1000 || 10000;
      setTimeout(() => {
        sendNextEmail(currentIndex + 1);
      }, ms);
    }
  };

  const pendingCount = csvData.length - logs.length;
  const sentCount = logs.filter(l => l.success).length;
  const failedCount = logs.filter(l => !l.success).length;

  const handleStart = () => {
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      alert("Please configure SMTP settings fully.");
      return;
    }
    if (!templateBody || !templateSubject) {
      alert("Please enter a subject and body template.");
      return;
    }
    setStatus('sending');
    const resumeIndex = logs.length;
    sendNextEmail(resumeIndex);
  };

  const handlePause = () => setStatus('paused');
  const handleStop = () => setStatus('stopped');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <header className="bg-white border-b border-gray-200 py-6 px-8 mb-8">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold tracking-tighter shadow-sm">
            RR
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cold Outreach Automation</h1>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <CSVUploader onDataLoaded={setCsvData} />
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover-lift">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Your Details</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (for sign-off)</label>
            <input 
              type="text" 
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Om Patel"
              className="w-full border border-gray-300 rounded-md p-2 focus-glow placeholder:text-gray-400" 
            />
            <p className="text-xs text-gray-500 mt-2">Used as <code className="bg-gray-100 px-1 rounded">{'{{sendername}}'}</code> in your template sign-off.</p>
          </div>

          <SMTPSettings config={smtpConfig} setConfig={setSmtpConfig} />
        </div>
        
        <div className="lg:col-span-8 space-y-6">
          {csvData.length > 0 && (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-md border border-blue-100 text-sm">
              Loaded <strong>{csvData.length}</strong> contacts successfully.
            </div>
          )}
          <TemplateEditor 
            templateBody={templateBody}
            setTemplateBody={setTemplateBody}
            templateSubject={templateSubject}
            setTemplateSubject={setTemplateSubject}
            previewContact={csvData.length > 0 ? csvData[0] : null}
            senderName={senderName}
          />

          <SendDashboard 
            status={status}
            total={csvData.length}
            sent={sentCount}
            failed={failedCount}
            delayStr={delayStr}
            setDelayStr={setDelayStr}
            onStart={handleStart}
            onPause={handlePause}
            onStop={handleStop}
            logs={logs}
          />
        </div>
      </main>
    </div>
  );
}
