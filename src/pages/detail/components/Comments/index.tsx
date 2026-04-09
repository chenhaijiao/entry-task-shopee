import './index.scss';
import replyIcon from '@/assets/svgs/reply.svg';
import EtImage from '@/components/EtImage';
import EtIcon from '@/components/EtIcon';
import { useModel } from 'umi';
import { formatTimeAgo } from '@/utils/time';
import type { Comment } from '@/types/comment';

type CommentsDataProps = {
  data: Comment;
};
export default function Comments({ data }: CommentsDataProps) {
  const { lang } = useModel('ui');
  return (
    <div className="et-comments">
      <EtImage className="avatar" src={data.user.avatar}></EtImage>
      <div className="et-comments_right">
        <div className="et-comments_desc">
          <span className="nickname">
            {data.user.username}
            <span className="time">{formatTimeAgo(data.create_time, lang)}</span>
          </span>
        </div>
        <p className="et-comments_details">{data.comment}</p>
      </div>
      <EtIcon className="share-icon" src={replyIcon}></EtIcon>
    </div>
  );
}
