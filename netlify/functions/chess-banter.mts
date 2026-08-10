import { handleChessBanter } from '../../src/lib/chess/banterApi';

export const handler = async (event: {
  httpMethod: string;
  headers?: Record<string, string | undefined>;
  body?: string | null;
}) => handleChessBanter(event);
