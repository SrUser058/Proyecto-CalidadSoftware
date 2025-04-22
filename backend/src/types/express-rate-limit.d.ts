declare module 'express-rate-limit' {
    import { RequestHandler } from 'express';
  
    interface Options {
      windowMs?: number;
      max?: number | ((req: any) => number);
      message?: string | object;
      statusCode?: number;
      headers?: boolean;
      skip?: (req: any, res: any) => boolean;
      keyGenerator?: (req: any) => string;
      handler?: (req: any, res: any, next: any) => any;
    }
  
    const rateLimit: (options: Options) => RequestHandler;
    export default rateLimit;
  }