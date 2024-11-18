import {
  Script,
  useCreateScript,
  useDeleteScript,
  useGetAllScripts,
  useTestScript,
  useUpdateScript,
} from '@/hooks/useScripts';
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatRelative } from 'date-fns';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Edit2, PlayIcon, Plus, Trash2 } from 'lucide-react';
import createDialog from '@/components/ui/createDialog';
import { ScriptForm } from './components/ScriptForm';
import { PageLayout } from '@/app/components/layouts/page-layout';
import { PageHeading } from '@/app/components/page-heading';
import { ErrorPage } from '@/app/components/error';
import { LoadingPage } from '@/app/components/loading';
import { useAuth } from '@/hooks/useAuth';
const DEFAULT_SCRIPT: Partial<Script> = {
  content: `#!/bin/bash\n\necho 'Hello, World!'`,
  name: '',
  description: '',
  tags: [],
};
export const Scripts = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = React.useState<'edit' | 'new' | null>(null);
  const [script, setScript] = React.useState<Partial<Script>>(DEFAULT_SCRIPT);
  // get all scripts
  const { data: scripts, error, isLoading } = useGetAllScripts();
  // delete script
  const { mutateAsync: deleteScript, isPending: isDeleteScriptPending } =
    useDeleteScript();
  // create script
  const { mutateAsync: addScript, isPending: isAddScriptPending } =
    useCreateScript();

  // update script
  const { mutateAsync: updateScript, isPending: isUpdateScriptPending } =
    useUpdateScript();

  // test script
  const { mutateAsync: testScript, isPending: isTestScriptPending } =
    useTestScript();

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  async function handleDelete(id: string) {
    if (!id) return;
    if (user?.role !== 'Admin') {
      return toast.error('You do not have permission to delete scripts');
    }
    const userConfirmed = await createDialog({
      title: 'Delete Script',
      details:
        'Are you sure you want to delete this script?\nThis action cannot be undone',
    });
    if (!userConfirmed) {
      return;
    }

    const res = await deleteScript(id);
    if (res.status === 200) {
      toast.success('Script deleted successfully');
    } else {
      toast.error('Error deleting script');
    }
  }
  async function handleUpdate() {
    if (user?.role !== 'Admin') {
      return toast.error('You do not have permission to update scripts');
    }
    if (!script?.name || !script.description || !script?.content)
      return toast.error('Fill all fields');
    if (!script._id) return toast.error('Script not found');

    const res = await updateScript({
      id: script._id,
      update: script,
    });

    if (res.status === 200) {
      toast.success('Script updated successfully');
      setScript(DEFAULT_SCRIPT);
      setShowForm(null);
    } else {
      toast.error('Error updating script');
    }
  }

  async function handleSave() {
    if (user?.role !== 'Admin') {
      return toast.error('You do not have permission to create scripts');
    }
    if (
      !script?.name ||
      !script.description ||
      !script?.content ||
      !script.language
    )
      return toast.error('Fill all fields');
    const res = await addScript({
      content: script.content,
      description: script.description,
      language: script.language,
      name: script.name,
      tags: script.tags,
    });

    if (res.status === 201) {
      toast.success('Script created successfully');
      setScript(DEFAULT_SCRIPT);
    } else {
      toast.error('Error creating script');
    }
  }

  async function handleRunScript(id: string) {
    if (!id) return;
    const res = await testScript(id);
    if (res.status === 200) {
      toast.success('Script executed successfully');
    } else {
      toast.error('Error executing script');
    }
  }

  function openEditForm(script: Partial<Script>) {
    setShowForm('edit');
    setScript(script);
  }

  function openNewForm() {
    setShowForm('new');
    setScript(DEFAULT_SCRIPT);
  }

  return (
    <PageLayout>
      <PageHeading className='mb-6'>Script Management</PageHeading>

      {showForm && (
        <div className='border border-border p-4 rounded-md shadow-lg'>
          <ScriptForm script={script} setScript={setScript} />
          <footer className='mt-8 flex'>
            <div className='ml-auto space-x-4'>
              <Button variant='outline' onClick={() => setShowForm(null)}>
                Cancel
              </Button>
              {showForm === 'edit' ? (
                <Button
                  onClick={handleUpdate}
                  disabled={
                    isUpdateScriptPending ||
                    !script.name ||
                    !script.description ||
                    !script.content
                  }
                >
                  Update
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={
                    isAddScriptPending ||
                    !script.name ||
                    !script.description ||
                    !script.content
                  }
                >
                  Save
                </Button>
              )}
            </div>
          </footer>
        </div>
      )}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Scripts</CardTitle>
            <CardDescription>Manage your scripts</CardDescription>
          </div>

          <Button onClick={openNewForm}>
            <Plus className='mr-2 size-4' />
            New Script
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                {/* <TableHead>Path</TableHead> */}
                <TableHead>Tags</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scripts?.data?.map((script) => (
                <TableRow key={script._id}>
                  <TableCell>{script.name}</TableCell>
                  <TableCell>{script.description}</TableCell>
                  {/* <TableCell
                    title={script.path}
                    className='truncate max-w-[200px] overflow-hidden'
                  >
                    {script.path}
                  </TableCell> */}
                  <TableCell>{script.tags?.join(', ')}</TableCell>
                  <TableCell>{script.language}</TableCell>
                  <TableCell>
                    {formatRelative(new Date(script.createdAt), new Date())}
                  </TableCell>
                  <TableCell>{script?.createdBy?.firstName}</TableCell>
                  <TableCell>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        size={'icon'}
                        onClick={() => openEditForm(script)}
                      >
                        <Edit2 className='size-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size={'icon'}
                        onClick={() => handleRunScript(script._id)}
                      >
                        <PlayIcon className='size-4' />
                      </Button>
                      <Button
                        variant='destructive'
                        size={'icon'}
                        onClick={() => handleDelete(script._id)}
                        disabled={isDeleteScriptPending}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
};
