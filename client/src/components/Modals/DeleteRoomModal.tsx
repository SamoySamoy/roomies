import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/useModal';
import { useDeleteRoomMutation } from '@/hooks/mutations';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const DeleteRoomModal = () => {
  const {
    isOpen,
    modalType,
    closeModal,
    data: { room },
  } = useModal();
  const { toast } = useToast();
  const navigate = useNavigate();
  const mutation = useDeleteRoomMutation();
  const onDelete = () => {
    mutation.mutate(
      {
        roomId: room?.id!,
      },
      {
        onSuccess: () => {
          toast({
            description: 'Delete room successfully',
            variant: 'success',
          });
          closeModal();
          navigate('/my-rooms');
        },
        onError: () => {
          toast({
            description: 'Delete room failed',
            variant: 'error',
          });
        },
        onSettled: () => {
          mutation.reset();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen && modalType === 'deleteRoom'} onOpenChange={closeModal}>
      <DialogContent className='overflow-hidden bg-white p-0 text-black dark:bg-zinc-900 dark:text-white'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>Delete Room</DialogTitle>
          <DialogDescription className='text-center text-zinc-500 dark:text-zinc-400'>
            Are you sure you want to delete this room <br />
            <span className='text-indigo-500 font-semibold'>{room?.name}</span> will be permanently
            deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='bg-gray-100 dark:bg-zinc-800 px-6 py-4'>
          <div className='flex items-center justify-between w-full'>
            <Button disabled={mutation.isPending} onClick={closeModal} variant='destructive'>
              Cancel
            </Button>
            <Button disabled={mutation.isPending} variant='primary' onClick={onDelete}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoomModal;
