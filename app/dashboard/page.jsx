"use client";

import React, { useState } from 'react'
import { useUser } from "@clerk/nextjs";
import AddNewInterview from './_componets/AddNewInterview'
import InterviewList from './_componets/InterviewList'

function Dashboard() {
  const { user } = useUser();

  return (
    <div className='p-10'>
      <h2 className='font-bold text-2xl'>DASHBOARD</h2>
      <h2 className='text-gray-500'>create and start your ai interview</h2>

      <div className='grid grid-cols-1 md:grid-cols-3 my-5'>
        <AddNewInterview />
      </div>

      {/* Interview List */}
      <InterviewList />
    </div>
  )
}

export default Dashboard