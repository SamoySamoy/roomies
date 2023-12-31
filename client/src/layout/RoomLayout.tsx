import { useEffect } from 'react';
import { LoadingPage } from '@/components/Loading';
import RoomSidebar from '@/components/Sidebar/RoomSidebar';
import { useRoomQuery } from '@/hooks/queries';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useCurrent } from '@/hooks/useCurrent';

const RoomLayout = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { setCurrentRoom } = useCurrent();
  const {
    data: room,
    isPending,
    isFetching,
    isRefetching,
    isError,
  } = useRoomQuery(roomId!, {
    groups: true,
    members: true,
    profilesOfMembers: true,
  });

  console.log('In room Layout');

  useEffect(() => {
    console.log('Query room', room);
    setCurrentRoom(room);
  }, [room]);

  if (isPending || isFetching || isRefetching) {
    return <LoadingPage />;
  }

  if (isError || !room) {
    return <Navigate to={'/error-page'} replace />;
  }

  return (
    <div className='h-full'>
      <div className='hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0'>
        <RoomSidebar room={room} />
      </div>
      <main className='h-full md:pl-60'>
        <Outlet />
      </main>
    </div>
  );
};

export default RoomLayout;
