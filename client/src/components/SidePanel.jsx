import React from 'react';
export default function SidePanel({open,onClose,children}){
 if(!open) return null;
 return(<div className='fixed inset-0 z-50 flex'>
  <div className='flex-1 bg-black/40' onClick={onClose}/>
  <div className='w-96 bg-white p-4 overflow-y-auto'>
    <button className='float-right text-xl' onClick={onClose}>×</button>
    {children}
  </div></div>);
}
