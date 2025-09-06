import { useEffect } from "react";
import { useTheme as useThemeContext } from "../contexts/ThemeContext";

export const useTheme = () => {
  const context = useThemeContext();

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no theme is explicitly set
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        context.setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [context]);

  return {
    ...context,
    isSystemDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    isLight: context.theme === "light",
    isDark: context.theme === "dark",
  };
};
