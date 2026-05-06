import { useEffect } from 'react';
import { initSIP } from './sip';

useEffect(() => {
  const user = JSON.parse(localStorage.getItem('caas_user') || '{}');
  const password = sessionStorage.getItem('caas_password') || '';
  if (user.number && password) {
    initSIP({
      number: user.number,
      password: password,
      onStatus: ({ type, message }) => {
        console.log('[SIP] Global status:', type, message);
      },
      onIncoming: (callInfo) => {
        console.log('[SIP] Global incoming from:', callInfo.number);
        window.__incomingCall = callInfo;
        window.location.href = '/dialpad';
      },
    });
  }
}, []);