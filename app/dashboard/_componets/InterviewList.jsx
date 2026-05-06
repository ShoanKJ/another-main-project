"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState, useCallback } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { FileText } from "lucide-react";

// FIX 1: Force Next.js to never cache this component's data fetches
export const dynamic = "force-dynamic";
export const revalidate = 0;

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIX 2: useCallback so refreshList reference is stable
  const getInterviewList = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    setLoading(true);
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(MockInterview.id));
      
      // FIX 3: Always replace state with exact DB result — no merging
      setInterviewList(result ?? []);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
      setInterviewList([]);
    } finally {
      setLoading(false);
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    if (user) getInterviewList();
  }, [user, getInterviewList]);

  return (
    <div className="mt-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <FileText size={24} className="text-indigo-500" />
        Previous Mock Interviews
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-xl p-5 animate-pulse bg-white shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex gap-3">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : interviewList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border shadow-sm">
          <FileText size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No interviews yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first mock interview above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interviewList.map((interview) => (
            <InterviewItemCard
              interview={interview}
              key={interview.mockId}
              refreshList={getInterviewList}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewList;