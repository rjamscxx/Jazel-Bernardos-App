import { useEffect } from "react";
import { useHub } from "@/store/hub";

/** Applies the persisted theme as a class on <html>. */
export function ThemeApplier() {
  const theme = useHub((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [theme]);
  return null;
}
