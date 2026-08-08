/**
 * GameSphere Client-Side Validation System
 * Reusable validation rules and schema helpers across forms.
 */

// Primitive validation rules
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return "Email address is required.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address (e.g. gamer@domain.com).";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumberOrSpecial = /[0-9_\W]/.test(password);
  if (!hasUpper || !hasLower || !hasNumberOrSpecial) {
    return "Password must contain uppercase, lowercase, and a number or symbol.";
  }
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username || !username.trim()) {
    return "Username is required.";
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return "Username must be between 3 and 20 characters.";
  }
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmed)) {
    return "Username can only contain letters, numbers, and underscores.";
  }
  return null;
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
    return `${fieldName} is required.`;
  }
  return null;
}

export function validatePositiveNumber(value: number, fieldName: string, allowZero = true): string | null {
  if (isNaN(value)) {
    return `${fieldName} must be a valid number.`;
  }
  if (allowZero && value < 0) {
    return `${fieldName} cannot be negative.`;
  }
  if (!allowZero && value <= 0) {
    return `${fieldName} must be a positive integer greater than zero.`;
  }
  if (!Number.isInteger(value)) {
    return `${fieldName} must be a whole integer number.`;
  }
  return null;
}

// Composite Form Validation Schemas

export interface RegistrationErrors {
  email?: string;
  username?: string;
  password?: string;
  firstError?: string;
}

export function validateRegistrationForm(data: {
  email: string;
  username: string;
  password: string;
}): RegistrationErrors {
  const errors: RegistrationErrors = {};
  
  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const usernameErr = validateUsername(data.username);
  if (usernameErr) errors.username = usernameErr;

  const passwordErr = validatePassword(data.password);
  if (passwordErr) errors.password = passwordErr;

  errors.firstError = errors.email || errors.username || errors.password;
  return errors;
}

export interface MatchRequestErrors {
  gameId?: string;
  skill?: string;
  pingMs?: string;
  maxPingMs?: string;
  firstError?: string;
}

export function validateMatchRequestForm(data: {
  gameId: string;
  skill: number;
  pingMs: number;
  maxPingMs: number;
}): MatchRequestErrors {
  const errors: MatchRequestErrors = {};

  const gameErr = validateRequired(data.gameId, "Game selection");
  if (gameErr) errors.gameId = gameErr;

  if (data.skill < 1 || data.skill > 10) {
    errors.skill = "Skill rating must be between 1 and 10.";
  }

  if (data.pingMs < 0 || data.pingMs > 1000) {
    errors.pingMs = "Expected ping must be between 0 and 1000 ms.";
  }

  if (data.maxPingMs < 0 || data.maxPingMs > 1000) {
    errors.maxPingMs = "Max ping must be between 0 and 1000 ms.";
  } else if (data.pingMs > data.maxPingMs) {
    errors.maxPingMs = "Max tolerable ping cannot be less than expected ping.";
  }

  errors.firstError = errors.gameId || errors.skill || errors.pingMs || errors.maxPingMs;
  return errors;
}

export interface TournamentFormErrors {
  name?: string;
  gameId?: string;
  startAt?: string;
  endAt?: string;
  prizePool?: string;
  firstError?: string;
}

export function validateTournamentForm(data: {
  name: string;
  gameId: string;
  startAt?: string;
  endAt?: string;
  prizePool: number;
}): TournamentFormErrors {
  const errors: TournamentFormErrors = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = "Tournament title must be at least 3 characters.";
  } else if (data.name.trim().length > 60) {
    errors.name = "Tournament title cannot exceed 60 characters.";
  }

  const gameErr = validateRequired(data.gameId, "Game selection");
  if (gameErr) errors.gameId = gameErr;

  const prizeErr = validatePositiveNumber(data.prizePool, "Prize pool", true);
  if (prizeErr) errors.prizePool = prizeErr;

  if (data.startAt && data.endAt) {
    const startDate = new Date(data.startAt).getTime();
    const endDate = new Date(data.endAt).getTime();
    if (isNaN(startDate)) {
      errors.startAt = "Invalid start date format.";
    }
    if (isNaN(endDate)) {
      errors.endAt = "Invalid end date format.";
    }
    if (!isNaN(startDate) && !isNaN(endDate) && endDate <= startDate) {
      errors.endAt = "Tournament end date must be after the start date.";
    }
  }

  errors.firstError = errors.name || errors.gameId || errors.prizePool || errors.startAt || errors.endAt;
  return errors;
}

export interface ClanFormErrors {
  name?: string;
  tag?: string;
  description?: string;
  firstError?: string;
}

export function validateClanForm(data: {
  name: string;
  tag: string;
  description?: string;
}): ClanFormErrors {
  const errors: ClanFormErrors = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = "Clan name must be at least 3 characters.";
  } else if (data.name.trim().length > 30) {
    errors.name = "Clan name cannot exceed 30 characters.";
  }

  const tagTrimmed = data.tag ? data.tag.trim() : "";
  if (!tagTrimmed || tagTrimmed.length < 2 || tagTrimmed.length > 5) {
    errors.tag = "Clan tag must be between 2 and 5 characters (e.g. ALPHA).";
  } else if (!/^[a-zA-Z0-9]+$/.test(tagTrimmed)) {
    errors.tag = "Clan tag must contain letters and numbers only.";
  }

  if (data.description && data.description.length > 300) {
    errors.description = "Clan description cannot exceed 300 characters.";
  }

  errors.firstError = errors.name || errors.tag || errors.description;
  return errors;
}
