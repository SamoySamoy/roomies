import { Navigate } from 'react-router-dom';
import { useRoomsQuery } from '@/hooks/queries';
import { MemberRole } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

const AdminDashboardPage = () => {
  const { auth } = useAuth();
  const { data: rooms, isPending, isError } = useRoomsQuery({
    status: 'joined',
    roomType: 'all',
    members: true,
    groups: true,
  });

  if (isPending) {
    return <div className='p-6 text-sm text-muted-foreground'>Loading admin dashboard...</div>;
  }

  if (isError || !rooms) {
    return <Navigate to='/error-page' />;
  }

  const adminRooms = rooms.filter(room =>
    room.members?.some(member => member.profileId === auth.profileId && member.role === MemberRole.ADMIN),
  );

  const totals = adminRooms.reduce(
    (acc, room) => {
      acc.rooms += 1;
      acc.members += room.members?.length || 0;
      acc.groups += room.groups?.length || 0;
      return acc;
    },
    { rooms: 0, members: 0, groups: 0 },
  );

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold'>Admin Dashboard</h1>
      <p className='mt-1 text-sm text-muted-foreground'>Overview of rooms you administer.</p>

      <div className='mt-6 grid gap-4 sm:grid-cols-3'>
        <div className='rounded-lg border bg-card p-4'>
          <p className='text-sm text-muted-foreground'>Admin Rooms</p>
          <p className='text-2xl font-semibold'>{totals.rooms}</p>
        </div>
        <div className='rounded-lg border bg-card p-4'>
          <p className='text-sm text-muted-foreground'>Total Members</p>
          <p className='text-2xl font-semibold'>{totals.members}</p>
        </div>
        <div className='rounded-lg border bg-card p-4'>
          <p className='text-sm text-muted-foreground'>Total Groups</p>
          <p className='text-2xl font-semibold'>{totals.groups}</p>
        </div>
      </div>

      <div className='mt-6 rounded-lg border bg-card p-4'>
        <h2 className='font-semibold'>Rooms you manage</h2>
        {adminRooms.length === 0 ? (
          <p className='mt-2 text-sm text-muted-foreground'>You are not an admin in any joined room yet.</p>
        ) : (
          <ul className='mt-3 space-y-2'>
            {adminRooms.map(room => (
              <li key={room.id} className='rounded-md border px-3 py-2 text-sm'>
                <span className='font-medium'>{room.name}</span>
                <span className='ml-2 text-muted-foreground'>
                  ({room.members?.length || 0} members, {room.groups?.length || 0} groups)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
