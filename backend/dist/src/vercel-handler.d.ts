import 'reflect-metadata';
import type { VercelRequest, VercelResponse } from '@vercel/node';
export declare function handleVercelRequest(req: VercelRequest, res: VercelResponse): Promise<void>;
