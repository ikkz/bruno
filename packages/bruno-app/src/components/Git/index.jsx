import { useRef, useState } from 'react';
import { useEffect } from 'react';
import onloadScript from './onload.js?raw';

const openCodeServer = () => {
  const { ipcRenderer } = window;

  return new Promise((resolve, reject) => {
    ipcRenderer.invoke('renderer:open-code-server').then(resolve).catch(reject);
  });
};

const closeCodeServer = () => {
  const { ipcRenderer } = window;

  return new Promise((resolve, reject) => {
    ipcRenderer.invoke('renderer:close-code-server').then(resolve).catch(reject);
  });
};

const Git = ({ collection }) => {
  const path = collection.pathname;

  const [codeHref, setCodeHref] = useState('');

  useEffect(() => {
    openCodeServer().then(setCodeHref);
    return () => {
      setTimeout(() => {
        closeCodeServer();
      }, 300);
    };
  }, []);

  const ref = useRef();

  useEffect(() => {
    if (!path || !codeHref) {
      return;
    }
    const { current: webview } = ref;
    if (!webview) {
      return;
    }

    const listener = () => {
      if (process.env.NODE_ENV === 'development') {
        webview.openDevTools();
      }
      webview.executeJavaScript(onloadScript);
    };
    webview.addEventListener('did-finish-load', listener);
    return () => webview.removeEventListener('did-finish-load', listener);
  }, [path, codeHref]);

  if (!path || !codeHref) {
    return null;
  }

  const src = `${codeHref}?folder=${encodeURIComponent(path)}`;

  return <webview src={src} key={src} className="flex-1" ref={ref} disablewebsecurity />;
};

export default Git;
