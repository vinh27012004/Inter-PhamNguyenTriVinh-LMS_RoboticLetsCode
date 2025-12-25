/**
 * Storage Management API Service
 * Gọi API Django để quản lý Object Storage
 */
import axiosInstance from '../lib/axios.js';

const BASE_URL = '/storage';

/**
 * Upload file lên Object Storage
 * POST /api/storage/files/upload/
 */
export const uploadFile = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.folderPrefix) {
      formData.append('folder_prefix', options.folderPrefix);
    }
    if (options.visibility) {
      formData.append('visibility', options.visibility);
    }
    if (options.description) {
      formData.append('description', options.description);
    }
    if (options.lessonId) {
      formData.append('lesson_id', options.lessonId);
    }

    const response = await axiosInstance.post(
      `${BASE_URL}/files/upload/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * List files từ database
 * GET /api/storage/files/
 */
export const listFiles = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/files/`, {
      params: {
        prefix: params.prefix || '',
        file_type: params.fileType || '',
        lesson_id: params.lessonId || '',
        page: params.page || 1,
        page_size: params.pageSize || 20,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

/**
 * Get file detail
 * GET /api/storage/files/{id}/
 */
export const getFileDetail = async (fileId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/files/${fileId}/`);
    return response.data;
  } catch (error) {
    console.error('Error getting file detail:', error);
    throw error;
  }
};

/**
 * Delete file
 * DELETE /api/storage/files/{id}/
 */
export const deleteFile = async (fileId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/files/${fileId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Generate presigned URL
 * POST /api/storage/files/generate-presigned-url/
 */
export const generatePresignedURL = async (storageKey, expiration = 3600) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/files/generate-presigned-url/`,
      {
        storage_key: storageKey,
        expiration: expiration,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

/**
 * List objects trực tiếp từ Object Storage
 * GET /api/storage/files/list-objects/
 */
export const listObjects = async (prefix = '', maxKeys = 1000) => {
  try {
    const response = await axiosInstance.get(
      `${BASE_URL}/files/list-objects/`,
      {
        params: {
          prefix: prefix,
          max_keys: maxKeys,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
};

