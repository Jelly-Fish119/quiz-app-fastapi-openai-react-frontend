import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/pdf/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const analyzePdf = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/pdf/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const generateQuiz = async (file: File, chapter?: string, page?: number) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const params = new URLSearchParams();
  if (chapter) params.append('chapter', chapter);
  if (page) params.append('page', page.toString());
  
  const response = await axios.post(
    `${API_URL}/pdf/generate-quiz?${params.toString()}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
};
