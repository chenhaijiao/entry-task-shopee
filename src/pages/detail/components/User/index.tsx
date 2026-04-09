import './index.scss';
import EtImage from '@/components/EtImage';
import { useModel } from 'umi';
import { formatTimeAgo } from '@/utils/time';
import type { Event } from '@/types/event';
type UserDataProps = {
  data: Event;
};
export default function User({ data }: UserDataProps) {
  const { lang } = useModel('ui');
  return (
    <div className="et-detail-user-wrap">
      <div className="channel">{data.channel.name}</div>
      <div className="title">{data.name}</div>
      <div className="user-wrap">
        <EtImage src={data.creator.avatar} className="avatar" alt="" />
        <div className="user-info">
          <div className="nick-name">{data.creator.username}</div>
          <div className="status">Published {formatTimeAgo(data.create_time, lang)}</div>
        </div>
      </div>
    </div>
  );
}
