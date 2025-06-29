import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streaming-video'
        
        await mongoose.connect(mongoURI)
        console.log('MongoDB Connected Successfully')
    } catch (error) {
        console.error('MongoDB Connection Error:', error)
        process.exit(1)
    }
}


export default connectDB