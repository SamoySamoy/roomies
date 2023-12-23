import React from 'react';
import { Loader2 } from 'lucide-react';
import LoadingIcon from './LoadingIcon';

const LoadingOverlay = () => {
  return (
    <div className='fixed inset-y-0 inset-x-0 z-50 bg-slate-800/80 flex justify-center items-center'>
      <LoadingIcon />
    </div>
  );
};

export default LoadingOverlay;
