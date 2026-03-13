import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { NextFunction, Request, Response } from 'express'

type ClassConstructor<T> = { new (): T }

type Source = 'body' | 'query'

export function validateDto<T extends object>(
  cls: ClassConstructor<T>,
  source: Source = 'body',
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(cls, req[source], {
      enableImplicitConversion: true,
    })

    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: false,
    })

    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}))
      res.status(400).json({ message: messages.join(', ') })
      return
    }

    Object.defineProperty(req, source, { value: instance, writable: true, configurable: true })
    next()
  }
}
