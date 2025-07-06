import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface Video {
  id: string;
  title: string;
  filename: string;
  views: number;
  createdAt: string;
  uploadedBy: string;
  isPublic: boolean;
  description?: string;
}

interface Stats {
  totalVideos: number;
  totalViews: number;
  publicVideos: number;
}

interface BulkUploadResult {
  name: string;
  status: 'success' | 'error';
  error?: string;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  token?: string;
  videos?: Video[];
  results?: BulkUploadResult[];
}

const AdminPortal: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<Stats>({ totalVideos: 0, totalViews: 0, publicVideos: 0 });
  const [loginStatus, setLoginStatus] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [bulkUploadStatus, setBulkUploadStatus] = useState('');
  const [bulkProgressList, setBulkProgressList] = useState<string[]>([]);

  // Configure axios defaults
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      setIsLoggedIn(true);
      loadVideos();
      updateStats();
    }
  }, [authToken]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const response = await axios.post<ApiResponse>(`${import.meta.env.VITE_BASEURL}/api/admin/login`, {
        username,
        password
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem('adminToken', data.token || '');
        setAuthToken(data.token || null);
        setLoginStatus('Login successful!');
        setTimeout(() => {
          setIsLoggedIn(true);
          setLoginStatus('');
        }, 1000);
      } else {
        setLoginStatus(data.error || 'Login failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setLoginStatus(axiosError.response?.data?.error || 'Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAuthToken(null);
    setIsLoggedIn(false);
    setVideos([]);
    setStats({ totalVideos: 0, totalViews: 0, publicVideos: 0 });
    delete axios.defaults.headers.common['Authorization'];
  };

  const loadVideos = async () => {
    try {
      const response = await axios.get<ApiResponse>(`${import.meta.env.VITE_BASEURL}/api/admin/videos`);
      const data = response.data;

      if (data.success && data.videos) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const updateStats = async () => {
    try {
      const response = await axios.get<ApiResponse>(`${import.meta.env.VITE_BASEURL}/api/admin/videos`);
      const data = response.data;

      if (data.success && data.videos) {
        const videos = data.videos;
        const totalViews = videos.reduce((sum: number, video: Video) => sum + video.views, 0);
        const publicVideos = videos.filter((video: Video) => video.isPublic).length;

        setStats({
          totalVideos: videos.length,
          totalViews,
          publicVideos
        });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const videoFile = (e.currentTarget.elements.namedItem('video') as HTMLInputElement).files?.[0];
    
    if (!videoFile) return;

    formData.append('video', videoFile);
    setShowProgress(true);
    setUploadProgress(0);

    try {
      const response = await axios.post<ApiResponse>(`${import.meta.env.VITE_BASEURL}/api/admin/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(percentComplete);
          }
        }
      });

      const data = response.data;
      if (data.success) {
        setUploadStatus('Video uploaded successfully!');
        (e.target as HTMLFormElement).reset();
        loadVideos();
        updateStats();
      } else {
        setUploadStatus(data.error || 'Upload failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setUploadStatus(axiosError.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setShowProgress(false);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const files = (e.currentTarget.elements.namedItem('videos') as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    const progressList: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      formData.append('videos', files[i]);
      progressList.push(`${files[i].name}: Queued`);
    }

    setBulkProgressList(progressList);
    setBulkUploadStatus('');

    try {
      const response = await axios.post<ApiResponse>(`${import.meta.env.VITE_BASEURL}/api/admin/bulk-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      const data = response.data;
      if (data.success && data.results) {
        setBulkUploadStatus('Bulk upload complete!');
        data.results.forEach((result: BulkUploadResult, idx: number) => {
          const newProgressList = [...progressList];
          if (result.status === 'success') {
            newProgressList[idx] = `${result.name}: Uploaded`;
          } else {
            newProgressList[idx] = `${result.name}: ${result.error || 'Failed'}`;
          }
          setBulkProgressList(newProgressList);
        });
        loadVideos();
        updateStats();
      } else {
        setBulkUploadStatus(data.error || 'Bulk upload failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setBulkUploadStatus(axiosError.response?.data?.error || 'Bulk upload failed. Try again.');
    }
  };

  const toggleVisibility = async (videoId: string) => {
    try {
      const response = await axios.patch<ApiResponse>(`${import.meta.env.VITE_BASEURL}/api/admin/videos/${videoId}/toggle`);
      const data = response.data;

      if (data.success) {
        setUploadStatus(data.message || 'Visibility toggled successfully');
        loadVideos();
        updateStats();
      } else {
        setUploadStatus(data.error || 'Operation failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setUploadStatus(axiosError.response?.data?.error || 'Network error. Please try again.');
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const response = await axios.delete<ApiResponse>(`${import.meta.env.VITE_BASEURL}/api/admin/videos/${videoId}`);
      const data = response.data;

      if (data.success) {
        setUploadStatus('Video deleted successfully!');
        loadVideos();
        updateStats();
      } else {
        setUploadStatus(data.error || 'Delete failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setUploadStatus(axiosError.response?.data?.error || 'Network error. Please try again.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-screen mx-auto p-5 min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-gray-800">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label htmlFor="username" className="block mb-2 font-semibold text-gray-700">Username</label>
              <input type="text" id="username" name="username" required className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:border-purple-500 focus:outline-none" />
            </div>
            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 font-semibold text-gray-700">Password</label>
              <input type="password" id="password" name="password" required className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:border-purple-500 focus:outline-none" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-base transition-transform hover:scale-105 hover:shadow-lg">Login</button>
          </form>
          {loginStatus && (
            <div className={`mt-4 p-3 rounded-lg text-center ${loginStatus.includes('successful') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
              {loginStatus}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen mx-auto p-5 min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-gray-800">
      <button className="absolute top-5 right-5 bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors" onClick={handleLogout}>Logout</button>
      
      <div className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl mb-8">
        <h1 className="text-3xl font-bold text-center mb-3">🎬 Admin Dashboard</h1>
        <p className="text-center text-gray-600">Manage your video content and monitor platform statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg text-center">
          <div className="text-4xl font-bold text-purple-600">{stats.totalVideos}</div>
          <div className="text-gray-600 mt-2">Total Videos</div>
        </div>
        <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg text-center">
          <div className="text-4xl font-bold text-purple-600">{stats.totalViews}</div>
          <div className="text-gray-600 mt-2">Total Views</div>
        </div>
        <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg text-center">
          <div className="text-4xl font-bold text-purple-600">{stats.publicVideos}</div>
          <div className="text-gray-600 mt-2">Public Videos</div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl mb-8">
        <h2 className="text-2xl font-bold mb-6">📤 Upload New Video</h2>
        <form onSubmit={handleUpload}>
          <div className="mb-5">
            <label htmlFor="videoTitle" className="block mb-2 font-semibold text-gray-700">Video Title</label>
            <input type="text" id="videoTitle" name="title" required className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:border-purple-500 focus:outline-none" />
          </div>
          <div className="mb-5">
            <label htmlFor="videoDescription" className="block mb-2 font-semibold text-gray-700">Description (Optional)</label>
            <textarea id="videoDescription" name="description" rows={3} className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:border-purple-500 focus:outline-none"></textarea>
          </div>
          <div className="border-2 border-dashed border-purple-400 rounded-lg p-10 text-center mb-5 hover:border-purple-600 transition-colors">
            <input type="file" id="videoFile" name="video" accept="video/*" required className="hidden" />
            <label htmlFor="videoFile" className="cursor-pointer">
              <div className="text-purple-600 font-semibold">📁 Click to select video file</div>
              <div className="text-sm text-gray-500 mt-2">Supported formats: MP4, WebM, OGG, AVI, MOV, MKV</div>
            </label>
          </div>
          {showProgress && (
            <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden mb-5">
              <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-base transition-transform hover:scale-105 hover:shadow-lg">Upload Video</button>
        </form>
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-lg text-center ${uploadStatus.includes('successfully') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {uploadStatus}
          </div>
        )}
      </div>

      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl mb-8">
        <h2 className="text-2xl font-bold mb-6">📤 Bulk Upload Videos</h2>
        <form onSubmit={handleBulkUpload}>
          <div className="mb-5">
            <label htmlFor="bulkVideoFiles" className="block mb-2 font-semibold text-gray-700">Select Multiple Videos</label>
            <input type="file" id="bulkVideoFiles" name="videos" accept="video/*" multiple required className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:border-purple-500 focus:outline-none" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-base transition-transform hover:scale-105 hover:shadow-lg">Bulk Upload</button>
        </form>
        {bulkUploadStatus && (
          <div className={`mt-4 p-3 rounded-lg text-center ${bulkUploadStatus.includes('complete') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {bulkUploadStatus}
          </div>
        )}
        {bulkProgressList.length > 0 && (
          <div className="mt-4 p-4 bg-white/80 rounded-lg">
            {bulkProgressList.map((progress, index) => (
              <div key={index} className="text-sm text-gray-600 mb-1">{progress}</div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">📋 Manage Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <div key={video.id} className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-lg font-semibold mb-3 text-gray-800">{video.title}</div>
              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <div>📁 {video.filename}</div>
                <div>📊 {video.views} views</div>
                <div>📅 {new Date(video.createdAt).toLocaleDateString()}</div>
                <div>👤 {video.uploadedBy}</div>
                <div>{video.isPublic ? '✅ Public' : '🔒 Private'}</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button 
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
                  onClick={() => toggleVisibility(video.id)}
                >
                  {video.isPublic ? 'Make Private' : 'Make Public'}
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                  onClick={() => deleteVideo(video.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal; 