/**
 * Feature Flags System
 *
 * Allows enabling/disabling features based on environment.
 * Flags can be toggled via environment variables.
 */

interface FeatureFlags {
  /** Enable AI-powered task suggestions */
  aiSuggestions: boolean;
  /** Enable task categories feature */
  categories: boolean;
  /** Enable email notifications (future feature) */
  emailNotifications: boolean;
  /** Enable dark mode toggle */
  darkMode: boolean;
}

/**
 * Get the current environment
 */
function getEnvironment(): "development" | "production" | "test" {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    return "test";
  }

  // Check if running in production (Cloudflare, etc.)
  if (typeof import.meta.env !== "undefined") {
    if (import.meta.env.PROD) {
      return "production";
    }
  }

  return "development";
}

/**
 * Default feature flags by environment
 */
const defaultFlags: Record<string, FeatureFlags> = {
  development: {
    aiSuggestions: true,
    categories: true,
    emailNotifications: false,
    darkMode: false,
  },
  production: {
    aiSuggestions: true,
    categories: true,
    emailNotifications: false,
    darkMode: false,
  },
  test: {
    aiSuggestions: false,
    categories: true,
    emailNotifications: false,
    darkMode: false,
  },
};

/**
 * Parse environment variable overrides
 */
function getEnvOverrides(): Partial<FeatureFlags> {
  const overrides: Partial<FeatureFlags> = {};

  // Environment variable format: FF_FEATURE_NAME=true|false
  // Example: FF_AI_SUGGESTIONS=false
  if (typeof import.meta.env !== "undefined") {
    if (import.meta.env.FF_AI_SUGGESTIONS !== undefined) {
      overrides.aiSuggestions = import.meta.env.FF_AI_SUGGESTIONS === "true";
    }
    if (import.meta.env.FF_CATEGORIES !== undefined) {
      overrides.categories = import.meta.env.FF_CATEGORIES === "true";
    }
    if (import.meta.env.FF_EMAIL_NOTIFICATIONS !== undefined) {
      overrides.emailNotifications = import.meta.env.FF_EMAIL_NOTIFICATIONS === "true";
    }
    if (import.meta.env.FF_DARK_MODE !== undefined) {
      overrides.darkMode = import.meta.env.FF_DARK_MODE === "true";
    }
  }

  return overrides;
}

/**
 * Get all feature flags for the current environment
 */
export function getFeatureFlags(): FeatureFlags {
  const env = getEnvironment();
  const defaults = defaultFlags[env];
  const overrides = getEnvOverrides();

  return {
    ...defaults,
    ...overrides,
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Feature flag constants for type-safe access
 */
export const Features = {
  AI_SUGGESTIONS: "aiSuggestions",
  CATEGORIES: "categories",
  EMAIL_NOTIFICATIONS: "emailNotifications",
  DARK_MODE: "darkMode",
} as const;
