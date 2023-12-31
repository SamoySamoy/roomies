export const TRUTHY = [1, true, '1', 'true'];
export const IMAGE_SIZE_LIMIT_IN_MB = 5;
export const IMAGE_EXT_LIST = [
  'avif',
  'bmp',
  'jpeg',
  'png',
  'tiff',
  'webp',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'tiff',
  'webp',
  'svg',
  'ico',
  'jfif',
  'pjpeg',
  'pjp',
  'apng',
  'avif',
  'cur',
  'dds',
  'jbig',
  'jp2',
  'jpeg2000',
  'jpm',
  'jpx',
  'pbm',
  'pgm',
  'ppm',
  'pnm',
  'pam',
  'exr',
  'hdr',
  'pic',
  'tga',
  'xbm',
  'xpm',
  'yuv',
  'rgb',
  'rgba',
  'bw',
  'rgba',
  'sgi',
  'int',
  'inta',
  'icb',
  'vda',
  'vst',
  'targa',
  'icns',
  'texture',
  'thumb',
  'info',
  'b16',
  'gen',
  'tex',
  'scn',
  'hdr',
  'xwd',
  'jif',
  'jfi',
];
export const MESSAGES_BATCH = 15;
export const ALLOWED_ORIGIN = [
  undefined,
  'http://localhost:5173',
  'http://localhost:8000',
  'http://fall2324w3g13.int3306.freeddns.org',
];
export const CLIENT_LOCATION =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : 'http://fall2324w3g13.int3306.freeddns.org';

export const AVATAR_WIDTH = 300;
export const AVATAR_HEIGHT = 300;
export const MESSAGE_FILE_WIDTH = 1000;
export const MESSAGE_FILE_HEIGHT = 600;
