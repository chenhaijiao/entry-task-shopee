import React, { useEffect, useState } from 'react';
import { history, useIntl, useModel } from 'umi';
import EtButton from '@/components/EtButton';
import EtInput from '@/components/EtInput';
import EtImage from '@/components/EtImage';
import Loading from '@/components/Loading';
import ToastHost, { showToast } from '@/components/Toast';
import emailIcon from '@/assets/svgs/email.svg';
import passwordIcon from '@/assets/svgs/password.svg';
import logoCat from '@/assets/svgs/cat.svg';
import './index.scss';

const LoginPage: React.FC = () => {
  const intl = useIntl();
  const { login, loading, authed } = useModel('auth');
  const { lang, toggleLang } = useModel('ui');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!authed) return;
    const search = new URLSearchParams(history.location.search);
    const redirect = search.get('redirect');
    history.replace(redirect || '/list');
  }, [authed]);

  if (authed) {
    return <Loading fullscreen />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      const msg = intl.formatMessage({ id: 'error.emptyFields' });
      showToast({ content: msg, type: 'error' });
      return;
    }
    try {
      await login(username, password);
      showToast({ content: intl.formatMessage({ id: 'login.success' }), type: 'success' });
    } catch (err: any) {
      const msg = err?.message || intl.formatMessage({ id: 'login.failed' });
      showToast({ content: msg, type: 'error' });
    }
  };

  return (
    <div className="login-page">
      <ToastHost />
      <div className="overlay-content">
        <button
          type="button"
          className="lang"
          onClick={() => toggleLang(lang === 'zh-CN' ? 'en-US' : 'zh-CN')}
        >
          {intl.formatMessage({ id: 'login.switchLang' })}
        </button>
        <div className="hero">
          <p className="kicker">{intl.formatMessage({ id: 'login.tagline' })}</p>
          <h1 className="title">{intl.formatMessage({ id: 'login.brand' })}</h1>
        </div>
        <div className="logo-wrap">
          <EtImage src={logoCat} alt="Black cat logo" className="logo" />
        </div>
        <form className="form-wrap" onSubmit={handleSubmit}>
          <div className="mgt-16 input-item">
            <EtInput
              placeholder={intl.formatMessage({ id: 'login.username.placeholder' })}
              value={username}
              iconSrc={emailIcon}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mgt-16 input-item">
            <EtInput
              type="password"
              placeholder={intl.formatMessage({ id: 'login.password' })}
              value={password}
              iconSrc={passwordIcon}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <EtButton className="button-wrap" type="submit" loading={loading} disabled={loading}>
            {intl.formatMessage({ id: 'login.submit' })}
          </EtButton>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
