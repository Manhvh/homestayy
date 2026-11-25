export const getAvatarUrl = (user) => {
  if (user?.image) return user.image;
  const seed = encodeURIComponent(user?.username || 'User');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
};

export const createRandomAvatarUrl = () => {
  const randomSeed = Math.random().toString(36).substring(2, 9);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
};

export const getRoleBadgeInfo = (role) => {
  switch (role) {
    case 'admin':
      return { text: 'Quản trị viên', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'hotelOwner':
      return { text: 'Chủ Homestay', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    default:
      return { text: 'Khách hàng', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
};

/**
 * Parse a date string (YYYY-MM-DD / ISO) or Date object into local midnight Date
 * avoiding UTC timezone shift bugs (e.g., 00:00-06:59 in GMT+7).
 */
export const parseLocalDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const str = String(value).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Format a Date or date string as local YYYY-MM-DD
 */
export const formatLocalDateYMD = (value) => {
  const d = parseLocalDateOnly(value);
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Return today's date in local timezone as YYYY-MM-DD (never shifts to yesterday in GMT+7 mornings)
 */
export const getLocalTodayYMD = () => formatLocalDateYMD(new Date());
