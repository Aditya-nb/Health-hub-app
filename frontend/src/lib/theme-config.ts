export const themeConfig = {
  light: {
    name: "light",
    colors: {
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#ffffff",
      cardForeground: "#0f172a",
      popover: "#ffffff",
      popoverForeground: "#0f172a",
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      secondary: "#f8fafc",
      secondaryForeground: "#334155",
      muted: "#f8fafc",
      mutedForeground: "#64748b",
      accent: "#eff6ff",
      accentForeground: "#2563eb",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      border: "#e2e8f0",
      input: "#f8fafc",
      ring: "#3b82f6",
    },
    gradients: {
      background: "from-blue-50 via-indigo-50 to-purple-50",
      card: "from-white to-slate-50",
      primary: "from-blue-500 to-indigo-600",
    },
    shadows: {
      card: "0 4px 16px rgba(0, 0, 0, 0.1)",
      button: "0 4px 12px rgba(59, 130, 246, 0.25)",
      focus: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
  dark: {
    name: "dark",
    colors: {
      background: "#08080b",
      foreground: "#fafafa",
      card: "#18181b",
      cardForeground: "#fafafa",
      popover: "#18181b",
      popoverForeground: "#fafafa",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      secondary: "#27272a",
      secondaryForeground: "#a1a1aa",
      muted: "#27272a",
      mutedForeground: "#71717a",
      accent: "#27272a",
      accentForeground: "#fafafa",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      border: "#27272a",
      input: "#27272a",
      ring: "#6366f1",
    },
    gradients: {
      background: "from-zinc-900 via-zinc-800 to-slate-900",
      card: "from-zinc-800 to-zinc-900",
      primary: "from-indigo-500 to-purple-600",
    },
    shadows: {
      card: "0 4px 16px rgba(0, 0, 0, 0.3)",
      button: "0 4px 12px rgba(99, 102, 241, 0.3)",
      focus: "0 0 0 3px rgba(99, 102, 241, 0.2)",
    },
  },
};

export type Theme = keyof typeof themeConfig;
export type ThemeColors = typeof themeConfig.light.colors;

export const getThemeConfig = (theme: Theme) => themeConfig[theme];

export const applyThemeToRoot = (theme: Theme) => {
  const config = getThemeConfig(theme);
  const root = document.documentElement;

  // Apply CSS custom properties
  Object.entries(config.colors).forEach(([key, value]) => {
    const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    root.style.setProperty(`--${cssVar}`, value);
  });

  // Apply theme class
  root.classList.remove("light", "dark");
  root.classList.add(theme);
};
