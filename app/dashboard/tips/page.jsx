import React from 'react'
import Link from 'next/link'

const tips = [
  {
    category: 'Before the interview',
    items: [
      'Research the company and the role thoroughly before your session.',
      'Keep your resume handy — many questions will be based on your experience.',
      'Find a quiet place with good lighting and a stable internet connection.',
      'Test your microphone and camera before starting.',
    ],
  },
  {
    category: 'During the interview',
    items: [
      'Take a breath before answering — it is okay to pause for 2-3 seconds.',
      'Use the STAR method for behavioural questions: Situation, Task, Action, Result.',
      'Speak clearly and at a steady pace — avoid rushing your answers.',
      'Be specific — use real examples from your experience instead of generic answers.',
      'If you do not know an answer, say so honestly and explain how you would find out.',
    ],
  },
  {
    category: 'After the interview',
    items: [
      'Always review your AI feedback carefully — do not skip it.',
      'Focus on the lowest rated answers first and practice those specifically.',
      'Retake the same interview after a few days to track your improvement.',
      'Try interviews for different roles to broaden your preparation.',
    ],
  },
  {
    category: 'Common mistakes to avoid',
    items: [
      'Giving vague or one-line answers — always elaborate.',
      'Badmouthing previous employers or teammates.',
      'Not asking questions at the end of a real interview.',
      'Memorising answers word for word — it sounds unnatural.',
      'Skipping practice because you feel confident — consistency matters.',
    ],
  },
]

export default function Tips() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview tips</h1>
      <p className="text-gray-500 mb-10">
        Practical advice to help you perform your best — in mock interviews and real ones.
      </p>

      <div className="flex flex-col gap-10">
        {tips.map((section) => (
          <div key={section.category}>
            <h2 className="text-base font-semibold text-indigo-700 mb-4">
              {section.category}
            </h2>
            <ul className="flex flex-col gap-3">
              {section.items.map((tip) => (
                <li key={tip} className="flex gap-3 items-start text-sm text-gray-500">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0"></span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-indigo-50 rounded-xl p-6">
        <h3 className="text-base font-semibold text-indigo-900 mb-1">Ready to practice?</h3>
        <p className="text-sm text-indigo-700 mb-4">
          Put these tips to use — start a mock interview now.
        </p>
        <Link href="/dashboard" className="inline-block bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}