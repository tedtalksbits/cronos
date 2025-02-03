import { Log, FilterOptions } from '../types/logs';

export const logFilter = (logs: Log[], filter: FilterOptions) => {
  return logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    const startDate = filter.startDate ? new Date(filter.startDate) : null;
    const endDate = filter.endDate ? new Date(filter.endDate) : null;

    const dateInRange =
      (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);

    const levelMatch =
      filter.levels.length === 0 || filter.levels.includes(log.level);

    const messageMatch = log.message
      .toLowerCase()
      .includes(filter.message.toLowerCase());

    return dateInRange && levelMatch && messageMatch;
  });
};

export const logParser = (log: string) => {
  const logLines = log.split('\n');
  return logLines.map((line) => {
    const [timestamp, level, ...message] = line.split(' ');
    return {
      timestamp,
      level: level?.replace(':', '')?.toUpperCase(),
      message: message?.join(' '),
    };
  });
};
