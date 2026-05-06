"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import { Mic, StopCircle, Loader2, Camera, CameraOff } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import Webcam from "react-webcam";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  onAnswerSave,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Reset answer when question changes
    setUserAnswer("");
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [activeQuestionIndex]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript.trim()) {
        setUserAnswer((prev) => (prev + " " + finalTranscript).trim());
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone access.");
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const StartStopRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.info("Recording stopped");
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info("Recording started - speak now");
      } catch (error) {
        console.error("Recording start error:", error);
        toast.error("Failed to start recording");
      }
    }
  };

  const UpdateUserAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please provide an answer before saving");
      return;
    }

    setLoading(true);
    console.log("Saving answer:", userAnswer);

    try {
      const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.Question}, User Answer: ${userAnswer}. Please give a rating out of 10 and feedback on improvement in JSON format with rating and feedback fields only. Return only JSON, no extra text.`;

      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = result.response
        .text()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const JsonfeedbackResp = JSON.parse(mockJsonResp);
      console.log("Feedback:", JsonfeedbackResp);

      await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.Question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
        userAns: userAnswer,
        feedback: JsonfeedbackResp?.feedback,
        rating: String(JsonfeedbackResp?.rating),
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-YYYY"),
      });

      toast.success("Answer recorded successfully!");
      setUserAnswer("");
      setIsRecording(false);
      onAnswerSave?.();
    } catch (error) {
      toast.error("Failed to save answer");
      console.error("Answer save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col relative">
      {/* Full screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex flex-col justify-center items-center">
          <Loader2 className="h-16 w-16 animate-spin text-white mb-4" />
          <p className="text-white text-lg">Saving your answer...</p>
        </div>
      )}

      {/* Webcam */}
      <div className="flex flex-col my-10 justify-center items-center bg-black rounded-lg p-5 w-full">
        {webcamEnabled ? (
          <Webcam
            mirrored={true}
            style={{ height: 200, width: "100%" }}
          />
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center bg-gray-800 rounded-lg">
            <p className="text-gray-400">Webcam Disabled</p>
          </div>
        )}

        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => setWebcamEnabled(!webcamEnabled)}
        >
          {webcamEnabled ? (
            <><CameraOff className="mr-2 h-4 w-4" /> Disable Webcam</>
          ) : (
            <><Camera className="mr-2 h-4 w-4" /> Enable Webcam</>
          )}
        </Button>
      </div>

      {/* Record Button */}
      <Button
        disabled={loading}
        variant="outline"
        className="my-5 w-full"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <span className="text-red-600 animate-pulse flex gap-2 items-center">
            <StopCircle className="h-4 w-4" /> Stop Recording
          </span>
        ) : (
          <span className="flex gap-2 items-center">
            <Mic className="h-4 w-4" /> Record Answer
          </span>
        )}
      </Button>

      {/* Answer Textarea */}
      <textarea
        className="w-full h-32 p-4 border rounded-md text-gray-800 resize-none"
        placeholder="Your answer will appear here as you speak, or type directly..."
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />

      {/* Save Button */}
      <Button
        className="mt-4 w-full"
        onClick={UpdateUserAnswer}
        disabled={loading || !userAnswer.trim()}
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          "Save Answer"
        )}
      </Button>
    </div>
  );
};

export default RecordAnswerSection;