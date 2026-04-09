import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { history, useModel } from 'umi';
import { Outlet } from 'react-router-dom';
import ToastHost from '@/components/Toast';
import EtImage from '@/components/EtImage';
import EtIcon from '@/components/EtIcon';
import { GlobalLoadingOverlay } from '@/components/Loading';
import homeIcon from '@/assets/svgs/home.svg';
import catIcon from '@/assets/svgs/logo-cat.svg';
import { useAppSelector } from '@/store/hooks';
import './BasicLayout.scss';

type HeaderConfig = {
  icon: string;
  ariaLabel: string;
  onClick?: () => void;
};

export type BasicLayoutContext = {
  setHeaderConfig: (config: HeaderConfig | null) => void;
  setDrawerContent: (content: React.ReactNode | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const BasicLayout: React.FC = () => {
  useModel('auth');
  useModel('ui');
  const userProfile = useAppSelector((state) => state.user.profile);
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);
  const [drawerContent, setDrawerContent] = useState<React.ReactNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const defaultLeft: HeaderConfig = {
    icon: homeIcon,
    ariaLabel: '主页',
    onClick: () => history.push('/list'),
  };

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const resolvedLeft = headerConfig ?? defaultLeft;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || '';
    }
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isDrawerOpen]);

  const outletContext = useMemo<BasicLayoutContext>(
    () => ({
      setHeaderConfig,
      setDrawerContent,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [closeDrawer, openDrawer, toggleDrawer, setHeaderConfig, setDrawerContent],
  );

  return (
    <div className="basic-layout">
      <ToastHost />
      <GlobalLoadingOverlay />
      <div className={`et-shell ${isDrawerOpen ? 'et-shell--shifted' : ''}`}>
        <header className="layout-header">
          <div className="et-header">
            <button
              type="button"
              className="et-search-button"
              onClick={resolvedLeft.onClick}
              aria-label={resolvedLeft.ariaLabel}
            >
              <EtIcon src={resolvedLeft.icon} className="et-search-icon" alt="" />
            </button>
            <EtIcon
              src={catIcon}
              color="var(--complement)"
              className="et-cat-icon"
              alt="icon"
              onClick={() => history.push('/me')}
            />
            <EtImage
              src={userProfile?.avatar}
              className="et-avatar"
              alt="用户头像"
              onClick={() => history.push('/me')}
            />
          </div>
        </header>
        <main className="layout-main">
          <Outlet context={outletContext} />
        </main>
      </div>
      <div className={`et-drawer ${isDrawerOpen ? 'et-drawer--open' : ''}`}>{drawerContent}</div>
      {isDrawerOpen && <div className="et-drawer-mask" onClick={closeDrawer} />}
    </div>
  );
};

export default BasicLayout;
