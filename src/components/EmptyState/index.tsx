import React from 'react';
import './style.scss';
import EtIcon from '@/components/EtIcon';
import noActiveIcon from '@/assets/svgs/no-activity.svg';
type Props = {
  title?: string;
  description?: string;
};

const EmptyState: React.FC<Props> = ({ title = 'No activity found', description }) => (
  <div className="no-content-wrap">
    <EtIcon src={noActiveIcon} color="#D3C1E5" className="icon" alt="" />
    <div className="tips">{title}</div>
    {description ? <div className="tips">{description}</div> : null}
  </div>
);

export default EmptyState;
