import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import { useModal } from '@/hooks/useModal';
import { CreateServerSchema, useCreateServerForm } from '@/hooks/forms';
import { useUpdateServerMutation } from '@/hooks/mutations';
import { ServerType } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import RoomSidebar from '../RoomSidebar';

const EditServerModal = () => {
  const {
    isOpen,
    modalType,
    closeModal,
    data: { server },
  } = useModal();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const form = useCreateServerForm();
  const mutation = useUpdateServerMutation();
  const isLoading = form.formState.isSubmitting || mutation.isPending;

  const isServerNameChanged = form.getFieldState('serverName').isDirty;
  const isServerImageChanged = form.getFieldState('serverImage').isDirty;
  const isServerPasswordChanged = form.getFieldState('serverPassword').isDirty;
  const isServerTypeChanged = form.getFieldState('serverType').isDirty;
  const isChanged = [
    isServerNameChanged,
    isServerImageChanged,
    isServerPasswordChanged,
    isServerTypeChanged,
  ].some(Boolean);

  useEffect(() => {
    form.setValue('serverName', server?.name || '');
    form.setValue('serverImage', server?.imageUrl || '');
    form.setValue('serverPassword', server?.password || '');
    form.setValue('serverType', server?.type || ServerType.PUBLIC);
  }, [server]);

  const clearForm = () => {
    setImageFile(null);
    form.reset();
    mutation.reset();
  };

  const onSubmit = async (values: CreateServerSchema) => {
    const formData = new FormData();
    if (isServerNameChanged) {
      formData.append('serverName', values.serverName);
    }
    if (isServerTypeChanged || isServerPasswordChanged) {
      formData.append('serverType', values.serverName);
      formData.append('serverPassword', values.serverName);
    }
    if (isServerImageChanged) {
      console.log(imageFile);
      formData.append('serverImage', imageFile!);
    }

    mutation.mutate(
      {
        data: formData,
        roomId: roomId!,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Create server OK',
          });
        },
        onError: () => {
          toast({
            title: 'Create server Failed',
          });
        },
        onSettled: () => {
          clearForm();
        },
      },
    );
  };

  return (
    <Dialog
      open={isOpen && modalType === 'editServer'}
      onOpenChange={() => {
        closeModal();
        clearForm();
      }}
    >
      <DialogContent className='overflow-hidden bg-white p-0 text-black'>
        <DialogHeader className='px-6 pt-8'>
          <DialogTitle className='text-center text-2xl font-bold'>
            Customize your server
          </DialogTitle>
          <DialogDescription className='text-justify text-zinc-500'>
            Give your server a personality with a name and an image. You can always change it later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-8 px-6'>
              <div className='flex items-center justify-center text-center'>
                <FormField
                  control={form.control}
                  name='serverImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          onChange={f => {
                            setImageFile(f);
                            field.onChange(f?.name || '');
                          }}
                          accept={{
                            'image/*': [],
                          }}
                          preset={server?.imageUrl}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='serverName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70'>
                      Server name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={form.formState.isLoading}
                        className='bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0'
                        placeholder='Enter server name'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='serverType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className='bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none'>
                          <SelectValue placeholder='Select a server type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(ServerType).map(type => (
                          <SelectItem key={type} value={type} className='capitalize'>
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='serverPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70'>
                      Server password
                    </FormLabel>
                    <FormDescription>Private server require a password</FormDescription>
                    <FormControl>
                      <Input
                        disabled={form.formState.isLoading}
                        className='bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0'
                        placeholder='Password of private server'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className='bg-gray-100 px-6 py-4'>
              <Button type='submit' variant='primary' disabled={form.formState.isLoading}>
                <span className='text-foreground'>Edit</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditServerModal;
