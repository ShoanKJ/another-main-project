"use client";
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  XCircle,
  ChevronsUpDown,
  Activity,
  Target,
  Zap,
  Eye,
  LayoutList,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Parse feedback — handles both old plain string and new JSON format
const parseFeedback = (raw) => {
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object') return parsed
  } catch (_) {}
  return { feedback: raw, confidence: null, clarity: null, structure: null, strengths: [], improvements: [] }
}

const AnalysisBar = ({ label, value, icon, color }) => {
  if (value === null || value === undefined) return null
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 font-medium text-gray-700">
          {icon} {label}
        </span>
        <span className={`font-bold ${color}`}>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

const Feedback = () => {
  const { interviewId } = useParams();
  const [feedbackList, setFeedbackList] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [averageAnalysis, setAverageAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (interviewId) GetFeedback();
  }, [interviewId]);

  const GetFeedback = async () => {
    setLoading(true);
    const result = await db.select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, interviewId))
      .orderBy(UserAnswer.id);

    setFeedbackList(result);
    setLoading(false);

    const validRatings = result
      .map((item) => parseFloat(item.rating))
      .filter((r) => !isNaN(r));
    const avg = validRatings.length > 0
      ? (validRatings.reduce((s, r) => s + r, 0) / validRatings.length).toFixed(1)
      : "N/A";
    setAverageRating(avg);

    // Compute average analysis scores
    const parsed = result.map(item => parseFeedback(item.feedback))
    const withScores = parsed.filter(p => p.confidence !== null)
    if (withScores.length > 0) {
      setAverageAnalysis({
        confidence: Math.round(withScores.reduce((s, p) => s + p.confidence, 0) / withScores.length),
        clarity: Math.round(withScores.reduce((s, p) => s + p.clarity, 0) / withScores.length),
        structure: Math.round(withScores.reduce((s, p) => s + p.structure, 0) / withScores.length),
      })
    }
  };

  const getRatingColor = (rating) => {
    const n = parseFloat(rating);
    if (n >= 8) return "text-green-600";
    if (n >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-indigo-600 animate-pulse" />
          <p className="mt-4 text-gray-600">Loading your interview feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {feedbackList.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">
              No Interview Feedback Available
            </h2>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              It seems like no feedback has been generated for this interview.
            </p>
            <Button variant="outline" onClick={() => router.replace('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Card */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 shrink-0" />
                <div>
                  <h2 className="text-3xl font-bold text-green-600">Great Job!</h2>
                  <p className="text-gray-600">You've completed your mock interview.</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Overall Rating</p>
                    <p className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
                      {averageRating ? `${averageRating}/10` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Questions</p>
                    <p className="text-2xl font-bold text-indigo-600">{feedbackList.length}</p>
                  </div>
                </div>

                {/* Analysis bars — only show if AI returned scores */}
                {averageAnalysis && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Performance Analysis</p>
                    <div className="flex flex-col gap-3">
                      <AnalysisBar
                        label="Confidence"
                        value={averageAnalysis.confidence}
                        icon={<Zap className="h-4 w-4 text-yellow-500" />}
                        color={averageAnalysis.confidence >= 70 ? 'text-green-600' : averageAnalysis.confidence >= 40 ? 'text-yellow-600' : 'text-red-600'}
                      />
                      <AnalysisBar
                        label="Clarity"
                        value={averageAnalysis.clarity}
                        icon={<Eye className="h-4 w-4 text-blue-500" />}
                        color={averageAnalysis.clarity >= 70 ? 'text-green-600' : averageAnalysis.clarity >= 40 ? 'text-yellow-600' : 'text-red-600'}
                      />
                      <AnalysisBar
                        label="Structure"
                        value={averageAnalysis.structure}
                        icon={<LayoutList className="h-4 w-4 text-purple-500" />}
                        color={averageAnalysis.structure >= 70 ? 'text-green-600' : averageAnalysis.structure >= 40 ? 'text-yellow-600' : 'text-red-600'}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Per Question */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Detailed Interview Feedback</h3>
            <p className="text-sm text-gray-500 mb-4">
              Review each question's performance and get insights for improvement.
            </p>

            {feedbackList.map((item, index) => {
              const parsed = parseFeedback(item.feedback)
              return (
                <Collapsible key={index} className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <Target
                          className={`h-5 w-5 shrink-0 ${
                            parseFloat(item.rating) >= 7 ? "text-green-500"
                            : parseFloat(item.rating) >= 4 ? "text-yellow-500"
                            : "text-red-500"
                          }`}
                        />
                        <span className="font-medium text-gray-800 text-left line-clamp-1">
                          {item.question}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className={`text-sm font-bold ${getRatingColor(item.rating)}`}>
                          {item.rating}/10
                        </span>
                        <ChevronsUpDown className="h-4 text-gray-500" />
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="p-4 bg-white">
                    {/* Answers */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Your Answer</h4>
                        <p className="bg-red-50 p-3 rounded-lg text-sm text-red-900 border border-red-200">
                          {item.userAns || "No answer provided"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Correct Answer</h4>
                        <p className="bg-green-50 p-3 rounded-lg text-sm text-green-900 border border-green-200">
                          {item.correctAns}
                        </p>
                      </div>
                    </div>

                    {/* Feedback text */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Feedback</h4>
                      <p className="bg-blue-50 p-3 rounded-lg text-sm text-primary border border-blue-200">
                        {parsed.feedback || item.feedback}
                      </p>
                    </div>

                    {/* Analysis bars per question */}
                    {parsed.confidence !== null && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                        <h4 className="font-semibold text-gray-700 mb-3">Answer Analysis</h4>
                        <div className="flex flex-col gap-3">
                          <AnalysisBar
                            label="Confidence"
                            value={parsed.confidence}
                            icon={<Zap className="h-4 w-4 text-yellow-500" />}
                            color={parsed.confidence >= 70 ? 'text-green-600' : parsed.confidence >= 40 ? 'text-yellow-600' : 'text-red-600'}
                          />
                          <AnalysisBar
                            label="Clarity"
                            value={parsed.clarity}
                            icon={<Eye className="h-4 w-4 text-blue-500" />}
                            color={parsed.clarity >= 70 ? 'text-green-600' : parsed.clarity >= 40 ? 'text-yellow-600' : 'text-red-600'}
                          />
                          <AnalysisBar
                            label="Structure"
                            value={parsed.structure}
                            icon={<LayoutList className="h-4 w-4 text-purple-500" />}
                            color={parsed.structure >= 70 ? 'text-green-600' : parsed.structure >= 40 ? 'text-yellow-600' : 'text-red-600'}
                          />
                        </div>
                      </div>
                    )}

                    {/* Strengths & Improvements */}
                    {(parsed.strengths?.length > 0 || parsed.improvements?.length > 0) && (
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        {parsed.strengths?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2">✅ Strengths</h4>
                            <ul className="space-y-1">
                              {parsed.strengths.map((s, i) => (
                                <li key={i} className="text-sm text-green-800 bg-green-50 px-3 py-1.5 rounded border border-green-200">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {parsed.improvements?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-orange-700 mb-2">🔧 To Improve</h4>
                            <ul className="space-y-1">
                              {parsed.improvements.map((s, i) => (
                                <li key={i} className="text-sm text-orange-800 bg-orange-50 px-3 py-1.5 rounded border border-orange-200">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )
            })}

            <div className="text-center mt-8">
              <Button onClick={() => router.replace('/dashboard')} className="w-full md:w-auto">
                Return to Dashboard
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Feedback;