export function getCorsOrigin(): string | string[] {
  const origins = process.env.FRONTEND_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!origins?.length) return '*';
  return origins.length === 1 ? origins[0] : origins;
}
