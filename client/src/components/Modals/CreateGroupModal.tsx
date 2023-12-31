import {
  Dialog,
  DialogContent,
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GroupType } from '@/lib/types';
import { useModal } from '@/hooks/useModal';
import { CreateGroupSchema, useCreateGroupForm } from '@/hooks/forms';
import { useCreateGroupMutation } from '@/hooks/mutations';
import { useToast } from '@/components/ui/use-toast';

const CreateGroupModal = () => {
  const { toast } = useToast();
  const {
    isOpen,
    modalType,
    closeModal,
    data: { room, groupType },
  } = useModal();
  const form = useCreateGroupForm({
    groupName: '',
    groupType: groupType || GroupType.TEXT,
  });
  const mutation = useCreateGroupMutation();
  const onSubmit = async (values: CreateGroupSchema) => {
    mutation.mutate(
      {
        ...values,
        roomId: room?.id!,
      },
      {
        onSuccess: () => {
          toast({
            description: 'Create group successfully',
            variant: 'success',
          });
          closeModal();
        },
        onError: () => {
          toast({
            description: 'Create group failed',
            variant: 'error',
          });
        },
        onSettled: () => {
          form.reset();
          mutation.reset();
        },
      },
    );
  };
  const isLoading = form.formState.isSubmitting || mutation.isPending;

  const handleClose = () => {
    form.reset();
    mutation.reset();
    closeModal();
  };

  return (
    <Dialog open={isOpen && modalType === 'createGroup'} onOpenChange={handleClose}>
      <DialogContent className='overflow-hidden bg-white p-0 text-black dark:bg-zinc-900 dark:text-white'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>Create Group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-8 px-6'>
              <FormField
                control={form.control}
                name='groupName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                      Group name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-zinc-300/50 text-black dark:bg-black dark:text-white'
                        placeholder='Enter group name'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='groupType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                      Group Type
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-zinc-300/50 text-black dark:bg-black dark:text-white capitalize outline-none'>
                          <SelectValue placeholder='Select a group type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(GroupType).map(type => (
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
            </div>
            <DialogFooter className='bg-gray-100 dark:bg-zinc-800 px-6 py-4'>
              <Button type='submit' variant='primary' disabled={isLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
