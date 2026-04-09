import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/Card';
import SearchDrawer from './SearchDrawer';
import searchIcon from '@/assets/svgs/search.svg';
import './index.scss';
import EmptyState from '@/components/EmptyState';
import type { BasicLayoutContext } from '@/layouts/BasicLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearSearch } from '@/store/searchSlice';
import { fetchEvents } from '@/services';
import type { Event } from '@/types/event';
import VirtualInfiniteList from '@/components/VirtualInfiniteList';
import { startLoading, stopLoading } from '@/components/Loading';

const PAGE_SIZE = 20;

export default function ListPage() {
  const layout = useOutletContext<BasicLayoutContext>();
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.search.query);
  const [events, setEvents] = useState<Event[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);
  const resetKey = useMemo(
    () =>
      JSON.stringify({
        displayText: search.displayText,
        params: search.params,
        timeTag: search.timeTag,
      }),
    [search.displayText, search.params, search.timeTag],
  );

  useEffect(() => {
    if (!layout) return;
    layout.setDrawerContent(<SearchDrawer onClose={layout.closeDrawer} />);
    layout.setHeaderConfig({
      icon: searchIcon,
      ariaLabel: '搜索',
      onClick: layout.toggleDrawer,
    });

    return () => {
      layout.setDrawerContent(null);
      layout.setHeaderConfig(null);
      layout.closeDrawer();
    };
  }, [layout]);

  const loadEvents = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      const startedGlobal = reset;
      if (startedGlobal) startLoading();
      if (reset) {
        offsetRef.current = 0;
        setEvents([]);
        setHasMore(true);
        setTotal(0);
      }
      const currentRequestId = ++requestIdRef.current;
      try {
        const params: Record<string, any> = {
          offset: offsetRef.current,
          limit: PAGE_SIZE,
        };
        if (search.params.channels?.length) params.channels = search.params.channels.join(',');
        if (search.params.after !== undefined) params.after = search.params.after;
        if (search.params.before !== undefined) params.before = search.params.before;
        const res = await fetchEvents(params);
        if (requestIdRef.current !== currentRequestId) return;
        offsetRef.current += res.events?.length || 0;
        setEvents((prev) => (reset ? res.events : [...prev, ...res.events]));
        setHasMore(res.hasMore);
        setTotal(res.total ?? res.events.length ?? 0);
      } catch (e: any) {
        if (requestIdRef.current !== currentRequestId) return;
        setError(e?.message || 'Failed to load events');
      } finally {
        if (requestIdRef.current === currentRequestId) {
          loadingRef.current = false;
          setLoading(false);
        }
        if (startedGlobal) stopLoading();
      }
    },
    [search],
  );

  useEffect(() => {
    loadEvents(true);
  }, [loadEvents]);

  useEffect(() => {
    scrollContainer?.scrollTo({ top: 0 });
  }, [resetKey, scrollContainer]);

  return (
    <div className="et-list-container">
      {search.displayText && (
        <div className="search-wrap">
          <div className="result">
            <div className="tips">{total || events.length} results</div>
            <div className="clear" onClick={() => dispatch(clearSearch())}>
              CLEAR SEARCH
            </div>
          </div>
          <div className="keywords">Searched for {search.displayText}</div>
        </div>
      )}
      <div className="et-list-wrap" ref={setScrollContainer}>
        <VirtualInfiniteList
          items={events}
          renderItem={(item) => <Card data={item} />}
          getKey={(item) => item.id}
          scrollContainer={scrollContainer}
          resetKey={resetKey}
          hasMore={hasMore && !error}
          loading={loading}
          onLoadMore={() => loadEvents()}
          empty={<EmptyState />}
          error={error}
          onRetry={() => loadEvents(events.length === 0)}
        />
      </div>
    </div>
  );
}
