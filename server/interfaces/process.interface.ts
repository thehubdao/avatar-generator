export interface ProcessInfo {
  id: string;
  done: boolean;
  request: string[];
  error?: string[];
  canUpdate?: boolean;
}