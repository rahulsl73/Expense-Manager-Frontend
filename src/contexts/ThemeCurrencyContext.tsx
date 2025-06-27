import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

export type Theme = "LIGHT" | "DARK";

export interface SettingsInput {
  currencyCode: string;
  theme: Theme;
}

export interface Settings extends SettingsInput {
  userId: number;
}

interface ThemeCurrencyContextType {
  currencyCode: string;
  theme: Theme;
  currencies: string[];
  loading: boolean;
  updateSettings: (newSettings: SettingsInput) => Promise<Settings>;
  rates: Record<string, number>;
  convert: (amount: number) => number;
}

export const ThemeCurrencyContext = createContext<ThemeCurrencyContextType>({} as any);
const DEFAULT_CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"];

export const ThemeCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("token") || "";
  const currencies = DEFAULT_CURRENCIES;

  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem("theme") === "dark" ? "DARK" : "LIGHT"
  );
  const [currencyCode, setCurrencyCode] = useState<string>(currencies[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rates] = useState<Record<string, number>>({});

  useEffect(() => {
    const isDark = theme === "DARK";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    const userId = uid ? parseInt(uid, 10) : NaN;
    if (isNaN(userId)) {
      console.warn("Invalid user ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get<Settings>(`/settings`, {
        headers: {
          "User-Id": userId.toString(),
          Authorization: `Bearer ${token}`,
        },
      })
      .then(({ data }) => {
        setCurrencyCode(data.currencyCode);
        setTheme(data.theme);
      })
      .catch(() => {
        const initial: SettingsInput = {
          currencyCode: currencies[0],
          theme: "LIGHT",
        };
        return api
          .put<Settings>(
            `/settings`,
            initial,
            {
              headers: {
                "User-Id": userId.toString(),
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(({ data }) => {
            setCurrencyCode(data.currencyCode);
            setTheme(data.theme);
          });
      })
      .finally(() => setLoading(false));
  }, [token, currencies]);

 

  const updateSettings = async (newSettings: SettingsInput): Promise<Settings> => {
    const uid = localStorage.getItem("userId");
    const userId = uid ? parseInt(uid, 10) : NaN;
    if (isNaN(userId)) {
      throw new Error("Invalid userId – cannot save settings.");
    }

    const res = await api.put<Settings>(
      `/settings`,
      newSettings,
      {
        headers: {
          "User-Id": userId.toString(),
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setCurrencyCode(res.data.currencyCode);
    setTheme(res.data.theme);
    return res.data;
  };

  const convert = (amount: number) => {
    const rate = rates[currencyCode] || 1;
    return amount * rate;
  };

  return (
    <ThemeCurrencyContext.Provider
      value={{ currencyCode, theme, currencies, loading, updateSettings, rates, convert }}
    >
      {children}
    </ThemeCurrencyContext.Provider>
  );
};