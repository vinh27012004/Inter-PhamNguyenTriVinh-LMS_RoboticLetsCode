/**
 * Storage Management Page
 * Trang quản trị Object Storage - Upload, xem, xóa files
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Trash2,
  Eye,
  Copy,
  Folder,
  File,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
} from 'lucide-react';
import * as storageAPI from '../../services/storage';

interface StorageFile {
  id: number;
  storage_key: string;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  visibility: string;
  folder_prefix: string;
  uploaded_by_username: string;
  uploaded_at: string;
  file_url?: string;
  presigned_url?: string;
}

export default function StorageManagementPage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPrefix, setCurrentPrefix] = useState('');
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadOptions, setUploadOptions] = useState({
    folderPrefix: 'media/uploads/',
    visibility: 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
    description: '',
  });

  // Load files khi component mount hoặc prefix thay đổi
  useEffect(() => {
    loadFiles();
  }, [currentPrefix]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await storageAPI.listFiles({
        prefix: currentPrefix,
        pageSize: 100,
      });
      setFiles(response.results || response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi tải danh sách files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await storageAPI.uploadFile(file, {
        folderPrefix: uploadOptions.folderPrefix,
        visibility: uploadOptions.visibility,
        description: uploadOptions.description,
      });

      setSuccess(`Upload thành công: ${result.file?.file_name}`);
      await loadFiles(); // Reload danh sách
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: number, fileName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa file "${fileName}"?`)) {
      return;
    }

    try {
      await storageAPI.deleteFile(fileId);
      setSuccess(`Đã xóa file: ${fileName}`);
      await loadFiles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi xóa file');
    }
  };

  const handlePreview = async (file: StorageFile) => {
    setSelectedFile(file);
    
    // Nếu là ảnh hoặc video, hiển thị preview
    if (file.file_type === 'IMAGE' || file.file_type === 'VIDEO') {
      try {
        // Lấy presigned URL nếu chưa có
        let url = file.file_url;
        if (!url) {
          const result = await storageAPI.generatePresignedURL(file.storage_key);
          url = result.url;
        }
        setPreviewUrl(url || null);
      } catch (err) {
        setError('Không thể tải preview');
      }
    }
  };

  const handleCopyUrl = async (file: StorageFile, type: 'public' | 'presigned' = 'public') => {
    try {
      let url = file.file_url;
      
      if (type === 'presigned' || !url) {
        const result = await storageAPI.generatePresignedURL(file.storage_key);
        url = result.url;
      }

      if (url) {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(file.storage_key);
        setTimeout(() => setCopiedUrl(null), 2000);
        setSuccess('Đã copy URL vào clipboard');
      }
    } catch (err) {
      setError('Không thể copy URL');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'VIDEO':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'AUDIO':
        return <Music className="w-5 h-5 text-purple-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản trị Object Storage
          </h1>
          <p className="text-gray-600">
            Upload, xem và quản lý files trên Object Storage
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload File</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Prefix
              </label>
              <input
                type="text"
                value={uploadOptions.folderPrefix}
                onChange={(e) =>
                  setUploadOptions({ ...uploadOptions, folderPrefix: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="media/uploads/"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ví dụ: media/lessons/lesson-1/, media/videos/, media/images/
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  value={uploadOptions.visibility}
                  onChange={(e) =>
                    setUploadOptions({
                      ...uploadOptions,
                      visibility: e.target.value as 'PUBLIC' | 'PRIVATE',
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PRIVATE">Private (Cần signed URL)</option>
                  <option value="PUBLIC">Public (Ai cũng xem được)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả (tùy chọn)
                </label>
                <input
                  type="text"
                  value={uploadOptions.description}
                  onChange={(e) =>
                    setUploadOptions({ ...uploadOptions, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả về file..."
                />
              </div>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang upload...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Chọn file để upload</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Danh sách Files</h2>
            <button
              onClick={loadFiles}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chưa có file nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      File
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Loại
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kích thước
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Visibility
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Upload bởi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.file_type)}
                          <span className="text-sm font-medium">{file.file_name}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {file.folder_prefix}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{file.file_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{formatFileSize(file.file_size)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            file.visibility === 'PUBLIC'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {file.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{file.uploaded_by_username}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(file.file_type === 'IMAGE' || file.file_type === 'VIDEO') && (
                            <button
                              onClick={() => handlePreview(file)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCopyUrl(file, 'public')}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Copy URL"
                          >
                            {copiedUrl === file.storage_key ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(file.id, file.file_name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {selectedFile && previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedFile.file_name}</h3>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                {selectedFile.file_type === 'IMAGE' ? (
                  <img
                    src={previewUrl}
                    alt={selectedFile.file_name}
                    className="max-w-full h-auto rounded"
                  />
                ) : selectedFile.file_type === 'VIDEO' ? (
                  <video
                    src={previewUrl}
                    controls
                    className="max-w-full rounded"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

