import './index.scss';
import emailIcon from '@/assets/svgs/email.svg';
import EtImage from '@/components/EtImage';
import EtIcon from '@/components/EtIcon';
import checkIcon from '@/assets/svgs/check.svg';
import checkOutlineIcon from '@/assets/svgs/check-outline.svg';
import likeIcon from '@/assets/svgs/like.svg';
import likeOutlineIcon from '@/assets/svgs/like-outline.svg';
import pastIcon from '@/assets/svgs/past.svg';
import pastOutLineIcon from '@/assets/svgs/past-outline.svg';
import StickyMenu from '@/components/StickyMenu';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import InfiniteList from '@/components/InfiniteList';
import { fetchMe, fetchUserEvents } from '@/services';
import type { Event } from '@/types/event';
import { startLoading, stopLoading } from '@/components/Loading';

const PAGE_SIZE = 10;
export default function MePage() {
  const [activeMenu, setActiveMenu] = useState<'liked' | 'going' | 'past'>('liked');
  const [showList, setShowList] = useState<Event[]>([]);
  const offsetRef = useRef(0);
  const listLoadingRef = useRef(false);
  const [user, setUser] = useState<{
    username: string;
    email: string;
    avatar?: string;
    likes_count?: number;
    goings_count?: number;
    past_count?: number;
  }>({
    username: 'Username',
    email: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const menuList = useMemo(() => {
    return [
      {
        id: 'liked',
        menuName: `${user.likes_count ?? 0} Likes`,
        icon: likeOutlineIcon,
        activeIcon: likeIcon,
      },
      {
        id: 'going',
        menuName: `${user.goings_count ?? 0} Going`,
        icon: checkOutlineIcon,
        activeIcon: checkIcon,
      },
      {
        id: 'past',
        menuName: `${user.past_count ?? 0} Past`,
        icon: pastOutLineIcon,
        activeIcon: pastIcon,
      },
    ];
  }, [user.goings_count, user.likes_count, user.past_count]);

  const fetchList = useCallback(async (type: 'liked' | 'going' | 'past', reset = false) => {
    if (listLoadingRef.current) return;
    listLoadingRef.current = true;
    setLoading(true);
    if (reset) {
      setError(null);
      offsetRef.current = 0;
    }
    const currentOffset = reset ? 0 : offsetRef.current;
    try {
      const res = await fetchUserEvents({ type, offset: currentOffset, limit: PAGE_SIZE });
      const list = res.events || [];
      setShowList((prev) => (reset ? list : [...prev, ...list]));
      setHasMore(res.hasMore ?? list.length === PAGE_SIZE);
      offsetRef.current = currentOffset + list.length;
    } catch (e: any) {
      setError(e?.message || 'Failed to load list');
    } finally {
      setLoading(false);
      listLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      startLoading();
      setError(null);
      try {
        const profile = await fetchMe();
        setUser({
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          likes_count: profile.likes_count,
          goings_count: profile.goings_count,
          past_count: profile.past_count,
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile');
      } finally {
        stopLoading();
      }
    };
    load();
  }, []);

  useEffect(() => {
    offsetRef.current = 0;
    setShowList([]);
    setHasMore(true);
    setError(null);
  }, [activeMenu]);
  return (
    <div className="et-me-container" id="me">
      <div className="user-wrap">
        <EtImage src={user.avatar} className="avatar" alt="用户头像" />
        <p className="nickname">{user.username}</p>
        <div className="email-wrap">
          <EtIcon src={emailIcon} className="icon" alt="用户头像" />
          {user.email || 'unknown'}
        </div>
      </div>
      <StickyMenu
        id="stickyMenu"
        menuList={menuList}
        activeMenu={activeMenu}
        onChange={(id) => setActiveMenu(id as 'liked' | 'going' | 'past')}
        scrollContainerId="me"
      />
      <div className="content-wrap" id="meContent">
        <InfiniteList
          items={showList}
          renderItem={(item) => <Card key={item.id} data={item} />}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={() => fetchList(activeMenu)}
          empty={<EmptyState />}
          error={error}
          onRetry={() => fetchList(activeMenu, true)}
        />
      </div>
    </div>
  );
}
