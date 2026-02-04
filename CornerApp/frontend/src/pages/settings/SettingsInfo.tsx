import { 
  Settings as SettingsIcon, 
  Database, 
  Server, 
  Info,
  ArrowLeft,
  Moon,
  Sun
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function SettingsInfoPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">ℹ️ {t('settings.info.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.info.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* System Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info size={24} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('settings.info.systemInfo')}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">{t('settings.info.version')}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">{t('settings.info.frontend')}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">React + TypeScript</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">{t('settings.info.backend')}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">ASP.NET Core</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">{t('settings.info.databaseLabel')}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">SQLite / SQL Server</span>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Server size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('settings.info.apiStatus')}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">{t('settings.info.backendApi')}</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-medium text-green-600 dark:text-green-400">{t('settings.info.connected')}</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">{t('settings.info.baseUrl')}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">localhost:5000</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">{t('settings.info.apiDocs')}</span>
              <a 
                href="http://localhost:5000/swagger" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {t('settings.info.viewSwagger')}
              </a>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Database size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('settings.info.database')}</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {t('settings.info.databaseDescription')}
          </p>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('settings.info.databaseNote')}
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <SettingsIcon size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('settings.info.preferences')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{t('settings.info.theme')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.info.themeDescription')}</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={theme === 'light' ? t('settings.info.changeToDark') : t('settings.info.changeToLight')}
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={18} />
                    <span className="text-sm font-medium">{t('settings.info.dark')}</span>
                  </>
                ) : (
                  <>
                    <Sun size={18} />
                    <span className="text-sm font-medium">{t('settings.info.light')}</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{t('settings.info.language')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.info.languageDescription')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeLanguage('es')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    language === 'es'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Español"
                >
                  <Globe size={18} />
                  <span className="text-sm font-medium">{t('settings.info.spanish')}</span>
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    language === 'en'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="English"
                >
                  <Globe size={18} />
                  <span className="text-sm font-medium">{t('settings.info.english')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

