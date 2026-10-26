/** Form-open time and honeypot, kept off the visible Redux form. */

let openedAt = 0;
let company = '';

export function markContactFormOpened(at = Date.now()): void {
  openedAt = at;
}

export function setContactCompany(value: string): void {
  company = value;
}

export function contactExtras(): { company: string; t: number } {
  return { company, t: openedAt };
}
