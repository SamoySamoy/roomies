import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ServerImageUpload from '../ServerImageUpload';
import useModal from '@/hooks/useModal';

const CreateServerModal = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [serverName, setServerName] = useState('');
  const { isOpen, modalType, closeModal } = useModal();
  const isSummitable = Boolean(serverName.trim() && imageFile);

  const clearForm = () => {
    setImageFile(null);
    setServerName('');
  };

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('serverName', serverName);
      formData.append('imageFile', imageFile!);

      clearForm();
      closeModal();
    } catch (err) {
      console.log(err);
      clearForm();
    }
  };

  return (
    <Dialog
      open={isOpen && modalType === 'createServer'}
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
        <div className='flex flex-col gap-4 px-6'>
          <div className='flex flex-col items-center justify-center gap-2'>
            <label className='text-xs font-bold uppercase text-zinc-500 dark:text-secondary/70'>
              Server image
            </label>
            <ServerImageUpload onChange={f => setImageFile(f)} />
          </div>
          <div>
            <label className='text-xs font-bold uppercase text-zinc-500 dark:text-secondary/70'>
              Server name
            </label>
            <Input
              disabled={false}
              className='border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0'
              placeholder='Enter server name'
              value={serverName}
              onChange={e => setServerName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className='bg-gray-100 px-6 py-4'>
          <Button disabled={!isSummitable} onClick={onSubmit} variant='primary'>
            <span className='text-foreground'>Create</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServerModal;
