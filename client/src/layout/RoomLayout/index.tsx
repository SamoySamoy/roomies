import { Outlet, useNavigate } from 'react-router-dom';
import ServerListSidebar from '@/components/ServerListSidebar';
import ChannelListSidebar from '@/components/ChannelListSidebar';
import { useEffect } from 'react';

const RoomLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('channels/213123', {
      replace: true,
    });
  }, []);

  return (
    <div className='h-full'>
      <div className='fixed inset-y-0 z-30 hidden h-full w-[72px] flex-col md:flex'>
        <ServerListSidebar />
      </div>
      <div className='h-full md:pl-[72px]'>
        <div className='h-full'>
          <div className='hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0'>
            <ChannelListSidebar />
          </div>
          <main className='h-full md:pl-60'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default RoomLayout;
