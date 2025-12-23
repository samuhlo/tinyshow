export const useTheme = () => {
  const isDark = useState("theme-dark", () => false);

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    updateDOM();

    // Persistencia
    const cookie = useCookie("theme");
    cookie.value = isDark.value ? "dark" : "light";
  };

  const updateDOM = () => {
    if (import.meta.client) {
      if (isDark.value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Inicializar (safe for SSR/Client)
  const initTheme = () => {
    const cookie = useCookie("theme");

    if (cookie.value) {
      isDark.value = cookie.value === "dark";
    } else if (import.meta.client) {
      // Fallback al sistema si no hay cookie
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      isDark.value = systemDark;
    }

    // Aplicar inmediatamente si es cliente para evitar flash (aunque en hydration puede haber mismatch si no tenemos cuidado,
    // pero con useCookie debería estar bien sincronizado en SSR si la cookie viaja)
    updateDOM();
  };

  return {
    isDark,
    toggleTheme,
    initTheme,
  };
};
