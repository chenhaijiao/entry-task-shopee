import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import EtSticky from './components/Sticky';
import User from './components/User';
import StickyMenu from '../../components/StickyMenu';
import commentIcon from '@/assets/svgs/comment.svg';
import commentOutlineIcon from '@/assets/svgs/comment-outline.svg';
import infoIcon from '@/assets/svgs/info.svg';
import infoOutlineIcon from '@/assets/svgs/info-outline.svg';
import peopleIcon from '@/assets/svgs/people.svg';
import peopleOutlineIcon from '@/assets/svgs/people-outline.svg';
import EtImage from '@/components/EtImage';
import EtIcon from '@/components/EtIcon';
import ImageCarousel from '@/components/ImageCarousel';
import gmapIcon from '@/assets/images/gmap.png';
import GoingItem from './components/GoingItem';
import checkOutlineIcon from '@/assets/svgs/check-outline.svg';
import likeOutlineIcon from '@/assets/svgs/like-outline.svg';
import When from './components/When';
import './index.scss';
import { useParams } from 'react-router-dom';
import { fetchComments, fetchEventDetail, fetchLikes, fetchParticipants } from '@/services';
import type { UserBase, Event as EventType } from '@/types';
import type { Comment as CommentType } from '@/types/comment';
import Comments from './components/Comments';
import Loading, { startLoading, stopLoading } from '@/components/Loading';
import InfiniteList from '@/components/InfiniteList';

