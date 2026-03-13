import { Response } from 'express'

export const ok = <T>(res: Response, data: T): void => {
  res.status(200).json(data)
}

export const created = <T>(res: Response, data: T): void => {
  res.status(201).json(data)
}

export const badRequest = (res: Response, message: string): void => {
  res.status(400).json({ message })
}

export const notFound = (res: Response, message: string): void => {
  res.status(404).json({ message })
}

export const internalError = (
  res: Response,
  message = 'Internal server error',
): void => {
  res.status(500).json({ message })
}
