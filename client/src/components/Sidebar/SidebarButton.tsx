import { Plus, Compass, LogOut, Home, Users, LinkIcon } from 'lucide-react';
import ActionTooltip from '@/components/ActionToolTip';
import { Link, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '@/hooks/mutations';
import { useToast } from '@/components/ui/use-toast';
import { useModal } from '@/hooks/useModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { getFileUrl } from '@/lib/utils';
import { CLIENT_AVATAR_WIDTH, CLIENT_AVATAR_HEIGHT } from '@/lib/constants';

export const HomeButton = () => {
  return (
    <div>
      <ActionTooltip
        side='right'
        align='center'
        label={<p className='text-sm font-bold'>To Landing page</p>}
      >
        <Link to={'/'}>
          <button className='group flex items-center'>
            <div className='mx-3 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-[24px] bg-background transition-all group-hover:rounded-[16px] group-hover:bg-emerald-500 dark:bg-neutral-700'>
              <Home className='text-emerald-500 transition group-hover:text-white' size={25} />
            </div>
          </button>
        </Link>
      </ActionTooltip>
    </div>
  );
};

export const MyRoomsButton = () => {
  return (
    <div>
      <ActionTooltip
        side='right'
        align='center'
        label={<p className='text-sm font-bold'>My rooms</p>}
      >
        <Link to={'/my-rooms'}>
          <button className='group flex items-center'>
            <div className='mx-3 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-[24px] bg-background transition-all group-hover:rounded-[16px] group-hover:bg-blue-500 dark:bg-neutral-700'>
              <Users className='text-blue-500 transition group-hover:text-white' size={25} />
            </div>
          </button>
        </Link>
      </ActionTooltip>
    </div>
  );
};

export const ExploreButton = () => {
  return (
    <div>
      <ActionTooltip
        side='right'
        align='center'
        label={<p className='text-sm font-bold'>Explore more rooms</p>}
      >
        <Link to={'/explore'}>
          <button className='group flex items-center'>
            <div className='mx-3 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-[24px] bg-background transition-all group-hover:rounded-[16px] group-hover:bg-indigo-500 dark:bg-neutral-700'>
              <Compass className='text-indigo-500 transition group-hover:text-white' size={25} />
            </div>
          </button>
        </Link>
      </ActionTooltip>
    </div>
  );
};

export const CreateRoomButton = () => {
  const { openModal } = useModal();

  return (
    <div>
      <ActionTooltip
        side='right'
        align='center'
        label={<p className='text-sm font-bold'>Create a room</p>}
      >
        <button
          onClick={() =>
            openModal({
              modalType: 'createRoom',
            })
          }
          className='group flex items-center'
        >
          <div className='mx-3 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-[24px] bg-background transition-all group-hover:rounded-[16px] group-hover:bg-lime-600 dark:bg-neutral-700'>
            <Plus className='text-lime-600 transition group-hover:text-white' size={25} />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
};

export const InviteButton = () => {
  const { openModal } = useModal();

  return (
    <div>
      <ActionTooltip
        side='right'
        align='center'
        label={<p className='text-sm font-bold'>Join a room by invite code</p>}
      >
        <button
          onClick={() =>
            openModal({
              modalType: 'joinByInviteCode',
            })
          }
          className='group flex items-center'
        >
          <div className='mx-3 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-[24px] bg-background transition-all group-hover:rounded-[16px] group-hover:bg-amber-500 dark:bg-neutral-700'>
            <LinkIcon className='text-amber-500 transition group-hover:text-white' size={25} />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
};
export const LogoutButton = () => {
  const mutation = useLogoutMutation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const onLogout = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          description: 'Logout successfully',
          variant: 'success',
        });
        navigate('/');
      },
      onError: () => {
        toast({
          description: 'Logout failed',
          variant: 'error',
        });
      },
    });
  };

  return (
    <div>
      <ActionTooltip
        side='right'
        align='center'
        label={<p className='text-sm font-bold'>Logout</p>}
      >
        <button onClick={onLogout} className='group flex items-center'>
          <div className='mx-3 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-[24px] bg-background transition-all group-hover:rounded-[16px] group-hover:bg-rose-500 dark:bg-neutral-700'>
            <LogOut className='text-rose-500 transition group-hover:text-white' size={25} />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
};

export const ProfileButton = () => {
  const { openModal } = useModal();
  const { auth } = useAuth();

  return (
    <div>
      <ActionTooltip
        side='right'
        align='center'
        label={<p className='text-sm font-bold'>Your profile</p>}
      >
        <button
          onClick={() =>
            openModal({
              modalType: 'profile',
            })
          }
        >
          <Avatar
            className={`duration-400 h-[${CLIENT_AVATAR_HEIGHT}px] w-[${CLIENT_AVATAR_WIDTH}px] cursor-pointer transition-all hover:scale-110`}
          >
            <AvatarImage src={getFileUrl(auth.imageUrl)} />
            <AvatarFallback>{auth.email?.split('@')[0].slice(0, 2)}</AvatarFallback>
          </Avatar>
        </button>
      </ActionTooltip>
    </div>
  );
};
