import React, { useContext, useState, useEffect } from "react";
import {
  ThemeCurrencyContext,
  type Settings as SettingsType,
} from "../contexts/ThemeCurrencyContext";
import { toast } from "react-toastify";

const Settings: React.FC = () => {
  const { currencies, currencyCode, theme, loading, updateSettings } =
    useContext(ThemeCurrencyContext);

  const [code, setCode] = useState<string>(currencyCode);
  const [darkMode, setDarkMode] = useState<boolean>(theme === "DARK");
  const [saving, setSaving] = useState<boolean>(false);

  
  useEffect(() => {
    setCode(currencyCode);
    setDarkMode(theme === "DARK");
  }, [currencyCode, theme]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">Loading settings…</div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const newSettings: SettingsType = {
        currencyCode: code,
        theme: darkMode ? "DARK" : "LIGHT",
      };

      console.log("Saving settings:", newSettings);

      const saved = await updateSettings(newSettings);

      toast.success("Settings saved successfully!");
      setDarkMode(saved.theme === "DARK");
    } catch (err) {
      console.error("Failed to save settings", err);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Settings</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Currency Code</label>
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={saving}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center mb-6">
        <input
          id="darkMode"
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          disabled={saving}
          className="mr-2"
        />
        <label htmlFor="darkMode" className="font-medium">
          Enable Dark Mode
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-2 rounded text-white ${
          saving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
};

export default Settings;
