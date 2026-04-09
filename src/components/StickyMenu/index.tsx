import clsx from 'clsx';
import EtIcon from '@/components/EtIcon';
import { useEffect, useRef, useState } from 'react';
import './index.scss';

type MenuItem = {
  id: string;
  menuName: string;
  icon: string;
  activeIcon: string;
};

type StickyMenuProps = {
  id: string;
  menuList: MenuItem[];
  activeMenu: string;
  onChange: (id: string) => void;
  scrollContainerId?: string;
  stopStickId?: string;
  offsetTop?: number;
  releaseGap?: number;
};

function StickyMenu({
  id,
  menuList,
  activeMenu,
  onChange,
  scrollContainerId,
  stopStickId,
  offsetTop = 0,
  releaseGap = 20,
}: StickyMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const stickyRef = useRef(false);
  const initialTopRef = useRef<number | null>(null);

  const getScrollTop = (el: HTMLElement | Window) =>
    el === window
      ? window.scrollY || document.documentElement.scrollTop
      : (el as HTMLElement).scrollTop;

  useEffect(() => {
    const scrollContainer =
      (scrollContainerId && document.getElementById(scrollContainerId)) || window;

    if (!scrollContainer) return;

    const computeInitialTop = () => {
      const menuEl = menuRef.current;
      if (!menuEl) return;
      const containerRect =
        scrollContainer === window
          ? { top: 0 }
          : (scrollContainer as HTMLElement).getBoundingClientRect();
      const menuRect = menuEl.getBoundingClientRect();
      const scrollTop = getScrollTop(scrollContainer);
      initialTopRef.current = menuRect.top - containerRect.top + scrollTop;
    };

    const handleScroll = () => {
      const menuEl = menuRef.current;
      if (!menuEl) return;

      if (!stickyRef.current || initialTopRef.current === null) {
        computeInitialTop();
      }

      const currentScrollTop = getScrollTop(scrollContainer);
      const originTop = initialTopRef.current ?? 0;
      const distanceToTop = originTop - currentScrollTop;

      const stopEl = stopStickId ? document.getElementById(stopStickId) : null;
      const shouldStop = !!stopEl && stopEl.getBoundingClientRect().top <= offsetTop + 1;

      if (stickyRef.current) {
        if (shouldStop || distanceToTop >= offsetTop + releaseGap) {
          stickyRef.current = false;
          setIsSticky(false);
        }
      } else {
        if (!shouldStop && distanceToTop <= offsetTop + 4) {
          stickyRef.current = true;
          setIsSticky(true);
        }
      }
    };

    computeInitialTop();
    handleScroll();

    const target = scrollContainer === window ? window : (scrollContainer as HTMLElement);
    target.addEventListener('scroll', handleScroll, { passive: true });
    if (scrollContainer !== window) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('resize', computeInitialTop);

    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (scrollContainer !== window) {
        window.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', computeInitialTop);
    };
  }, [offsetTop, releaseGap, scrollContainerId, stopStickId]);

  return (
    <div
      className={clsx('et-detail-sticky-menu', { 'is-sticky': isSticky })}
      id={id}
      ref={menuRef}
      style={isSticky ? { top: offsetTop } : undefined}
    >
      {menuList.map((menu) => (
        <div
          key={menu.id}
          className={clsx('menu-item', { active: menu.id === activeMenu })}
          onClick={() => onChange(menu.id)}
        >
          <EtIcon
            src={menu.id === activeMenu ? menu.activeIcon : menu.icon}
            className="icon"
            alt=""
          />
          <div className="name">{menu.menuName}</div>
        </div>
      ))}
    </div>
  );
}

export default StickyMenu;
