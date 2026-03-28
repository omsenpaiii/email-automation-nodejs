'use client';
import React from 'react';
import { SMTPConfig } from '@/types';

interface SMTPSettingsProps {
  config: SMTPConfig;
  setConfig: (config: SMTPConfig) => void;
}

export default function SMTPSettings({ config, setConfig }: SMTPSettingsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">SMTP Settings</h2>
      
      <div className="grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
          <input 
            type="text" 
            name="host"
            value={config.host}
            onChange={handleChange}
            placeholder="e.g. smtp.gmail.com"
            className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
          <input 
            type="number" 
            name="port"
            value={config.port}
            onChange={handleChange}
            placeholder="e.g. 587 or 465"
            className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email / Username</label>
          <input 
            type="text" 
            name="user"
            value={config.user}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">App Password</label>
          <input 
            type="password" 
            name="pass"
            value={config.pass}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2" 
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
         Credentials are only stored in memory and sent directly to your provider. 
      </p>
    </div>
  );
}
