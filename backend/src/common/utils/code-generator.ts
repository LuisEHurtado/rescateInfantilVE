export function generateChildCode(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, '0');
  return `NNA-${year}-${padded}`;
}
