"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { db } from "@/utils/db";
import { eq } from "drizzle-orm";
import { MockInterview } from "@/utils/schema";
import { Trash2, Briefcase, Clock, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const InterviewItemCard = ({ interview, refreshList }) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onStart = () => {
    router.push(`/dashboard/interview/${interview?.mockId}`);
  };

  const onFeedbackPress = () => {
    router.push(`/dashboard/interview/${interview?.mockId}/feedback`);
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await db.delete(MockInterview).where(eq(MockInterview.mockId, interview?.mockId));
      setIsDialogOpen(false);
      toast.success("Interview deleted successfully");
      refreshList?.();
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col overflow-hidden">

        {/* Delete button */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <Trash2 size={16} />
        </button>

        {/* Job position badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
            <Briefcase size={18} className="text-indigo-600" />
          </div>
          <h2 className="font-bold text-gray-800 text-base truncate pr-6 min-w-0">
            {interview?.jobPosition}
          </h2>
        </div>

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={14} className="shrink-0" />
            <span>{interview?.jobExperience} Year(s) Experience</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays size={14} className="shrink-0" />
            <span>{interview?.createdAt}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 min-w-0 text-sm"
            onClick={onFeedbackPress}
          >
            Feedback
          </Button>
          <Button
            size="sm"
            className="flex-1 min-w-0 text-sm bg-indigo-600 hover:bg-indigo-700"
            onClick={onStart}
          >
            Start
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Delete Interview?</h3>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              This will permanently delete{" "}
              <span className="font-medium text-gray-700">"{interview?.jobPosition}"</span>.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewItemCard;