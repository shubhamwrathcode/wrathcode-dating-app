/**
 * Licensed stock photography (Unsplash licence) for the demo seed.
 * SmartImage falls back to a gradient monogram if any URL fails to load.
 */
const u = (id: string, w = 800, h = 1100) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const WOMEN_IDS = [
  '1494790108377-be9c29b29330',
  '1438761681033-6461ffad8d80',
  '1534528741775-53994a69daeb',
  '1517841905240-472988babdf9',
  '1544005313-94ddf0286df2',
  '1529626455594-4ff0802cfb7e',
  '1524504388940-b1c1722653e1',
  '1531746020798-e6953c6e8e04',
  '1488426862026-3ee34a7d66df',
  '1580489944761-15a19d654956',
  '1487412720507-e7ab37603c6f',
  '1508214751196-bcfd4ca60f91',
  '1499952127939-9bbf5af6c51c',
  '1503185912284-5271ff81b9a8',
  '1485893086445-ed75865251e0',
  '1502685104226-ee32379fefbe',
  '1546961329-78bef0414d7c',
  '1514315384763-ba401779410f',
];

const MEN_IDS = [
  '1507003211169-0a1dd7228f2d',
  '1500648767791-00dcc994a43e',
  '1506794778202-cad84cf45f1d',
  '1539571696357-5a69c17a67c6',
  '1492562080023-ab3db95bfbce',
  '1504257432389-52343af06ae3',
  '1519085360753-af0119f7cbe7',
  '1522075469751-3a6694fb2f61',
  '1463453091185-61582044d556',
  '1472099645785-5658abf4ff4e',
  '1502823403499-6ccfcf4fb453',
  '1521119989659-a83eee488004',
  '1531427186611-ecfd6d936c79',
  '1500048993953-d23a436266cf',
  '1513956589380-bad6acb9b9d4',
  '1535713875002-d1d0cf377fde',
];

export const WOMEN_PHOTOS = WOMEN_IDS.map(id => u(id));
export const MEN_PHOTOS = MEN_IDS.map(id => u(id));

/** Photos a user can "share" in chat. The tagged one demos the NSFW filter. */
export const CHAT_GALLERY = [
  u('1506905925346-21bda4d32df4', 900, 700),
  u('1507525428034-b723cf961d3e', 900, 700),
  u('1495474472287-4d71bcdd2085', 900, 700),
  u('1504674900247-0877df9cc836', 900, 700),
  u('1469474968028-56623f02e42e', 900, 700),
  `${u('1501785888041-af3ef285b470', 900, 700)}&nsfw=1`,
];

/** Photos offered in the demo photo picker during onboarding / edit profile. */
export const pickerGallery = (gender: 'man' | 'woman' | 'nonbinary') =>
  gender === 'woman' ? WOMEN_PHOTOS.slice(0, 12) : MEN_PHOTOS.slice(0, 12);
