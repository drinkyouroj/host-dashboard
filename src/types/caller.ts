import type { Caller } from '../contexts/ShowContext';

export interface UICaller extends Omit<Caller, 'status'> {
  phoneNumber: string;
  waitTime: number;
  isMuted: boolean;
  isPriority: boolean;
  notes?: string;
  status: 'waiting' | 'live' | 'rejected';  // Only include statuses supported by ShowContext
  
  // UI-specific display properties
  displayStatus?: string;
}

export type CallerStatus = UICaller['status'];
