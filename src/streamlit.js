// Minimal Streamlit v1 component handshake; the demo has no Python widget values.
const streamlitUrl = new URLSearchParams(window.location.search).get('streamlitUrl');
export const isStreamlit = window.parent !== window && Boolean(streamlitUrl);

if (isStreamlit) {
  const parentOrigin = new URL(streamlitUrl).origin;
  const send = (type, data) => window.parent.postMessage(
    { isStreamlitMessage: true, type, ...data }, parentOrigin,
  );
  let previousHeight = 0;
  const resize = () => {
    const height = Math.ceil(document.body.getBoundingClientRect().height);
    if (height > 0 && height !== previousHeight) {
      previousHeight = height;
      send('streamlit:setFrameHeight', { height });
    }
  };
  window.addEventListener('message', event => {
    if (event.source === window.parent && event.origin === parentOrigin && event.data?.type === 'streamlit:render') {
      requestAnimationFrame(resize);
    }
  });
  send('streamlit:componentReady', { apiVersion: 1 });
  new ResizeObserver(resize).observe(document.body);
}
