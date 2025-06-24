import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

export type Theme = "LIGHT" | "DARK";

export interface SettingsInput {
  currencyCode: string;
  theme:        Theme;
}

export interface Settings extends SettingsInput {
  userId: number;
}

interface ThemeCurrencyContextType {
  currencyCode:   string;
  theme:          Theme;
  currencies:     string[];
  loading:        boolean;
  updateSettings: (newSettings: SettingsInput) => Promise<Settings>;
}

export const ThemeCurrencyContext = createContext<ThemeCurrencyContextType>(
  {} as any
);

export const ThemeCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storedUid = localStorage.getItem("userId");
  const userId    = storedUid ? parseInt(storedUid, 10) : NaN;
  const token     = localStorage.getItem("token")!;

  const currencies = ["USD","EUR","GBP","INR","JPY","CAD","AUD"];

  const [theme, setTheme]             = useState<Theme>(() =>
    localStorage.getItem("theme") === "dark" ? "DARK" : "LIGHT"
  );
  const [currencyCode, setCurrencyCode] = useState<string>(currencies[0]);
  const [loading, setLoading]           = useState<boolean>(true);

  useEffect(() => {
    const isDark = theme === "DARK";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    if (isNaN(userId)) {
      console.warn("Invalid user ID");
      setLoading(false);
      return;
    }
    setLoading(true);

    api
      .get<Settings>(`/settings`, {
        headers: {
          "User-Id":     userId.toString(),
          "Authorization": `Bearer ${token}`,
        },
      })
      .then(({ data }) => {
        setCurrencyCode(data.currencyCode);
        setTheme(data.theme);
      })
      .catch(() => {
        // Create defaults if not found
        const initial: SettingsInput = {
          currencyCode: currencies[0],
          theme:        "LIGHT",
        };
        return api
          .put<Settings>(
            `/settings`,
            initial,
            {
              headers: {
                "User-Id":      userId.toString(),
                "Authorization": `Bearer ${token}`,
                "Content-Type":  "application/json",
              },
            }
          )
          .then(({ data }) => {
            setCurrencyCode(data.currencyCode);
            setTheme(data.theme);
          });
      })
      .finally(() => setLoading(false));
  }, [userId, token]);

  const updateSettings = async (newSettings: SettingsInput): Promise<Settings> => {
    if (isNaN(userId)) {
      throw new Error("Invalid userId – cannot save settings.");
    }
    const res = await api.put<Settings>(
      `/settings`,
      newSettings,
      {
        headers: {
          "User-Id":      userId.toString(),
          "Authorization": `Bearer ${token}`,
          "Content-Type":  "application/json",
        },
      }
    );
    setCurrencyCode(res.data.currencyCode);
    setTheme(res.data.theme);
    return res.data;
  };

  return (
    <ThemeCurrencyContext.Provider
      value={{ currencyCode, theme, currencies, loading, updateSettings }}
    >
      {children}
    </ThemeCurrencyContext.Provider>
  );
};
