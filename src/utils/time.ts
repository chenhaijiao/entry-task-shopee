import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);

export type TimeAgoValue = string | number | Date | dayjs.Dayjs;

const resolveLocale = (lang?: string) => {
  const lower = (lang || '').toLowerCase();
  if (lower.startsWith('zh')) return 'zh-cn';
  return 'en';
};

export function formatTimeAgo(timestamp: TimeAgoValue, lang?: string) {
  return dayjs(timestamp).locale(resolveLocale(lang)).fromNow();
}

export function formatDisplayDate(timestamp: TimeAgoValue, lang?: string) {
  const locale = resolveLocale(lang);
  const format = locale === 'zh-cn' ? 'YYYY年MM月DD日' : 'D MMMM YYYY';
  return dayjs(timestamp).locale(locale).format(format);
}

export function formatDisplayTimeParts(timestamp: TimeAgoValue, lang?: string) {
  const locale = resolveLocale(lang);
  const time = dayjs(timestamp).locale(locale);
  if (locale === 'zh-cn') {
    return { time: time.format('HH:mm'), suffix: '' };
  }
  return { time: time.format('h:mm'), suffix: time.format('a') };
}
