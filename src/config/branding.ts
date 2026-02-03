/**
 * Branding configuration
 *
 * All values can be overridden via environment variables.
 * For client-side usage, variables must have NEXT_PUBLIC_ prefix.
 */

export const branding = {
  // School names
  schoolName: process.env.NEXT_PUBLIC_SCHOOL_NAME || "Stella Maris",
  schoolFullName: process.env.NEXT_PUBLIC_SCHOOL_FULL_NAME || "Colegio Stella Maris Rosario",

  // App name
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Klass",

  // Logo paths
  logoPath: process.env.NEXT_PUBLIC_LOGO_PATH || "/images/logo.webp",
  logoSecondaryPath: process.env.NEXT_PUBLIC_LOGO_SECONDARY_PATH || "/images/logo-secondary.webp",
  logoLightPath: process.env.NEXT_PUBLIC_LOGO_LIGHT_PATH || "/images/logo-light.webp",
} as const;

// Computed values
export const brandingMeta = {
  // Page titles
  defaultTitle: `${branding.appName} - ${branding.schoolName}`,
  titleTemplate: `%s | ${branding.appName} - ${branding.schoolName}`,

  // SEO descriptions
  siteName: `${branding.appName} - ${branding.schoolName}`,

  // Alt text for logos
  logoAlt: branding.schoolFullName,
} as const;
