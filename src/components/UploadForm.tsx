import React, { useState } from 'react';
import { uploadPdf } from '../features/pdf-topic-extractor/api';

export const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [topics, setTopics] = useState<Record<string, string[]>>({});

  const handleUpload = async () => {
    if (!file) return;
    try {
      const result = await uploadPdf(file);
      setTopics(result);
    } catch (error) {
      alert('Failed to extract topics');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Upload PDF</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Extract Topics
      </button>

      {Object.keys(topics).length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Topics per Page</h2>
          <ul className="space-y-2">
            {Object.entries(topics).map(([page, t]) => (
              <li key={page}>
                <strong>{page}</strong>: {t.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
