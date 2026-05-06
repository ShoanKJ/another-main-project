"use client"
import React, { useState, useEffect } from 'react'
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

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false)
  const [jobPosition, setJobPosition] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [jobExperience, setJobExperience] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('resumeData')
    if (stored) setResumeData(JSON.parse(stored))
  }, [])

  const handleClose = () => {
    setOpenDialog(false)
    setJobPosition('')
    setJobDesc('')
    setJobExperience('')
    setQuestionCount(5)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const skillsContext = resumeData?.skills?.length
      ? `The candidate has experience with: ${resumeData.skills.join(', ')}.`
      : ''

    const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. ${skillsContext} Based on this, give me ${questionCount} interview questions with answers in JSON format. Give Question and Answer as fields in JSON. Only return the JSON, no extra text.`

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
            mockId: uuidv4(),
            jsonMockResp: MockJsonResp,
            jobPosition,
            jobDesc,
            jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format('DD-MM-YYYY'),
          })
          .returning({ mockId: MockInterview.mockId })

        if (resp) {
          handleClose()
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

      <Dialog open={openDialog} onOpenChange={handleClose}>
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

            {/* Resume detected banner */}
            {resumeData?.skills?.length > 0 && (
              <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <p className='text-green-700 text-sm font-medium'>
                    ✅ Resume detected — questions will be tailored to your skills:
                  </p>
                  <button
                    type='button'
                    onClick={() => {
                      localStorage.removeItem('resumeData')
                      setResumeData(null)
                    }}
                    className='text-xs text-red-500 hover:text-red-700 underline ml-3 shrink-0'
                  >
                    Clear Resume
                  </button>
                </div>
                <p className='text-green-600 text-xs mt-1'>
                  {resumeData.skills.join(', ')}
                </p>
              </div>
            )}

            {/* Job Title */}
            <div>
              <label className='block mb-2 font-medium'>
                Job Title <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='e.g. Software Engineer'
                required
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
              />
            </div>

            {/* Job Description */}
            <div>
              <label className='block mb-2 font-medium'>
                Job Description / Tech Stack <span className='text-red-500'>*</span>
              </label>
              <textarea
                className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='e.g. React, Node.js, MongoDB'
                required
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
            </div>

            {/* Years of Experience */}
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
                value={jobExperience}
                onChange={(e) => setJobExperience(e.target.value)}
              />
            </div>

            {/* Question Count */}
            <div>
              <label className='block mb-2 font-medium'>
                Number of Questions
              </label>
              <div className='flex gap-2'>
                {[3, 5, 7, 10].map((count) => (
                  <button
                    key={count}
                    type='button'
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                      questionCount === count
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <p className='text-xs text-gray-400 mt-1'>
                More questions = longer interview · currently selected: {questionCount}
              </p>
            </div>

            {/* Actions */}
            <div className='flex gap-3 justify-end mt-2'>
              <Button type='button' variant='ghost' onClick={handleClose}>
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