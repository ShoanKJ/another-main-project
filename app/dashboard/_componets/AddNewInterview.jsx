"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { chatSession } from '@/utils/GeminiAIModel'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid'  
import moment from 'moment'          
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false)
  const [jobPosition, setJobPosition] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [jobExperience, setJobExperience] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const router = useRouter()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. Based on this, give me ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in JSON format. Give Question and Answer as fields in JSON. Only return the JSON, no extra text.`

    try {
      const result = await chatSession.sendMessage(InputPrompt)
      const MockJsonResp = result.response
        .text()
        .replace('```json', '')
        .replace('```', '')
        .trim()

      if (MockJsonResp) {
        const resp = await db
          .insert(MockInterview)
          .values({
            mockId: uuidv4(),           // ✅ now works
            jsonMockResp: MockJsonResp,
            jobPosition,
            jobDesc,
            jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format('DD-MM-YYYY'), // ✅ now works
          })
          .returning({ mockId: MockInterview.mockId })

        if (resp) {
          setOpenDialog(false)
          router.push(`/dashboard/interview/${resp[0]?.mockId}`)
        }
      }
    } catch (error) {
      console.error('Error generating interview:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div
        className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-lg cursor-pointer transition duration-300 ease-in-out'
        onClick={() => setOpenDialog(true)}
      >
        <h2 className='font-bold text-lg text-center'>+ Add New Interview</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold'>
              Tell us more about your interview
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to generate your AI mock interview
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className='flex flex-col gap-4 mt-2'>
            <div>
              <label className='block mb-2 font-medium'>
                Job Title <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='e.g. Software Engineer'
                required
                onChange={(e) => setJobPosition(e.target.value)}
              />
            </div>

            <div>
              <label className='block mb-2 font-medium'>
                Job Description / Tech Stack <span className='text-red-500'>*</span>
              </label>
              <textarea
                className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='e.g. React, Node.js, MongoDB'
                required
                onChange={(e) => setJobDesc(e.target.value)}
              />
            </div>

            <div>
              <label className='block mb-2 font-medium'>
                Years of Experience <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='e.g. 2'
                max='50'
                required
                onChange={(e) => setJobExperience(e.target.value)}
              />
            </div>

            <div className='flex gap-3 justify-end mt-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                    Generating...
                  </>
                ) : (
                  'Start Interview'
                )}
              </Button>
            </div>
          </form>

        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewInterview