import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class Middleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const auth = req.headers.authorization;

    if (auth !== `Bearer ${process.env.API_SECRET}`) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  }
}
