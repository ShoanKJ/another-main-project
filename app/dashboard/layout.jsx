import React from 'react'
import Header from './_componets/Header'
import ChatBot from './_componets/ChatBot'

function DashboardLayout({ children }) {
  return (
    <div>
      <Header />
      <div className='mx-5 md:mx-20 lg:mx-36'>
        {children}
      </div>
      <ChatBot />
    </div>
  )
}

export default DashboardLayout