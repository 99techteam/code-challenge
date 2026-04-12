import { connect } from 'mongoose'

export const connectToMongoDB = async () => {
  try {
    const mongoUri = process.env['MONGO_URI']
    const dbName = process.env['MONGO_DB']
    if (!mongoUri || !dbName) {
      throw new Error(
        'MONGO_URI and MONGO_DB must be defined in environment variables'
      )
    }
    await connect(mongoUri, {
      dbName: dbName
    })
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
  }
}
