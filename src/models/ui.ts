import { useCallback, useState, useEffect } from 'react';
import { setLocale } from 'umi';

const LANG_KEY = 'entry_task_lang';

export default function useUiModel() {
  const DEFAULT_LANG = 'en-US';
  const [lang, setLang] = useState<string>(DEFAULT_LANG);

  const toggleLang = useCallback(
    (next: string) => {
      setLang(next);
      setLocale(next, false);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LANG_KEY, next);
      }
    },
    [setLang],
  );

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    const cached = localStorage.getItem(LANG_KEY);
    const nextLang = cached || DEFAULT_LANG;
    if (nextLang !== lang) {
      setLang(nextLang);
    }
    setLocale(nextLang, false);
    if (!cached) {
      localStorage.setItem(LANG_KEY, nextLang);
    }
  }, [lang]);

  return {
    lang,
    toggleLang,
  };
}
