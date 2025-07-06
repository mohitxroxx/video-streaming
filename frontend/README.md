# RoxxMedia Frontend

A modern React application built with Vite for the RoxxMedia video streaming platform.

## Features

### User Portal (`/`)
- **Netflix-style Interface**: Modern, responsive design with dark theme
- **Video Browsing**: Browse and search through available videos
- **Video Player**: Full-screen video player with controls
- **Search Functionality**: Real-time search through video titles and descriptions
- **Statistics**: View platform statistics (total videos, total views)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Admin Portal (`/admin`)
- **Secure Login**: Admin authentication system
- **Video Management**: Upload, delete, and manage videos
- **Bulk Upload**: Upload multiple videos at once
- **Visibility Control**: Toggle video public/private status
- **Progress Tracking**: Real-time upload progress with progress bars
- **Statistics Dashboard**: View platform analytics
- **File Support**: Supports MP4, WebM, OGG, AVI, MOV, MKV formats

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
   - User Portal: `http://localhost:5173/`
   - Admin Portal: `http://localhost:5173/admin`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Integration

The frontend communicates with the backend API through the following endpoints:

### User Endpoints
- `GET /api/videos` - Get all public videos
- `GET /api/videos/:id` - Get specific video details

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/videos` - Get all videos (admin)
- `POST /api/admin/upload` - Upload single video
- `POST /api/admin/bulk-upload` - Upload multiple videos
- `PATCH /api/admin/videos/:id/toggle` - Toggle video visibility
- `DELETE /api/admin/videos/:id` - Delete video

## Project Structure

```
src/
├── components/
│   ├── AdminPortal.tsx      # Admin interface component
│   ├── AdminPortal.css      # Admin styles
│   ├── UserPortal.tsx       # User interface component
│   └── UserPortal.css       # User styles
├── App.tsx                  # Main app with routing
├── App.css                  # Global app styles
├── main.tsx                 # App entry point
└── index.css                # Global styles
```

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Styling with modern features

## Development

### Key Features Implemented

1. **Responsive Design**: Both portals work seamlessly across all device sizes
2. **Modern UI/UX**: Netflix-inspired design with smooth animations
3. **Real-time Updates**: Live progress tracking for uploads
4. **Error Handling**: Comprehensive error states and user feedback
5. **Accessibility**: Keyboard shortcuts and screen reader support
6. **Performance**: Optimized rendering and lazy loading

### Customization

The styling can be easily customized by modifying the CSS files:
- `AdminPortal.css` - Admin interface styles
- `UserPortal.css` - User interface styles
- `App.css` - Global application styles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the RoxxMedia video streaming platform.
