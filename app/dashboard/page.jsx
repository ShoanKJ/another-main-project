"use client";

import React from 'react'
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';
import { FileUser } from 'lucide-react'; // Make sure lucide-react is installed
import AddNewInterview from './_componets/AddNewInterview'
import InterviewList from './_componets/InterviewList'

function Dashboard() {
  const { user } = useUser();

  return (
    <div className='p-10'>
      <h2 className='font-bold text-2xl'>DASHBOARD</h2>
      <h2 className='text-gray-500'>Create and start your AI interview</h2>

      <div className='grid grid-cols-1 md:grid-cols-3 my-5 gap-5'>
        {/* Step 1: Link to your Resume Upload page */}
        <Link href={'/dashboard/resume'}>
          <div className='p-10 border rounded-lg bg-secondary
            hover:scale-105 hover:shadow-md cursor-pointer
            transition-all border-dashed flex flex-col items-center justify-center h-[200px]'>
            <FileUser className='h-10 w-10 text-primary mb-2' />
            <h2 className='text-lg font-bold'>Upload CV</h2>
            <p className='text-sm text-gray-500 text-center'>Extract skills from your resume</p>
          </div>
        </Link>

        {/* Your existing AddNewInterview component */}
        <AddNewInterview />
      </div>

      {/* Interview List */}
      <InterviewList />
    </div>
  )
}

export default Dashboard