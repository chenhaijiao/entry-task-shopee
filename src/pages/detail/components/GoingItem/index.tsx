import { ReactNode, useState } from 'react';
import './index.scss';
import EtImage from '@/components/EtImage';
import EtIcon from '@/components/EtIcon';
import arrowDownIcon from '@/assets/svgs/arrow-down.svg';
import type { UserBase } from '@/types';
type GoingItemProps = {
  children: ReactNode;
  users: UserBase[];
};
export default function GoingItem({ children, users = [] }: GoingItemProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldShowExpand = users.length > 6 && !expanded;
  
  return (
    <div className={`going-item ${expanded ? 'expanded' : ''}`}>
      {children}
      <div className="icon-wrap">
        {users.map((user) => {
          return <EtImage key={user.id} src={user.avatar} className="image" alt={user.username} />;
        })}
        {shouldShowExpand && (
          <EtIcon src={arrowDownIcon} className="arrow-down" onClick={() => setExpanded(true)} />
        )}
      </div>
    </div>
  );
}
