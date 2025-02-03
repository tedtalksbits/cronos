import { FC } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, TagIcon } from 'lucide-react';
import { Script } from '@/hooks/useScripts';
import { Editor } from '@monaco-editor/react';
import { useTheme } from '@/providers/themeProvider';

interface ScriptDisplayProps {
  script: Script;
}

export const ScriptDisplay: FC<ScriptDisplayProps> = ({ script }) => {
  const { theme } = useTheme();
  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex justify-between items-start'>
          <div>
            <CardTitle>{script.name}</CardTitle>
            <CardDescription>{script.description}</CardDescription>
          </div>
          <Badge variant='outline'>{script?.language}</Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* <div className='bg-muted p-4 rounded-md'>
          <pre className='whitespace-pre-wrap break-words text-sm'>
            <code>{script?.content}</code>
          </pre>
        </div> */}
        <Editor
          height='200px'
          defaultLanguage='shell'
          language={script.language}
          value={script?.content}
          onChange={(value) => console.log(value)}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        />
        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <CalendarIcon className='w-4 h-4' />
          <span>
            Created: {new Date(script?.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className='flex items-center space-x-2'>
          <TagIcon className='w-4 h-4 text-muted-foreground' />
          <div className='flex flex-wrap gap-2'>
            {script?.tags?.map((tag, index) => (
              <Badge key={index} variant='secondary'>
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      {script.createdBy && (
        <CardFooter>
          <div className='flex items-center space-x-4'>
            <Avatar>
              <AvatarFallback>{`${script?.createdBy?.firstName[0]}${script?.createdBy?.lastName[0]}`}</AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium'>{`${script?.createdBy?.firstName} ${script?.createdBy?.lastName}`}</p>
              <p className='text-sm text-muted-foreground'>
                {script?.createdBy?.email}
              </p>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
