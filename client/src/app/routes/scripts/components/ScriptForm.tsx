import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Script } from '@/hooks/useScripts';
import { useTheme } from '@/providers/themeProvider';
import { Editor } from '@monaco-editor/react';
import { formatRelative } from 'date-fns';
import React from 'react';

const LANGUAGES: Array<{
  label: string;
  value: Script['language'];
  editorLanguage: string;
}> = [
  { label: 'Bash', value: 'bash', editorLanguage: 'shell' },
  // { label: 'Python', value: 'python', editorLanguage: 'python' },
  // { label: 'JS', value: 'node', editorLanguage: 'javascript' },
];
interface ScriptFormProps extends React.HTMLAttributes<HTMLDivElement> {
  script: Partial<Script>;
  setScript: React.Dispatch<React.SetStateAction<Partial<Script>>>;
}
export function ScriptForm({ script, setScript }: ScriptFormProps) {
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(new Date());
  const [language, setLanguage] = React.useState(LANGUAGES[0]);
  const { theme } = useTheme();

  function handleAddTag(tag: string) {
    if (script?.tags?.includes(tag)) return;
    setScript({ ...script, tags: [...(script.tags ?? []), tag] });
  }

  function handleRemoveTag(tag: string) {
    setScript({
      ...script,
      tags: (script.tags ?? []).filter((t) => t !== tag),
    });
  }

  return (
    <div>
      <div className='flex flex-col gap-4'>
        <div className='grid grid-cols-4 gap-4 items-start'>
          <Label htmlFor='name'>Name</Label>
          <Input
            type='text'
            id='name'
            name='name'
            placeholder='Name'
            className='col-span-3'
            onChange={(e) => {
              // setName(e.target.value);
              setScript({ ...script, name: e.target.value });
            }}
            value={script.name}
          />
        </div>
        <div className='grid grid-cols-4 gap-4 items-start'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            name='description'
            placeholder='Description'
            className='col-span-3'
            rows={5}
            onChange={(e) => {
              // setDescription(e.target.value);
              setScript({ ...script, description: e.target.value });
            }}
            value={script.description}
          />
        </div>
        <div className='grid grid-cols-4 gap-4 items-start'>
          <Label htmlFor='tags'>Tags</Label>
          <div className='col-span-3'>
            <Input
              type='text'
              id='tags'
              name='tags'
              placeholder='Tags'
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />

            <div className='flex gap-2 my-2'>
              {script?.tags?.map((tag) => (
                <span
                  key={tag}
                  className='bg-accent text-foreground px-2 py-1 rounded-md text-xs font-semibold border border-border shadow-sm'
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className='ml-2 text-xs'
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='shadow-sm border border-border rounded-md overflow-hidden'>
        <header className='bg-card p-4 border-b'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold text-sm'>Script Editor</h3>
            <div className='space-x-4'>
              <small className='text-foreground/50 text-xs'>
                Last updated:{' '}
                {formatRelative(lastUpdated ?? new Date(), new Date())}
              </small>
              <select
                className='rounded-sm bg-card text-sm text-foreground/80 ml-2 border border-border px-2 py-1'
                value={script.language}
                onChange={(e) => {
                  setLanguage(
                    LANGUAGES.find((l) => l.value === e.target.value) ??
                      LANGUAGES[0]
                  );
                  setScript({
                    ...script,
                    language: e.target.value as Script['language'],
                  });
                }}
              >
                <option value=''>Select Language</option>
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>
        <Editor
          className=''
          height='300px'
          language={language.editorLanguage}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          value={script.content}
          onChange={(value) => {
            setScript({ ...script, content: value });
            setLastUpdated(new Date());
          }}
          options={{
            formatOnType: true,
          }}
        />
        <footer className='bg-card p-4 rounded-b-md'></footer>
      </div>
    </div>
  );
}
