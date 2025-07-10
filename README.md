# Video Streaming Platform

A full-stack video streaming platform where admins can upload video content to AWS S3 and users can watch the content streamed efficiently in chunks.

Built with:
- **Backend**: Node.js, Express
- **Frontend**: Vite + React
- **Storage**: AWS S3
- **Chunked Streaming**: HTTP Range requests

---

## Features

- Admin uploads video files to AWS S3
- Users stream videos chunk-by-chunk (optimized for performance)
- Modern UI built with Vite + React
- Secure and scalable Node.js backend
- Environment-based configuration


## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/mohitxroxx/video-streaming.git
cd video-streaming
````

### 2. Setup Environment Variables

Create a `.env` file inside the `src/` directory with the following:

```
PORT=5000
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_region
S3_BUCKET=your_bucket_name
```

### 3. Install Dependencies

#### Backend

```bash
cd src
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

## 🚀 Run the Application

### Backend

```bash
cd ../src
npm run dev
```

### Frontend

```bash
cd ../frontend
npm run dev
```

The backend will start on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## How Streaming Works

The server uses HTTP Range requests to stream video content in chunks directly from AWS S3, ensuring fast load times and reduced memory usage. Videos are not fully downloaded only the required segments are fetched as needed.

