/**
 * Robotics API Service
 * Các hàm gọi Backend API endpoints
 */

import axiosInstance from '@/lib/axios';

/**
 * CONTENT API SERVICES
 */

/**
 * Lấy danh sách Programs (Chương trình học)
 * GET /api/content/programs/
 */
export const getPrograms = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/content/programs/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết 1 Program (kèm nested subcourses và lessons)
 * GET /api/content/programs/{slug}/
 */
export const getProgramDetail = async (slug) => {
  try {
    const response = await axiosInstance.get(`/content/programs/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching program ${slug}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách Subcourses (Khóa học con)
 * GET /api/content/subcourses/
 * @param {Object} params - Query params (program, coding_language, search, ordering)
 */
export const getSubcourses = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/content/subcourses/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching subcourses:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết 1 Subcourse (kèm nested lessons)
 * GET /api/content/subcourses/{id}/
 */
export const getSubcourseDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/content/subcourses/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subcourse ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách Lessons (Bài học)
 * GET /api/content/lessons/
 * @param {Object} params - Query params (subcourse, search, ordering)
 */
export const getLessons = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/content/lessons/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết 1 Lesson (Bài học)
 * GET /api/content/lessons/{id}/
 */
export const getLessonDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/content/lessons/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lesson ${id}:`, error);
    throw error;
  }
};

/**
 * Đánh dấu lesson hoàn thành
 * POST /api/content/lessons/{id}/mark_complete/
 */
export const markLessonComplete = async (lessonId) => {
  try {
    const response = await axiosInstance.post(`/content/lessons/${lessonId}/mark_complete/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking lesson ${lessonId} complete:`, error);
    throw error;
  }
};

/**
 * Lấy tiến độ học tập của user
 * GET /api/content/progress/
 */
export const getUserProgress = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/content/progress/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

/**
 * AUTH API SERVICES
 */

/**
 * Lấy profile của user hiện tại
 * GET /api/auth/profile/me/
 */
export const getCurrentProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/profile/me/');
    return response.data;
  } catch (error) {
    console.error('Error fetching current profile:', error);
    throw error;
  }
};

/**
 * Lấy danh sách quyền truy cập của user (Assigned Modules)
 * GET /api/auth/assignments/
 * QUAN TRỌNG: Chỉ trả về assignments của user hiện tại với status='ACTIVE'
 */
export const getAssignedModules = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/auth/assignments/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned modules:', error);
    throw error;
  }
};

/**
 * Lấy danh sách Program IDs mà user có quyền truy cập
 * GET /api/auth/assignments/my_programs/
 */
export const getMyPrograms = async () => {
  try {
    const response = await axiosInstance.get('/auth/assignments/my_programs/');
    return response.data;
  } catch (error) {
    console.error('Error fetching my programs:', error);
    throw error;
  }
};

/**
 * Lấy danh sách Subcourse IDs mà user có quyền truy cập
 * GET /api/auth/assignments/my_subcourses/
 */
export const getMySubcourses = async () => {
  try {
    const response = await axiosInstance.get('/auth/assignments/my_subcourses/');
    return response.data;
  } catch (error) {
    console.error('Error fetching my subcourses:', error);
    throw error;
  }
};

/**
 * Lấy thông tin đầy đủ của user hiện tại
 * GET /api/auth/me/info/
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me/info/');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * AUTH - LOGIN/LOGOUT
 */

/**
 * Login user
 * POST /api/token/ (Django JWT endpoint - cần config)
 */
export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('/token/', {
      username,
      password,
    });
    return response.data; // { access, refresh }
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Logout user (clear tokens từ client-side)
 */
export const logout = () => {
  // Import authHelpers từ axios.js
  const { authHelpers } = require('@/lib/axios');
  authHelpers.clearTokens();
  
  // Redirect về login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * HELPER FUNCTIONS
 */

/**
 * Kiểm tra user có quyền truy cập program không
 */
export const checkProgramAccess = async (programId) => {
  try {
    const { program_ids } = await getMyPrograms();
    return program_ids.includes(programId);
  } catch (error) {
    console.error('Error checking program access:', error);
    return false;
  }
};

/**
 * Kiểm tra user có quyền truy cập subcourse không
 */
export const checkSubcourseAccess = async (subcourseId) => {
  try {
    const { subcourse_ids } = await getMySubcourses();
    return subcourse_ids.includes(subcourseId);
  } catch (error) {
    console.error('Error checking subcourse access:', error);
    return false;
  }
};
