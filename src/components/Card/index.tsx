import clsx from 'clsx';
import EtIcon from '@/components/EtIcon';
import timeIcon from '@/assets/svgs/time.svg';
import checkIcon from '@/assets/svgs/check.svg';
import checkOutlineIcon from '@/assets/svgs/check-outline.svg';
import likeIcon from '@/assets/svgs/like.svg';
import likeOutlineIcon from '@/assets/svgs/like-outline.svg';
import './index.scss';
import { history } from 'umi';

const formatTime = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};
type CardData = {
  id?: number;
  name?: string;
  creator?: {
    username?: string;
    avatar?: string;
  };
  channel?: {
    name?: string;
  };
  images?: string[];
  begin_time?: string;
  end_time?: string;
  description?: string;
  goings_count?: number;
  likes_count?: number;
  me_going?: boolean;
  me_likes?: boolean;
};

type CardProps = {
  data: CardData;
};

export default function Card({ data }: CardProps) {
  const {
    id = '1',
    name = 'Activity Title Name Make it Longer May Longer than One Line',
    creator,
    channel,
    images,
    begin_time,
    end_time,
    description = '[No longer than 300 chars] Vivamus sagittis, diam in lobortis, sapien arcu mattis erat, vel aliquet sem urna et risus. Ut feugiat sapien mi potenti...',
    goings_count = 0,
    likes_count = 0,
    me_going = false,
    me_likes = false,
  } = data || {};
  const username = creator?.username || 'Username';
  const avatarUrl = creator?.avatar;
  const channelName = channel?.name || 'Channel name';
  const coverUrl = images?.[0];
  const initial = (username || 'U').charAt(0).toUpperCase();
  const hasCover = Boolean(coverUrl);
  return (
    <article
      key={id}
      className="et-card"
      aria-label={name}
      onClick={() => history.push(`/events/${id}`)}
    >
      <header className="et-card-header">
        <div className="et-card-user">
          <div className="et-card-avatar" aria-hidden="true">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="et-card-avatar-img" />
            ) : (
              initial || 'U'
            )}
          </div>
          <span className="et-card-username">{username}</span>
        </div>
        <span className="et-card-channel">{channelName}</span>
      </header>

      <div className="et-card-summary">
        <div className="et-card-text">
          <h3 className="et-card-title">{name}</h3>
          <div className="et-card-meta">
            <EtIcon src={timeIcon} color="var(--primary)" className="et-card-meta-icon" alt="" />
            <span className="et-card-meta-text">{`${formatTime(begin_time) ?? ''} - ${
              formatTime(end_time) ?? ''
            }`}</span>
          </div>
          <p
            className={clsx('et-card-description', { 'et-card-description--has-cover': hasCover })}
          >
            {description}
          </p>
          <div className="et-card-actions" aria-label="actions">
            <span
              className={clsx('et-card-action-item et-card-action-going', {
                'is-active': me_going,
              })}
            >
              <EtIcon
                src={me_going ? checkIcon : checkOutlineIcon}
                color={me_going ? 'var(--success)' : '#AC8EC9'}
                className="icon"
                alt=""
              />
              {me_going ? (
                <span className="text">I am going!</span>
              ) : (
                <span className="text">{goings_count} Going</span>
              )}
            </span>
            <span
              className={clsx('et-card-action-item et-card-action-like', { 'is-active': me_likes })}
            >
              <EtIcon
                src={me_likes ? likeIcon : likeOutlineIcon}
                color={me_likes ? 'var(--danger)' : '#AC8EC9'}
                className="icon"
                alt=""
              />
              {me_likes ? (
                <span className="text">I like it</span>
              ) : (
                <span className="text">{likes_count} Likes</span>
              )}
            </span>
          </div>
        </div>
        {hasCover && <img className="et-card-cover" src={coverUrl} alt="" />}
      </div>
    </article>
  );
}
