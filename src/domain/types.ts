export type Mode = 'AI_LEAD' | 'CO_SERVICE' | 'HUMAN_LEAD';
export type Stage = 'diagnosing' | 'collaborating' | 'approval' | 'approved' | 'verification' | 'resolved';
export type Role = 'customer' | 'ai' | 'staff' | 'system';
export interface Message { id: string; role: Role; visibility: 'public' | 'internal'; text: string; time: string; kind?: 'check' | 'receipt'; }
export interface Evidence { id: string; title: string; detail: string; source: string; verified: boolean; image?: string; }
export interface Activity { id: string; text: string; time: string; }
export interface ServiceCase {
  id: string; number: string; customer: string; initials: string; color: string; product: string; title: string; preview: string;
  priority: 'normal' | 'high'; deviceId?: string; mode: Mode; stage: Stage; unread: boolean; checked: boolean; requestedHuman: boolean;
  messages: Message[]; evidence: Evidence[]; activity: Activity[];
  action?: { status: 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUCCEEDED'; receipt?: string };
}
export interface DemoState { version: 1; cases: ServiceCase[]; }
export type Action =
  | { type: 'RESET' }
  | { type: 'MESSAGE'; caseId: string; role: Role; visibility: 'public' | 'internal'; text: string }
  | { type: 'MODE'; caseId: string; mode: Mode }
  | { type: 'ATTACH'; caseId: string; image: string; filename: string }
  | { type: 'VERIFY'; caseId: string; solved: boolean }
  | { type: 'JOIN' | 'PROPOSE' | 'APPROVE' | 'REJECT' | 'EXECUTE' | 'CHECK' | 'REQUEST_HUMAN' | 'READ'; caseId: string };
