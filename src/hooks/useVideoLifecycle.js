import { useEffect, useRef } from 'react';

// Load a little ahead of scrolling, but retain nearby paused videos to avoid
// reloading while the user moves between adjacent cards.
const LOAD_MARGIN = '300px';
const RETAIN_MARGIN = '1200px';
const RELEASE_DELAY = 2000;

export default function useVideoLifecycle(containerRef, sources, onSuspend) {
  const suspendRef = useRef(onSuspend);
  suspendRef.current = onSuspend;

  useEffect(() => {
    const container = containerRef.current;
    const videos = sources.map(({ ref }) => ref.current);
    let loaded = false;
    let near = false;
    let retained = false;
    let releaseTimer;
    let savedTime = 0;
    let savedRates = videos.map(video => video.playbackRate);
    const inPictureInPicture = () => videos.includes(document.pictureInPictureElement);
    const visible = () => {
      const rect = container.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    };
    const suspend = () => {
      if (inPictureInPicture()) return;
      suspendRef.current?.();
      videos.forEach(video => video.pause());
    };
    const release = () => {
      if (!loaded || retained || inPictureInPicture()) return;
      suspend();
      savedTime = videos[0].currentTime;
      savedRates = videos.map(video => video.playbackRate);
      loaded = false;
      videos.forEach(video => {
        video.removeAttribute('src');
        video.preload = 'metadata';
        // Removing src alone does not discard the media resource/decoder.
        video.load();
      });
    };
    const scheduleRelease = () => {
      clearTimeout(releaseTimer);
      if (!retained) releaseTimer = setTimeout(release, RELEASE_DELAY);
    };
    const load = () => {
      if (loaded || document.hidden) return;
      loaded = true;
      sources.forEach(({ src }, index) => {
        videos[index].src = src;
        videos[index].load();
      });
    };
    const restore = videos.map((video, index) => () => {
      if (!loaded) return;
      video.playbackRate = savedRates[index];
      if (savedTime > 0 && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(savedTime, video.duration);
      }
    });
    const guardPlayback = () => {
      if (document.hidden || !visible()) suspend();
    };
    const visibilityChanged = () => {
      if (document.hidden) suspend();
      else if (near) load();
    };
    const pipEnded = () => { guardPlayback(); scheduleRelease(); };
    videos.forEach((video, index) => {
      video.addEventListener('loadedmetadata', restore[index]);
      video.addEventListener('play', guardPlayback);
      video.addEventListener('leavepictureinpicture', pipEnded);
    });
    const loadObserver = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near) load();
    }, { rootMargin: LOAD_MARGIN });
    const retainObserver = new IntersectionObserver(([entry]) => {
      retained = entry.isIntersecting;
      scheduleRelease();
    }, { rootMargin: RETAIN_MARGIN });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) suspend();
    });
    [loadObserver, retainObserver, visibilityObserver].forEach(observer => observer.observe(container));
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
      clearTimeout(releaseTimer);
      [loadObserver, retainObserver, visibilityObserver].forEach(observer => observer.disconnect());
      document.removeEventListener('visibilitychange', visibilityChanged);
      videos.forEach((video, index) => {
        video.removeEventListener('loadedmetadata', restore[index]);
        video.removeEventListener('play', guardPlayback);
        video.removeEventListener('leavepictureinpicture', pipEnded);
        video.pause();
        video.removeAttribute('src');
        video.load();
      });
    };
  }, [containerRef, sources]);
}
