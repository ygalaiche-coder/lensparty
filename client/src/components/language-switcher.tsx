import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/i18n";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={e => i18n.changeLanguage(e.target.value)}
        className="appearance-none bg-transparent text-sm cursor-pointer border border-border rounded-lg px-2 py-1.5 pr-6 text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
        data-testid="select-language"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {compact ? lang.flag : `${lang.flag} ${lang.code.toUpperCase()}`}
          </option>
        ))}
      </select>
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">
        ▼
      </div>
    </div>
  );
}