const COMMENT_PAGE_SIZE = 10;
const menuList = [
  {
    menuName: 'Details',
    id: 'Details',
    icon: infoOutlineIcon,
    activeIcon: infoIcon,
  },
  {
    id: 'Participants',
    menuName: 'Participants',
    icon: peopleOutlineIcon,
    activeIcon: peopleIcon,
  },
  {
    id: 'Comments',
    menuName: 'Comments',
    icon: commentOutlineIcon,
    activeIcon: commentIcon,
  },
];
export default function DetailPage() {
  const [activeMenu, setActiveMenu] = useState('Details');
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [showExpand, setShowExpand] = useState(false);
  const params = useParams<{ id?: string }>();
  const eventId = Number(params.id || '1');
  const [detailData, setDetailData] = useState<EventType | null>(null);
  const [goingUsers, setGoingUsers] = useState<UserBase[]>([]);
  const [likeUsers, setLikeUsers] = useState<UserBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const commentsOffsetRef = useRef(0);
  const commentsLoadingRef = useRef(false);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const height = textRef.current.getBoundingClientRect().height;
    setShowExpand(height > 180);
  }, [detailData?.description]);

  const scrollToSection = useCallback((id: string, behavior: ScrollBehavior = 'smooth') => {
    const container = contentRef.current;
    const target = document.getElementById(id);
    if (!container || !target) return;
    const containerTop = container.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const offset = targetTop - containerTop + container.scrollTop - 44;
    container.scrollTo({ top: offset, behavior });
  }, []);

  const loadDetail = useCallback(async () => {
    if (!Number.isFinite(eventId) || eventId <= 0) return;
    startLoading();
    setLoading(true);
    setError(null);
    try {
      const [detailRes, participantsRes, likesRes] = await Promise.all([
        fetchEventDetail(eventId),
        fetchParticipants(eventId),
        fetchLikes(eventId, { offset: 0, limit: 20 }),
      ]);
      setDetailData(detailRes.event);
      setGoingUsers(participantsRes.users || []);
      setLikeUsers(likesRes.users || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load event');
    } finally {
      setLoading(false);
      stopLoading();
    }
  }, [eventId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const loadComments = useCallback(
    async (reset = false) => {
      if (!Number.isFinite(eventId) || eventId <= 0 || commentsLoadingRef.current) return;
      commentsLoadingRef.current = true;
      setCommentsLoading(true);
      if (reset) {
        setComments([]);
        setCommentsError(null);
        setCommentsHasMore(true);
        commentsOffsetRef.current = 0;
      }
      const currentOffset = reset ? 0 : commentsOffsetRef.current;
      try {
        const res = await fetchComments(eventId, {
          offset: currentOffset,
          limit: COMMENT_PAGE_SIZE,
        });
        const list = res.comments || [];
        setComments((prev) => (reset ? list : [...prev, ...list]));
        setCommentsHasMore(res.hasMore ?? list.length === COMMENT_PAGE_SIZE);
        commentsOffsetRef.current = currentOffset + list.length;
      } catch (e: any) {
        setCommentsError(e?.message || 'Failed to load comments');
      } finally {
        commentsLoadingRef.current = false;
        setCommentsLoading(false);
      }
    },
    [eventId],
  );

  useEffect(() => {
    loadComments(true);
  }, [eventId, loadComments]);

  const handleMenuChange = useCallback(
    (id: string) => {
      setActiveMenu(id);
      scrollToSection(id);
    },
    [scrollToSection],
  );

  const handleLikeChange = (liked: boolean) => {
    setDetailData((prev) =>
      prev
        ? {
            ...prev,
            me_likes: liked,
            likes_count: Math.max(0, prev.likes_count + (liked ? 1 : -1)),
          }
        : prev,
    );
  };

  const handleGoingChange = (going: boolean) => {
    setDetailData((prev) =>
      prev
        ? {
            ...prev,
            me_going: going,
            goings_count: Math.max(0, prev.goings_count + (going ? 1 : -1)),
          }
        : prev,
    );
  };

  const onCommentPosted = (comment: CommentType) => {
    setComments((prev) => [comment, ...prev]);
    commentsOffsetRef.current += 1;
    setCommentsHasMore(true);
    setActiveMenu('Comments');
    window.requestAnimationFrame(() => scrollToSection('Comments'));
  };

  if (loading && !detailData) {
    return <Loading fullscreen />;
  }

  if (!detailData || error) {
    return <div className="et-container-detail">{error || 'No data'}</div>;
  }
  return (
    <div className="et-container-detail">
      <div className="et-detail-page-content-wrap" id="detailContentWrap" ref={contentRef}>
        <User data={detailData} />
        <StickyMenu
          id="stickyMenu"
          menuList={menuList}
          activeMenu={activeMenu}
          onChange={handleMenuChange}
          scrollContainerId="detailContentWrap"
        />
        <div className="et-detail-page-content">
          <div className="content-wrap" id="Details">
            <ImageCarousel images={detailData.images} />
            <div className="text-wrap">
              <p className={clsx('text', { 'is-expand': showExpand })} ref={textRef}>
                {detailData.description}
              </p>
              {showExpand && (
                <div className="expand-wrap" onClick={() => setShowExpand(false)}>
                  <div className="expand">VIEW ALL</div>
                </div>
              )}
            </div>
          </div>
          <div className="content-wrap">
            <div className="title-tag-wrap">
              <span className="bar"></span>
              When
            </div>
            <When begin_time={detailData.begin_time} end_time={detailData.end_time} />
          </div>
          <div className="content-wrap no-border">
            <div className="title-tag-wrap">
              <span className="bar"></span>
              Where
            </div>
            <div className="where-wrap">
              <p>{detailData.location}</p>
              <p className="location-detail">{detailData.location_detail}</p>
              <EtImage className="map" src={gmapIcon}></EtImage>
            </div>
          </div>
          <div className="going-likes-wrap" id="Participants">
            <GoingItem users={goingUsers}>
              <div className="w-77">
                <EtIcon src={checkOutlineIcon} className="icon" alt="" />
                <span className="txt">{detailData.goings_count} goings</span>
              </div>
            </GoingItem>
            <GoingItem users={likeUsers}>
              <div className="w-77">
                <EtIcon src={likeOutlineIcon} className="icon" alt="" />
                <span className="txt">{detailData.likes_count} likes</span>
              </div>
            </GoingItem>
          </div>
          <div className="et-comments-wrap" id="Comments">
            <InfiniteList
              items={comments}
              renderItem={(comment) => <Comments key={comment.id} data={comment} />}
              hasMore={commentsHasMore}
              loading={commentsLoading}
              onLoadMore={() => loadComments()}
              empty={<div className="empty">No comments yet</div>}
              error={commentsError}
              onRetry={() => loadComments(true)}
            />
          </div>
        </div>
      </div>
      <EtSticky
        key={detailData.id}
        me_likes={detailData.me_likes}
        me_going={detailData.me_going}
        eventId={detailData.id}
        onLikeChange={handleLikeChange}
        onGoingChange={handleGoingChange}
        onCommentPosted={onCommentPosted}
      />
    </div>
  );
}
