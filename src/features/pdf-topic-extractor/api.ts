import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export const uploadPdf = async (file: File, onProgress?: (progress: number) => void) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = Date.now().toString();

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('fileId', fileId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', file.name);

    try {
      await axios.post(`${API_URL}/pdf/upload-chunk`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            ((chunkIndex * CHUNK_SIZE + progressEvent.loaded) / file.size) * 100
          );
          onProgress?.(percentCompleted);
        },
      });
    } catch (error) {
      console.error('Error uploading chunk:', error);
      throw error;
    }
  }

  try {
    const response = await axios.post(`${API_URL}/pdf/complete-upload`, {
      fileId,
      fileName: file.name,
      totalChunks,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error completing upload:', error);
    throw error;
  }
};

// export const analyzePdf = async (file: File) => {
//   const formData = new FormData();
//   formData.append('file', file);
  
//   const response = await axios.post(`${API_URL}/pdf/analyze`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
  
//   return response.data;
// };

export const generateQuiz = async (fileName: string, page?: number) => {
  const formData = new FormData();
  formData.append('fileName', fileName);
  
  const params = new URLSearchParams();
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
