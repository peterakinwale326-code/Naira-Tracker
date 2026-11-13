import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleVercelRequest } from '../../../../src/vercel-handler';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleVercelRequest(req, res);
}
