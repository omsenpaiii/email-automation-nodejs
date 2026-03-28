export interface ContactRow {
  id?: string;
  email: string;
  name?: string;
  company?: string;
  position?: string;
  [key: string]: any;
}

export interface SMTPConfig {
  host: string;
  port: number | string;
  user: string;
  pass: string;
}

export type SendStatus = 'idle' | 'sending' | 'paused' | 'completed' | 'stopped';

export interface EmailLog {
  id: string; // can be the email address + timestamp
  email: string;
  success: boolean;
  error?: string;
  timestamp: string;
}
