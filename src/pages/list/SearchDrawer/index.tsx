import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';

import dateFromIcon from '@/assets/svgs/date-from.svg';
import dateToIcon from '@/assets/svgs/date-to.svg';
import searchIcon from '@/assets/svgs/search.svg';
import EtIcon from '@/components/EtIcon';
import EtInput from '@/components/EtInput';
import { fetchChannels } from '@/services';
import type { Channel } from '@/types/channel';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearch as setSearchAction } from '@/store/searchSlice';
import './index.scss';

const endOfDay = (d: dayjs.Dayjs) => d.hour(23).minute(59).second(59).millisecond(0);
const formatDisplayDate = (val?: number | string) => {
  if (!val) return '';
  const date = dayjs(val);
  const fmt = date.year() === dayjs().year() ? 'DD/MM' : 'DD/MM/YYYY';
  return date.format(fmt);
};

const resolveLaterRange = (params?: { after?: number | string; before?: number | string }) => {
  const start = params?.after ? dayjs(params.after) : null;
  const end = params?.before ? dayjs(params.before) : null;
  const startStr = start?.isValid() ? start.format('YYYY-MM-DD') : '';
  const endStr = end?.isValid() ? end.format('YYYY-MM-DD') : '';
  if (startStr || endStr) return { start: startStr, end: endStr };
  const now = dayjs();
  return {
    start: now.subtract(2, 'day').format('YYYY-MM-DD'), // 前天
    end: now.add(1, 'day').format('YYYY-MM-DD'), // 明天
  };
};
const DATE_GROUPS = {
  title: 'DATE',
  tags: [
    [{ tagName: 'ANYTIME' }, { tagName: 'TODAY' }, { tagName: 'TOMORROW' }],
    [{ tagName: 'THIS WEEK' }, { tagName: 'THIS MONTH' }],
    [{ tagName: 'LATER' }],
  ],
};

type SearchDrawerProps = {
  onClose?: () => void;
};

