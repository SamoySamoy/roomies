import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/ThemeToggle';
import {
  HomeButton,
  InviteButton,
  LogoutButton,
  MyRoomsButton,
  ProfileButton,
} from '@/components/Sidebar/SidebarButton';

const ExploreSidebar = () => {
  return (
    <div className='flex h-full w-full flex-col items-center space-y-4 bg-[#E3E5E8] py-3 text-primary dark:bg-[#1E1F22]'>
      <HomeButton />
      <MyRoomsButton />
      <InviteButton />
      <Separator className='mx-auto h-[2px] w-10 rounded-md bg-zinc-300 dark:bg-zinc-700' />
      <ScrollArea className='w-full flex-1'></ScrollArea>
      <Separator className='mx-auto h-[2px] w-10 rounded-md bg-zinc-300 dark:bg-zinc-700' />
      <div className='mt-auto flex flex-col items-center gap-y-4 pb-3'>
        <ThemeToggle />
        <ProfileButton />
        <LogoutButton />
      </div>
    </div>
  );
};

export default ExploreSidebar;
