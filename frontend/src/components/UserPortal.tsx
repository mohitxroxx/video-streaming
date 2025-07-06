import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Video {
  id: string;
  title: string;
  description?: string;
  views: number;
  createdAt: string;
  duration?: number;
  streamUrl: string;
}

const UserPortal: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [stats, setStats] = useState({ totalVideos: 0, totalViews: 0 });

  useEffect(() => {
    loadVideos();
    
    // Header scroll effect
    const handleScroll = () => {
      const header = document.getElementById('header');
      if (header) {
        if (window.scrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeVideoPlayer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/videos`);
      const data = response.data;

      if (data.success) {
        setVideos(data.videos);
        setFilteredVideos(data.videos);
        updateStats(data.videos);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (videosList: Video[]) => {
    const totalViews = videosList.reduce((sum, video) => sum + video.views, 0);
    setStats({
      totalVideos: videosList.length,
      totalViews
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm) {
      setFilteredVideos([...videos]);
    } else {
      const filtered = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm) ||
        (video.description && video.description.toLowerCase().includes(searchTerm))
      );
      setFilteredVideos(filtered);
    }
  };

  const openVideoPlayer = async (videoId: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/videos/${videoId}`);
      const data = response.data;

      if (data.success) {
        setSelectedVideo(data.video);
        setShowVideoPlayer(true);
        document.title = `${data.video.title} - RoxxMedia`;
      } else {
        alert('Failed to load video. Please try again.');
      }
    } catch (error) {
      console.error('Error loading video:', error);
    }
  };

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setSelectedVideo(null);
    document.title = 'RoxxMedia - Stream Unlimited Content';
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-5 transition-all duration-300" id="header">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <a href="#" className="text-3xl font-bold text-red-600">RoxxMedia</a>
          <div className="flex gap-8 items-center">
            <a href="#home" className="text-white font-medium transition-colors hover:text-red-500">Home</a>
            <a href="#movies" className="text-white font-medium transition-colors hover:text-red-500">Movies</a>
            <a href="#series" className="text-white font-medium transition-colors hover:text-red-500">Series</a>
            <a href="#about" className="text-white font-medium transition-colors hover:text-red-500">About</a>
          </div>
        </nav>
      </header>

      <section className="h-screen bg-gray-800 flex items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-4xl px-5">
          <h1 className="text-6xl font-bold mb-5 text-white drop-shadow-lg">Welcome to RoxxMedia</h1>
          <p className="text-2xl opacity-90 text-white">Unlimited streaming of movies, TV shows, and more</p>
        </div>
      </section>

      <div className="relative z-10 -mt-24 px-5 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="text-5xl font-bold text-white">{stats.totalVideos}</div>
              <div className="text-white/90 text-sm mt-2">Available Titles</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="text-5xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
              <div className="text-white/90 text-sm mt-2">Total Views</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-8 rounded-xl mb-8">
          <input 
            type="text" 
            className="w-full px-5 py-4 bg-gray-800 border-none rounded-full text-white text-lg transition-colors focus:bg-gray-700 focus:outline-none placeholder-gray-400" 
            placeholder="🔍 Search for movies, TV shows, and more..."
            onChange={handleSearch}
          />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-white">Featured Content</h2>
        
        {loading && (
          <div className="text-center py-20 text-white text-lg">
            <div>Loading amazing content...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 my-8 text-center text-white text-lg">
            <div>Something went wrong. Please try again later.</div>
          </div>
        )}

        {!loading && !error && filteredVideos.length === 0 && (
          <div className="text-center py-20 text-white text-lg">
            <div>No content available at the moment.</div>
          </div>
        )}

        {!loading && !error && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {filteredVideos.map(video => (
              <div 
                key={video.id} 
                className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl"
                onClick={() => openVideoPlayer(video.id)}
              >
                <div className="w-full h-40 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center relative overflow-hidden group">
                  {formatDuration(video.duration || 0) !== 'N/A' && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {formatDuration(video.duration || 0)}
                    </div>
                  )}
                  <div className="text-5xl text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">▶</div>
                </div>
                <div className="p-4">
                  <div className="text-white font-semibold mb-2 line-clamp-2">{video.title}</div>
                  <div className="text-gray-400 text-xs mb-2">
                    <span className="mr-4">👁️ {video.views} views</span>
                  </div>
                  <div className="text-gray-300 text-sm line-clamp-2">
                    {video.description || 'Experience amazing content on RoxxMedia'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showVideoPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50" onClick={closeVideoPlayer}>
          <div className="bg-black rounded-xl overflow-hidden max-w-5xl max-h-5xl relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 bg-black/80 text-white border-none rounded-full w-10 h-10 text-xl cursor-pointer z-10 hover:bg-black transition-colors" onClick={closeVideoPlayer}>×</button>
            <video 
              className="w-full h-auto max-h-5xl" 
              controls
              autoPlay
              src={selectedVideo.streamUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
};

export default UserPortal; 