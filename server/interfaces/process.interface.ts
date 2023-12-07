export interface ProcessInfo {
  id: string;
  done: boolean;
  request: string[];
  canUpdate?: boolean;
}