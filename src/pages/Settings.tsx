import React, { useContext, useState, useEffect, useRef } from "react";
import { ThemeCurrencyContext, type Settings as SettingsType } from "../contexts/ThemeCurrencyContext";
import api from "../api/api";
import { toast } from "react-toastify";

const Settings: React.FC = () => {
  const { currencies, currencyCode, theme, loading, updateSettings } =
    useContext(ThemeCurrencyContext);

  const prevCurrency = useRef<string>(currencyCode);

  const [code, setCode] = useState<string>(currencyCode);
  const [darkMode, setDarkMode] = useState<boolean>(theme === "DARK");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    prevCurrency.current = currencyCode;
    setCode(currencyCode);
    setDarkMode(theme === "DARK");
  }, [currencyCode, theme]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 text-center text-gray-700 dark:text-gray-300">
        Loading settings…
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = Number(localStorage.getItem("userId"));
      const newSettings: SettingsType = {
        currencyCode: code,
        theme: darkMode ? "DARK" : "LIGHT",
        userId,
      };

      const saved = await updateSettings(newSettings);
      toast.success("Settings saved!");

      await api.put(
        "/expenses/convert",
        {
          fromCurrency: prevCurrency.current,
          toCurrency: saved.currencyCode,
        },
        {
          headers: { "User-Id": String(userId) },
        }
      );

      toast.success(`All expenses converted from ${prevCurrency.current} to ${saved.currencyCode}!`);
      prevCurrency.current = saved.currencyCode;
    } catch (err) {
      console.error("Error converting expenses:", err);
      toast.error("Failed to convert all expenses. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors">
      <h2 className="text-2xl mb-4 text-gray-900 dark:text-gray-100">
        Settings
      </h2>

      {/* Currency selector  */}
      <div className="mb-4">
        <label className="block mb-1 text-gray-700 dark:text-gray-300">
          Currency Code
        </label>
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={saving}
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Dark mode toggle */}
      <div className="flex items-center mb-6">
        <input
          id="darkMode"
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode((d) => !d)}
          disabled={saving}
          className="mr-2"
        />
        <label htmlFor="darkMode" className="text-gray-700 dark:text-gray-300">
          Enable Dark Mode
        </label>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-2 rounded text-white ${
          saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {saving ? "Applying…" : "Save Settings & Convert Expenses"}
      </button>
    </div>
  );
};

export default Settings;
