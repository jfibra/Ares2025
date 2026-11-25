// The moment agent registration opens. Until then /registration shows a countdown
// instead of the form. Change this one line to move the opening.
export const REGISTRATION_OPENS_AT = "2026-11-27T12:00:00+08:00" // Nov 27, 2026, 12:00 noon Philippine time

export const registrationOpensAtMs = new Date(REGISTRATION_OPENS_AT).getTime()

// Registration has two parts. From the opening above, only people who attended ARES 2025 may
// register (pre-registration). From the moment below, everyone may, first come, first served,
// until the slots are filled. Change this one line to move general registration.
export const GENERAL_REGISTRATION_OPENS_AT = "2026-11-30T00:00:00+08:00" // Nov 30, 2026, 12:00 midnight Philippine time

export const generalRegistrationOpensAtMs = new Date(GENERAL_REGISTRATION_OPENS_AT).getTime()

/** Shown to someone who did not attend ARES 2025 and tries to register during pre-registration. */
export const GENERAL_REGISTRATION_NOTICE =
  "General Registration will be open on November 30, 2026 at a first-come, first-served basis."
