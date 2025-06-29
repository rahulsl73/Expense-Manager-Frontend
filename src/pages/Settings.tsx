import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { saveSettings, convertExpenses } from '../store/slices/settingsSlice'
import { toast } from 'react-toastify'
import type { Settings as SettingsType } from '../store/slices/settingsSlice'

const Settings: React.FC = () => {
  const dispatch = useAppDispatch()
  const { settings, loadingFetch, currencies } = useAppSelector(s => s.settings)

  const [code, setCode] = useState<string>('')
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setCode(settings.currencyCode)
      setDarkMode(settings.theme === 'DARK')
    }
  }, [settings])

  if (loadingFetch || !settings) {
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading settings…</div>
  }

  const hasChanges = settings.currencyCode !== code || (settings.theme === 'DARK') !== darkMode

  const handleSave = async () => {
    setSaving(true)
    const newSettings: SettingsType = { currencyCode: code, theme: darkMode ? 'DARK' : 'LIGHT' }
    try {
      const saved = await dispatch(saveSettings(newSettings)).unwrap()
      toast.success('Settings saved!')
      if (settings.currencyCode !== saved.currencyCode) {
        await dispatch(convertExpenses({ from: settings.currencyCode, to: saved.currencyCode })).unwrap()
        toast.success(`Expenses converted from ${settings.currencyCode} to ${saved.currencyCode}!`)
      }
    } catch (err: any) {
      toast.error(err || 'Save or conversion failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Settings</h2>

      <div className="mb-4">
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Currency Code
        </label>
        <select
          id="currency"
          value={code}
          onChange={e => setCode(e.target.value)}
          disabled={saving}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currencies.map(c => (
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
          onChange={() => setDarkMode(d => !d)}
          disabled={saving}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Enable Dark Mode
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
          saving || !hasChanges
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {saving ? 'Applying…' : 'Save & Convert'}
      </button>
    </div>
  )
}

export default Settings
