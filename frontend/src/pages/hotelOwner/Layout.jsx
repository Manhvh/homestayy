import React, { useEffect } from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {

  const { isOwner, isAdmin, navigate, toast } = useAppContext();

  useEffect(() => {
    // Only Hotel Owner or Admin can access the Owner Dashboard
    if (!isOwner && !isAdmin) {
      toast.error('Bạn không có quyền truy cập Kênh Chủ nhà.');
      navigate('/');
    }
  }, [isOwner, isAdmin, navigate, toast]);

  return (
    <div className='flex flex-col h-screen bg-gray-50/40'>
      <Navbar />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <div className='flex-1 p-4 pt-6 md:p-8 overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout;