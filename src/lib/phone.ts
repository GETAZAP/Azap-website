/**
 * Nigerian mobile number validation, shared by every form on the site.
 *
 * Mirrors normalise_ng_phone() in the database: strip everything that is not a
 * digit, drop a 234 country code or a leading trunk zero, and require ten
 * digits. It lives here rather than in each component so the browser and the
 * database cannot start disagreeing about what a valid number is.
 */
export function phoneLooksValid(v: string): boolean {
  let d = v.replace(/[^0-9]/g, '');
  if (d.startsWith('234')) d = d.slice(3);
  else if (d.startsWith('0')) d = d.slice(1);
  return d.length === 10;
}

export const PHONE_ERROR = 'That number needs to be 11 digits, like 0803 000 0000.';
