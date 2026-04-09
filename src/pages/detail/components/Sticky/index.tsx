import './index.scss';
import EtIcon from '@/components/EtIcon';
import checkIcon from '@/assets/svgs/check.svg';
import checkOutlineIcon from '@/assets/svgs/check-outline.svg';
import likeIcon from '@/assets/svgs/like.svg';
import likeOutlineIcon from '@/assets/svgs/like-outline.svg';
import commentSingleIcon from '@/assets/svgs/comment-single.svg';
import crossIcon from '@/assets/svgs/cross.svg';
import sendIcon from '@/assets/svgs/send.svg';
import EtInput from '@/components/EtInput';
import { likeEvent, unlikeEvent, joinEvent, quitEvent, postComment } from '@/services';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { showToast } from '@/components/Toast';
import type { Comment as CommentType } from '@/types/comment';
type Props = {
  me_likes: boolean;
  me_going: boolean;
  eventId: number;
  onLikeChange?: (liked: boolean) => void;
  onGoingChange?: (going: boolean) => void;
  onCommentPosted?: (comment: CommentType) => void;
};
export default function EtSticky({
  me_likes,
  me_going,
  eventId,
  onLikeChange,
  onGoingChange,
  onCommentPosted,
}: Props) {
  const CLICK_THROTTLE_MS = 500;
  const [isLike, setIsLike] = useState(me_likes);
  const [isGoing, setMeGoing] = useState(me_going);
  const [sending, setSending] = useState(false);
  const likeInFlightRef = useRef(false);
  const joinInFlightRef = useRef(false);
  const likeLastClickRef = useRef(0);
  const joinLastClickRef = useRef(0);

  const allowClick = (lastClickRef: React.MutableRefObject<number>) => {
    const now = Date.now();
    if (now - lastClickRef.current < CLICK_THROTTLE_MS) return false;
    lastClickRef.current = now;
    return true;
  };
  const toggleAction = async ({
    currentState,
    setState,
    onChange,
    action,
  }: {
    currentState: boolean;
    setState: (value: boolean) => void;
    onChange?: (value: boolean) => void;
    action: {
      enable: () => Promise<void>;
      disable: () => Promise<void>;
      enableMsg: string;
      disableMsg: string;
    };
  }) => {
    const anchorId = 'stickyMenu';
    const next = !currentState;
    setState(next);
    try {
      if (next) {
        await action.enable();
        showToast({ content: action.enableMsg, type: 'success', anchorId });
      } else {
        await action.disable();
        showToast({ content: action.disableMsg, type: 'success', anchorId });
      }
      onChange?.(next);
    } catch {
      setState(!next);
      onChange?.(!next);
      showToast({ content: 'Operation failed, please try again', type: 'error' });
    }
  };
  const onLike = async () => {
    if (!allowClick(likeLastClickRef) || likeInFlightRef.current) return;
    likeInFlightRef.current = true;
    try {
      await toggleAction({
        currentState: isLike,
        setState: setIsLike,
        onChange: onLikeChange,
        action: {
          enable: () => likeEvent(eventId),
          disable: () => unlikeEvent(eventId),
          enableMsg: 'Like Success',
          disableMsg: 'Unlike Success',
        },
      });
    } finally {
      likeInFlightRef.current = false;
    }
  };
  const onJoin = async () => {
    if (!allowClick(joinLastClickRef) || joinInFlightRef.current) return;
    joinInFlightRef.current = true;
    try {
      await toggleAction({
        currentState: isGoing,
        setState: setMeGoing,
        onChange: onGoingChange,
        action: {
          enable: () => joinEvent(eventId),
          disable: () => quitEvent(eventId),
          enableMsg: 'Join Success',
          disableMsg: 'Quit Success',
        },
      });
    } finally {
      joinInFlightRef.current = false;
    }
  };
  const [showSend, setShowSend] = useState(false);
  const [sendMsg, setSendMsg] = useState('');
  const closeSend = () => {
    setShowSend(false);
    setSendMsg('');
  };
  const toSendMsg = async () => {
    const anchorId = 'stickyMenu';
    const content = sendMsg.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const newComment = await postComment(eventId, { comment: content });
      onCommentPosted?.(newComment);
      showToast({ content: 'Comment posted', type: 'success', anchorId });
      closeSend();
    } catch (e: any) {
      showToast({ content: e?.message || 'Failed to post comment', type: 'error', anchorId });
    } finally {
      setSending(false);
    }
  };
  return !showSend ? (
    <div className="et-sticky-wrap">
      <div className="left-wrap">
        <EtIcon onClick={() => setShowSend(true)} src={commentSingleIcon} className="icon" alt="" />
        <EtIcon
          onClick={onLike}
          src={isLike ? likeIcon : likeOutlineIcon}
          className={clsx('icon', { 'is-active': isLike })}
          alt=""
        />
      </div>
      <div className={clsx('right-wrap', { 'is-active': isGoing })} onClick={onJoin}>
        <EtIcon src={isGoing ? checkIcon : checkOutlineIcon} className="icon" alt="" />
        <span className="going-tips">{isGoing ? 'I am going' : 'Join'}</span>
      </div>
    </div>
  ) : (
    <div className="et-send-msg-wrap">
      <div className="send-left-wrap">
        <EtIcon src={crossIcon} onClick={closeSend} className="close-icon" alt="" />
        <EtInput
          value={sendMsg}
          className="input-wrap"
          placeholder="Leave your comment here"
          onChange={(e) => setSendMsg(e.target.value)}
        ></EtInput>
      </div>
      <div className="send-right-wrap">
        <EtIcon src={sendIcon} className="send-icon" alt="" onClick={toSendMsg} />
      </div>
    </div>
  );
}
