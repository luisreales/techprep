export function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) =>
    typeof value === 'string' && value.includes(',') ? `"${value}"` : String(value ?? '');
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}
