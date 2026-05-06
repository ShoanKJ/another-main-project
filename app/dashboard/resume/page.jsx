'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResumePage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://127.0.0.1:8000/api/resume/parse/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      // store parsed data in localStorage to use in interview setup
      localStorage.setItem('resumeData', JSON.stringify(data));

      router.push('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Upload Your Resume</h1>
        <p className="text-gray-500 mb-6">
          We'll analyse your CV and generate interview questions tailored to your experience.
        </p>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 w-full border rounded-lg p-2 text-sm"
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full bg-black text-white py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Analysing...' : 'Analyse Resume'}
        </button>
      </div>
    </div>
  );
}