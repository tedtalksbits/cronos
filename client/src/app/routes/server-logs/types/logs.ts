export interface Log {
  timestamp: string;
  level: string;
  message: string;
}

export interface FilterOptions {
  startDate: string;
  endDate: string;
  levels: string[];
  message: string;
}
