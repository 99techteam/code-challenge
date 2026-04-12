import { connectToMongoDB } from './mongodb'

export const initConfigs = async () => {
  try {
    await connectToMongoDB()
    console.log('All configurations initialized successfully')
  } catch (error) {
    console.error('Error initializing configurations:', error)
    throw error
  }
}
