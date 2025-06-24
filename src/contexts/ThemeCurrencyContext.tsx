import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

export type Theme = "LIGHT" | "DARK";

export interface Settings {
  currencyCode: string;
  theme: Theme;
}

interface ThemeCurrencyContextType extends Settings {
  currencies: string[];
  loading: boolean;
  updateSettings: (newSettings: Settings) => Promise<Settings>;
}

export const ThemeCurrencyContext = createContext<ThemeCurrencyContextType>({} as any);

export const ThemeCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storedUid = localStorage.getItem("userId");
  const userId = storedUid ? parseInt(storedUid, 10) : NaN;

  const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"];
  const [currencyCode, setCurrencyCode] = useState<string>(currencies[0]);
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem("theme") === "dark" ? "DARK" : "LIGHT"
  );
  const [loading, setLoading] = useState<boolean>(true);

  
  useEffect(() => {
    const isDark = theme === "DARK";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [theme]);

  
  useEffect(() => {
    if (isNaN(userId)) {
      console.warn("Invalid user ID in localStorage");
      setLoading(false);
      return;
    }
    setLoading(true);

    api
      .get<Settings>(`/settings/${userId}`, {
        headers: { "User-Id": String(userId) },
      })
      .then((res) => {
        setCurrencyCode(res.data.currencyCode);
        setTheme(res.data.theme);
      })
      .catch((err) => {
        console.warn("No settings found; creating defaults...", err);
        const initial: Settings = { currencyCode: currencies[0], theme: "LIGHT" };
        return api
          .put<Settings>(`/settings/${userId}`, initial, {
            headers: {
              "User-Id": String(userId),
              "Content-Type": "application/json",
            },
          })
          .then((resp) => {
            setCurrencyCode(resp.data.currencyCode);
            setTheme(resp.data.theme);
          });
      })
      .finally(() => setLoading(false));
  }, [userId]);

  
  const updateSettings = async (newSettings: Settings): Promise<Settings> => {
    if (isNaN(userId)) {
      throw new Error("Invalid userId – cannot save settings.");
    }

    const payload = {
      currencyCode: newSettings.currencyCode,
      theme: newSettings.theme,
    };

    console.debug("Updating settings:", {
      url: `/settings/${userId}`,
      payload,
      headers: {
        "User-Id": String(userId),
        "Content-Type": "application/json",
      },
    });

    try {
      const res = await api.put<Settings>(
        `/settings/${userId}`,
        payload,
        {
          headers: {
            "User-Id": String(userId),
            "Content-Type": "application/json",
          },
        }
      );
      console.debug("UpdateSettings response:", {
        status: res.status,
        data: res.data,
      });
      setCurrencyCode(res.data.currencyCode);
      setTheme(res.data.theme);
      return res.data;
    } catch (error: any) {
      console.error("Failed to update settings:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  };

  return (
    <ThemeCurrencyContext.Provider
      value={{ currencyCode, theme, currencies, loading, updateSettings }}
    >
      {children}
    </ThemeCurrencyContext.Provider>
  );
};
