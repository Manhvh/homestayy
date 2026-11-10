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