function SearchDrawer({ onClose }: SearchDrawerProps) {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.search.query);
  const inferredTimeInit = search.timeTag || 'ANYTIME';
  const initLaterRange =
    inferredTimeInit === 'LATER' ? resolveLaterRange(search.params) : { start: '', end: '' };

  const [time, setTime] = useState(inferredTimeInit);
  const [channel, setChannel] = useState<string | number>(search.params.channels?.[0] ?? 'All');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [startDate, setStartDate] = useState(initLaterRange.start);
  const [endDate, setEndDate] = useState(initLaterRange.end);
  const handleTimeSelect = (tagName: string) => {
    setTime(tagName);
    if (tagName === 'LATER') {
      const { start, end } = resolveLaterRange();
      setStartDate(start);
      setEndDate(end);
      return;
    }
    setStartDate('');
    setEndDate('');
  };

  useEffect(() => {
    fetchChannels()
      .then((res) => setChannels(res.channels || []))
      .catch(() => setChannels([]));
  }, []);
  useEffect(() => {
    const inferredTime = search.timeTag || 'ANYTIME';
    setTime(inferredTime);
    setChannel(search.params.channels?.[0] ?? 'All');
    if (inferredTime === 'LATER') {
      const { start, end } = resolveLaterRange(search.params);
      setStartDate(start);
      setEndDate(end);
    } else {
      setStartDate('');
      setEndDate('');
    }
  }, [search]);
  const timeRange = useMemo(() => {
    const now = dayjs();
    switch (time) {
      case 'TODAY':
        return {
          after: now.startOf('day').valueOf(),
          before: endOfDay(now).valueOf(),
        };
      case 'TOMORROW': {
        const t = now.add(1, 'day');
        return {
          after: t.startOf('day').valueOf(),
          before: endOfDay(t).valueOf(),
        };
      }
      case 'THIS WEEK':
        return {
          after: now.startOf('week').valueOf(),
          before: endOfDay(now.endOf('week')).valueOf(),
        };
      case 'THIS MONTH': {
        const start = now.startOf('month');
        const end = now.endOf('month');
        return {
          after: start.valueOf(),
          before: endOfDay(end).valueOf(),
        };
      }
      case 'LATER': {
        const start = startDate ? dayjs(startDate) : null;
        const end = endDate ? dayjs(endDate) : null;
        return {
          after: start?.isValid() ? start.startOf('day').valueOf() : undefined,
          before: end?.isValid() ? endOfDay(end).valueOf() : undefined,
        };
      }
      default:
        return {};
    }
  }, [time, startDate, endDate]);
  const searchTips = useMemo(() => {
    const channelId = channel === 'All' ? undefined : Number(channel);
    const channelName = channelId ? channels.find((c) => c.id === channelId)?.name : 'All';
    const parts: string[] = [`${channelName || 'All'} Activities`];
    if (time !== 'ANYTIME') {
      const afterText = formatDisplayDate(timeRange.after);
      const beforeText = formatDisplayDate(timeRange.before);
      if (afterText || beforeText) {
        const rangeText =
          afterText && beforeText
            ? `from ${afterText} to ${beforeText}`
            : afterText
            ? `from ${afterText}`
            : `until ${beforeText}`;
        parts.push(rangeText);
      } else {
        parts.push(time);
      }
    }
    return parts.join(' ') || 'All Activities';
  }, [time, channel, channels, timeRange.after, timeRange.before]);

  const handleSearch = () => {
    onClose?.();
    setTimeout(() => {
      const displayText = searchTips.trim() || 'All Activities';
      const params = {
        channels: channel === 'All' ? undefined : [Number(channel)],
        after: timeRange.after,
        before: timeRange.before,
      };
      dispatch(setSearchAction({ displayText, params, timeTag: time }));
    }, 300);
  };
  return (
    <div className="et-search-drawer">
      <div className="et-search-drawer__keywords">
        <div className="et-search-group">
          <div className="et-search-title">{DATE_GROUPS.title}</div>
          {DATE_GROUPS.tags.map((tag, index) => {
            return (
              <div className="et-search-tag-wrap no-wrap" key={`date-row-${index}`}>
                {tag.map((tag, tagIndex) => {
                  return (
                    <div
                      key={`data_${index}_${tagIndex}`}
                      className={clsx('et-search-tag', {
                        active: time == tag.tagName,
                        rest: tag.tagName == 'TOMORROW',
                      })}
                      onClick={() => handleTimeSelect(tag.tagName)}
                    >
                      {tag.tagName}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {time === 'LATER' && (
            <>
              <div className="triangle-up"></div>
              <div className="et-search-range">
                <div className="et-search-range__field">
                  <EtIcon className="arrow" src={dateFromIcon} />
                  <EtInput
                    type="date"
                    placeholder="Start date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="et-search-range__input"
                  />
                </div>
                <span className="et-search-range__dash">-</span>
                <div className="et-search-range__field">
                  <EtIcon className="arrow" src={dateToIcon} />
                  <EtInput
                    type="date"
                    placeholder="End date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="et-search-range__input"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="et-search-group">
          <div className="et-search-title">CHANNEL</div>
          <div className="et-search-tag-wrap">
            <div
              className={clsx('et-search-tag', {
                active: channel === 'All',
              })}
              onClick={() => setChannel('All')}
            >
              All
            </div>
            {channels.map((tag) => {
              return (
                <div
                  key={`channel_${tag.id}`}
                  className={clsx('et-search-tag', {
                    active: channel === tag.id,
                  })}
                  onClick={() => {
                    setChannel(tag.id);
                  }}
                >
                  {tag.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="et-search-drawer__search">
        <div className="search-wrap" onClick={handleSearch}>
          <EtIcon src={searchIcon} className="icon" alt="" />
          <div className="title">SEARCH</div>
        </div>
        <div className="tips">{searchTips}</div>
      </div>
    </div>
  );
}

export default SearchDrawer;
