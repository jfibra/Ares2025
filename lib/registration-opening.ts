// The moment agent registration opens. Until then /registration shows a countdown
// instead of the form. Change this one line to move the opening.
export const REGISTRATION_OPENS_AT = "2026-11-27T12:00:00+08:00" // Nov 27, 2026, 12:00 noon Philippine time

export const registrationOpensAtMs = new Date(REGISTRATION_OPENS_AT).getTime()
