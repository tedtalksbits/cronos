import { useEffect, useRef, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { logFilter } from '../utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowBigDownDashIcon } from 'lucide-react';
import { FilterOptions, Log } from '../types/logs';
import { ServerLogFilter } from './ServerLogFilter';
export const ServerLogViewer = ({ logs }: { logs: Log[] }) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [logsUpdated, setLogsUpdated] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [filter, setFilter] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    levels: [],
    message: '',
  });
  const parentRef = useRef<List>(null);

  // effect to scroll to bottom when new logs are received if already at bottom
  useEffect(() => {
    if (parentRef.current && isScrolledToBottom) {
      parentRef.current.scrollToItem(logs.length - 1, 'end');
      setIsScrolledToBottom(true);
      setLogsUpdated(false);
    }
  }, [logs, isScrolledToBottom]);

  // effect to indicate new logs have been received
  useEffect(() => {
    setLogsUpdated((prev) => !prev);
  }, [logs]);

  const filteredLogs = logFilter(logs, filter);
  return (
    <>
      <ServerLogFilter className='mb-4' filter={filter} setFilter={setFilter} />
      <div className='flex flex-col h-full relative'>
        {logsUpdated && !isScrolledToBottom && (
          <div className='bg-green-500 text-white p-2 text-center'>
            New logs have been received
          </div>
        )}
        {isScrolling && (
          <div className='absolute top-0 left-0 w-full h-5 bg-gradient-to-b from-green-500/10 to-transparent transition-all ease-in duration-300' />
        )}
        <List
          ref={parentRef}
          className='flex scroll-smooth'
          height={800}
          width='100%'
          itemCount={filteredLogs.length}
          itemSize={30}
          overscanCount={5}
          onItemsRendered={({ visibleStopIndex }) => {
            if (visibleStopIndex === filteredLogs.length - 1) {
              setIsScrolledToBottom(true);
              setLogsUpdated(false);
            } else {
              setIsScrolledToBottom(false);
            }
          }}
          onScroll={() => {
            // if (scrollUpdateWasRequested) {
            //   setIsScrolledToBottom(false);
            // }

            if (!isScrolling) {
              setIsScrolling(true);
              setTimeout(() => {
                setIsScrolling(false);
              }, 100);
            }
          }}
        >
          {({ index, style }) => (
            <pre
              className='whitespace-pre-wrap break-words text-sm  bg-card'
              key={index}
            >
              <div
                style={style}
                className={cn('flex items-center p-1 border-b', {
                  'bg-foreground/5': index % 2 === 0,
                })}
              >
                <span className='text-muted-foreground'>
                  {filteredLogs[index].timestamp}
                </span>
                <span
                  className={cn('ml-2 text-muted-foreground', {
                    'text-destructive': filteredLogs[index].level === '[ERROR]',
                    'text-orange-400': filteredLogs[index].level === '[WARN]',
                    'text-sky-300': filteredLogs[index].level === '[INFO]',
                    'text-muted-foreground':
                      filteredLogs[index].level === '[DEBUG]',
                  })}
                >
                  {filteredLogs[index].level}
                </span>
                <span className='ml-2'>{filteredLogs[index].message}</span>
              </div>
            </pre>
          )}
        </List>
        {/* floating button to scroll to bottom */}
        <Button
          disabled={isScrolledToBottom}
          size={'icon'}
          className='fixed bottom-4 right-4 rounded-full'
          onClick={() => {
            if (parentRef.current) {
              parentRef.current.scrollToItem(filteredLogs.length - 1, 'end');
            }
          }}
        >
          <ArrowBigDownDashIcon size={24} />
        </Button>

        {/* floating information about logs */}
        <div className='absolute -top-4 right-4 bg-foreground/5 text-muted-foreground p-1 rounded-lg text-xs backdrop-blur-md'>
          {filteredLogs.length} logs
        </div>
      </div>
    </>
  );
};
