import React from 'react'
import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: 'Create an interview',
    description: 'Click Add New Interview on the dashboard. Enter your job role, job description, and years of experience. Our AI will generate custom questions just for you.',
  },
  {
    number: '02',
    title: 'Start your mock interview',
    description: 'Click Start on any interview. Allow camera and microphone access. You will be shown one question at a time — answer each one out loud using speech to text.',
  },
  {
    number: '03',
    title: 'Get AI feedback',
    description: 'After answering all questions, you are automatically taken to the feedback page. The AI rates each answer and gives you detailed suggestions to improve.',
  },
  {
    number: '04',
    title: 'Review and improve',
    description: 'Go back to your dashboard anytime to retake interviews or review past feedback. The more you practice, the better you get.',
  },
]

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">How it works</h1>
      <p className="text-gray-500 mb-12">
        New here? Follow these 4 simple steps to get started with your AI mock interview.
      </p>

      <div className="flex flex-col gap-8">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-6 items-start">
            <div className="text-3xl font-bold text-indigo-200 w-12 shrink-0">
              {step.number}
            </div>
            <div className="border-l-2 border-indigo-100 pl-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-indigo-50 rounded-xl p-6">
        <h3 className="text-base font-semibold text-indigo-900 mb-1">Ready to start?</h3>
        <p className="text-sm text-indigo-700 mb-4">Head back to the dashboard and create your first mock interview.</p>
        <Link href="/dashboard" className="inline-block bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}