(() => {
  const frame = document.getElementById('project');
  const notice = document.getElementById('boundary');
  const back = document.getElementById('return');
  if (!(frame instanceof HTMLIFrameElement) || !notice || !back) return;
  const home = frame.src;
  document.addEventListener('securitypolicyviolation', event => {
    if (event.effectiveDirective !== 'frame-src') return;
    notice.hidden = false;
    back.focus({ preventScroll: true });
  });
  back.addEventListener('click', () => { notice.hidden = true; frame.src = home; });
})();
