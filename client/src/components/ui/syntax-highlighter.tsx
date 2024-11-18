import { BREAK_POINTS, useMediaQuery } from '@/hooks/utils/useMediaQuery';
import { cn } from '@/lib/utils';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

interface SyntaxHighlighterProps extends React.HTMLProps<HTMLPreElement> {
  code: string;
  language: 'shell' | 'javascript';
  codeClassName?: string;
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language,
  ...props
}) => {
  const isDesktop = useMediaQuery(BREAK_POINTS.md);
  const highlightCode = (code: string, language: 'shell' | 'javascript') => {
    // Define regex patterns for highlighting
    const patterns: Record<string, { regex: RegExp; className: string }[]> = {
      shell: [
        { regex: /#.*$/gm, className: 'text-green-500' }, // Comments
        { regex: /"(.*?)"/g, className: 'text-green-500' }, // Strings
        {
          regex: /\b(bash|cd|echo|ls|mkdir|rm)\b/g,
          className: 'text-blue-500 font-bold',
        }, // Keywords
      ],
      javascript: [
        { regex: /\/\/.*$/gm, className: 'text-foreground/50' }, // Comments
        { regex: /"(.*?)"/g, className: 'text-green-500' }, // Strings
        {
          regex: /\b(const|let|var|if|else|return|function|for)\b/g,
          className: 'text-blue-500 font-bold',
        }, // Keywords
      ],
      python: [
        { regex: /#.*$/gm, className: 'text-foreground/50' }, // Comments
        { regex: /"(.*?)"/g, className: 'text-green-500' }, // Strings
        {
          regex: /\b(def|if|else|return|for|in|import)\b/g,
          className: 'text-blue-500 font-bold',
        }, // Keywords
      ],
    };

    const highlights = patterns[language];

    // Replace each pattern with a span
    highlights.forEach(({ regex, className }) => {
      code = code.replace(
        regex,
        (match) => `<span class="${className}">${match}</span>`
      );
    });

    return code;
  };

  const highlightedCode = highlightCode(code, language);
  if (!isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button>View</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Command</DialogTitle>
          </DialogHeader>
          <pre
            {...props}
            className={cn(
              'bg-card text-foreground p-4 rounded-md w-full overflow-x-auto',
              props.className
            )}
          >
            <code
              className={cn('block', props.codeClassName)}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <pre
      {...props}
      className={cn(
        'bg-background text-foreground p-4 rounded-md w-full overflow-x-auto',
        props.className
      )}
    >
      <code
        className={cn('block', props.codeClassName)}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  );
};

export default SyntaxHighlighter;
