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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/useModal';
import { JoinRoomByInviteCodeSchema, useJoinRoomByInviteCodeForm } from '@/hooks/forms';
import { useJoinRoomByInviteCodeMutation } from '@/hooks/mutations';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const JoinByInviteCodeModal = () => {
  const { toast } = useToast();
  const { isOpen, modalType, closeModal } = useModal();
  const navigate = useNavigate();
  const form = useJoinRoomByInviteCodeForm();
  const mutation = useJoinRoomByInviteCodeMutation({
    refetch: true,
  });
  const isLoading = form.formState.isSubmitting || mutation.isPending;

  const clearForm = () => {
    form.reset();
    mutation.reset();
  };

  const onSubmit = async (values: JoinRoomByInviteCodeSchema) => {
    mutation.mutate(values, {
      onSuccess: data => {
        if (typeof data === 'boolean') {
          toast({
            description: 'You have already joined this room',
            variant: 'warning',
          });
          closeModal();
          return;
        }

        toast({
          description: 'Join room by invite code successfully',
          variant: 'success',
        });
        closeModal();
        navigate(`/rooms/${data.id}`);
      },
      onError: () => {
        toast({
          description: 'Join room by invite code failed',
          variant: 'error',
        });
      },
      onSettled: () => {
        clearForm();
      },
    });
  };

  return (
    <Dialog
      open={isOpen && modalType === 'joinByInviteCode'}
      onOpenChange={() => {
        closeModal();
        clearForm();
      }}
    >
      <DialogContent className='overflow-hidden bg-white p-0 text-black dark:bg-zinc-900 dark:text-white'>
        <DialogHeader className='px-6 pt-8'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Join Room By Invite code
          </DialogTitle>
          <DialogDescription className='text-center text-zinc-500 dark:text-zinc-400'>
            Enter invite code to join room with your friends
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-4 px-6'>
              <FormField
                control={form.control}
                name='inviteCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                      Invite code
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-zinc-300/50 text-black dark:bg-black dark:text-white'
                        placeholder='Enter your invite code here'
                        type='text'
                        autoComplete='off'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className='bg-gray-100 dark:bg-zinc-800 px-6 py-4'>
              <Button type='submit' variant='primary' disabled={isLoading}>
                Join
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinByInviteCodeModal;
