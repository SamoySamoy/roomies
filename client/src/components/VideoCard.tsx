import { useRef, useEffect } from 'react';
import { MicOff, Mic, Video, VideoOff } from 'lucide-react';
import MemberAvatar from './MemberAvatar';
import { Stream } from 'stream';
import { useAuth } from '@/hooks/useAuth';

export type VideoProps = {
  stream: MediaStream | null;
  profileId: string;
  imageUrl: string;
  email: string;
} & (
  | {
      type: 'camera';
      cameraOn: boolean;
      micOn: boolean;
    }
  | {
      type: 'screen';
    }
);

const VideoCard = (props: VideoProps) => {
  const { auth } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = props.stream;
    }
    // @ts-expect-error
  }, [props.stream, props.micOn, props.cameraOn]);

  const MicIcon = props.type === 'camera' && props.micOn ? Mic : MicOff;
  const VideoIcon = props.type === 'camera' && props.cameraOn ? Video : VideoOff;

  return (
    <div className='h-full w-[300px] gap-y-4 md:flex-1 bg-[#E3E5E8] dark:bg-[#1E1F22] relative flex md:flex-row flex-col items-center justify-center rounded-lg shadow-md shadow-slate-800/30 dark:shadow-slate-200/10'>
      {props.type === 'screen' && (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          className='h-full w-full object-cover rounded-2xl'
        />
      )}
      {props.type === 'camera' && props.cameraOn && (
        <video
          ref={videoRef}
          muted={auth.profileId === props.profileId ? true : !props.micOn}
          autoPlay
          playsInline
          className='h-full w-full object-cover rounded-2xl'
        />
      )}
      {props.type === 'camera' && !props.cameraOn && (
        <>
          <MemberAvatar
            src={props.imageUrl}
            fallback={<p>{props.email.split('@')[0].slice(0, 2)}</p>}
            className='sm:w-[70px] md:w-[110px] lg:w-[150px] sm:h-[70px] md:h-[110px] lg:h-[150px] rounded-full'
          />
          <video
            ref={videoRef}
            muted={auth.profileId === props.profileId ? true : !props.micOn}
            autoPlay
            playsInline
            className='h-0 w-0 object-cover rounded-2xl'
          />
        </>
      )}

      <div className='gap-y-2 md:absolute bottom-4 inset-x-4 flex flex-col md:flex-row items-center justify-between'>
        <p className='font-bold text-sm text-slate-800 dark:text-slate-500/90'>{props.email}</p>
        {props.type === 'camera' && (
          <div className='flex items-center gap-x-4'>
            <MicIcon className='w-6 h-6 text-black dark:text-white' />
            <VideoIcon className='w-6 h-6 text-black dark:text-white' />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;