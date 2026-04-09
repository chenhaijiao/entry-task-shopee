import EtIcon from '@/components/EtIcon';
import dateFromIcon from '@/assets/svgs/date-from.svg';
import dateToIcon from '@/assets/svgs/date-to.svg';
import { useModel } from 'umi';
import { formatDisplayDate, formatDisplayTimeParts } from '@/utils/time';
import './index.scss';
type WhenProps = {
  begin_time: string;
  end_time: string;
};
export default function When({ begin_time, end_time }: WhenProps) {
  const { lang } = useModel('ui');

  const beginDate = formatDisplayDate(begin_time, lang);
  const beginTime = formatDisplayTimeParts(begin_time, lang);
  const endDate = formatDisplayDate(end_time, lang);
  const endTime = formatDisplayTimeParts(end_time, lang);

  return (
    <div className="when-wrap">
      <div className="when-item">
        <div className="time-wrap">
          <EtIcon className="icon" src={dateFromIcon}></EtIcon>
          <span className="tips">{beginDate}</span>
        </div>
        <p>
          <span className="time">
            {beginTime.time}
            {beginTime.suffix ? <span className="am">{beginTime.suffix}</span> : null}
          </span>
        </p>
      </div>
      <div className="when-item">
        <div className="time-wrap">
          <EtIcon className="icon" src={dateToIcon}></EtIcon>

          <span className="tips">{endDate}</span>
        </div>
        <p>
          <span className="time">
            {endTime.time}
            {endTime.suffix ? <span className="am">{endTime.suffix}</span> : null}
          </span>
        </p>
      </div>
    </div>
  );
}
