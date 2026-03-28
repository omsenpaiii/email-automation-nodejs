'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud } from 'lucide-react';
import { ContactRow } from '@/types';

interface CSVUploaderProps {
  onDataLoaded: (data: ContactRow[]) => void;
}

export default function CSVUploader({ onDataLoaded }: CSVUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ContactRow[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        
        // Basic validation checking for 'email' column
        const hasEmail = rows.length > 0 && Object.keys(rows[0]).some(k => k.toLowerCase().includes('email'));
        if (!hasEmail) {
          setError('CSV must contain an "email" column.');
          return;
        }

        // Normalize email column internally (always lowercase key)
        const normalizedRows = rows.map((row, index) => {
          const newRow: any = { id: index.toString() };
          for (const key in row) {
             const lowerKey = key.toLowerCase().trim();
             
             // Smart column mapping for RocketReach / LinkedIn exports
             if (lowerKey.includes('email') && row[key] && String(row[key]).includes('@')) {
               const currentEmails = newRow.email ? newRow.email.split(',').map((e: string) => e.trim()) : [];
               const newEmails = String(row[key]).split(',').map(e => e.trim()).filter(e => e.includes('@'));
               newEmails.forEach(e => {
                 if (!currentEmails.includes(e)) currentEmails.push(e);
               });
               if (currentEmails.length > 0) newRow.email = currentEmails.join(', ');
             }
             if ((lowerKey.includes('name') && !lowerKey.includes('company') && !lowerKey.includes('file')) && !newRow.name && row[key]) newRow.name = row[key];
             if ((lowerKey.includes('company') || lowerKey === 'employer') && !newRow.company && row[key]) newRow.company = row[key];
             if ((lowerKey.includes('title') || lowerKey === 'role' || lowerKey === 'hr position') && !newRow.position && row[key]) newRow.position = row[key];

             newRow[lowerKey] = row[key];
          }
          return newRow as ContactRow;
        }).filter(r => r.email); // filter out rows without email

        setError(null);
        setPreview(normalizedRows.slice(0, 5));
        onDataLoaded(normalizedRows);
      },
      error: (err: any) => {
        setError(err.message);
      }
    });
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition">
      <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
      <p className="mb-2 text-sm">Upload CSV containing recipients data</p>
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileUpload} 
        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
      />
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      
      {preview.length > 0 && (
        <div className="w-full mt-6 text-left">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">Preview (First 5 Rows)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-600">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 text-left font-medium">Email</th>
                  <th className="py-2 text-left font-medium">Name</th>
                  <th className="py-2 text-left font-medium">Company</th>
                  <th className="py-2 text-left font-medium">Position</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0 h-8">
                    <td className="pr-2">{row.email}</td>
                    <td className="pr-2">{row.name || '-'}</td>
                    <td className="pr-2">{row.company || '-'}</td>
                    <td className="pr-2">{row.position || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
