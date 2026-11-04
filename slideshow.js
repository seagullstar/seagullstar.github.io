(() => {
  const carousel = document.querySelector('.slideshow');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.slide')];
  const dots = [...carousel.querySelectorAll('.slide-dot')];
  const toggle = carousel.querySelector('.slide-toggle');
  const lightbox = document.querySelector('.image-lightbox');
  const enlargedImage = lightbox.querySelector('.lightbox-image');
  const imageButton = carousel.querySelector('.slide-images');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = motion.matches;
  let timer = null;
  let hovered = false;
  let focused = false;
  let ready = false;

  const schedule = () => {
    window.clearTimeout(timer);
    if (ready && !paused && !hovered && !focused && !document.hidden && !lightbox.open) {
      timer = window.setTimeout(() => show((current + 1) % slides.length), 5000);
    }
  };
  const show = (index) => {
    current = index;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      dots[i].setAttribute('aria-current', String(i === current));
    });
    if (lightbox.open) {
      const slide = slides[current];
      enlargedImage.src = slide.currentSrc || slide.src;
      enlargedImage.alt = slide.alt;
    }
    schedule();
  };
  const syncToggle = () => {
    toggle.textContent = paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', paused ? '自動切り替えを再開' : '自動切り替えを停止');
  };
  imageButton.addEventListener('click', () => {
    const slide = slides[current];
    enlargedImage.src = slide.currentSrc || slide.src;
    enlargedImage.alt = slide.alt;
    lightbox.showModal();
    schedule();
  });
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('keydown', (event) => {
    if (!lightbox.open || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      show((current + direction + slides.length) % slides.length);
    }
  });
  // Escによる終了も含め、自動再生の設定を変えずに元の操作位置へ戻す。
  lightbox.addEventListener('close', () => {
    imageButton.focus({ preventScroll: true });
    schedule();
  });
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  toggle.addEventListener('click', () => {
    paused = !paused;
    syncToggle();
    schedule();
  });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', (event) => {
    focused = carousel.contains(event.relatedTarget);
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => {
    paused = motion.matches;
    syncToggle();
    schedule();
  });
  carousel.querySelector('.slide-controls').hidden = false;
  syncToggle();
  // 画像の準備が済んでから、最初の5秒を数える。
  Promise.all(slides.map((slide) => slide.decode().catch(() => {}))).then(() => {
    ready = true;
    schedule();
  });
})();
