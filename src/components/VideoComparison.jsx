import React, { useEffect, useRef, useState } from 'react';
import '../styles/components/VideoComparison.css';

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const PLAYBACK_RATE = 2;

const VideoComparison = ({ beforeSrc, afterSrc, beforePoster, afterPoster, ko, label }) => {
  const containerRef = useRef(null);
  const beforeRef = useRef(null);
  const afterRef = useRef(null);
  const controlsRef = useRef(null);
  const [split, setSplit] = useState(50);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px' });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const before = beforeRef.current;
    const after = afterRef.current;
    const videos = [before, after];
    const applyPlaybackRate = () => videos.forEach(video => {
      video.defaultPlaybackRate = PLAYBACK_RATE;
      video.playbackRate = PLAYBACK_RATE;
    });
    applyPlaybackRate();
    let wantsPlayback = false;
    let disposed = false;
    let frame;
    let starting = false;
    const pause = () => videos.forEach(video => video.pause());
    const stop = () => {
      wantsPlayback = false;
      pause();
      setPlaying(false);
    };
    const resume = async () => {
      if (disposed || starting || !wantsPlayback || videos.every(video => !video.paused) || videos.some(video => video.readyState < 3 || video.seeking)) return;
      starting = true;
      try {
        applyPlaybackRate();
        await Promise.all(videos.map(video => video.play()));
        if (disposed || !wantsPlayback) pause();
      } catch (err) {
        if (!disposed && err.name !== 'AbortError') {
          stop();
          setError(true);
        }
      } finally {
        starting = false;
      }
    };
    const metadata = () => {
      applyPlaybackRate();
      if (videos.every(video => Number.isFinite(video.duration))) {
        setDuration(Math.min(before.duration, after.duration));
      }
    };
    const sync = () => {
      if (disposed) return;
      if (wantsPlayback) {
        if (!before.seeking && !after.seeking && Math.abs(before.currentTime - after.currentTime) > 0.06) {
          after.currentTime = before.currentTime;
        }
        resume();
      }
      frame = requestAnimationFrame(sync);
    };
    const failed = () => { stop(); setError(true); };
    const updateTime = () => setTime(before.currentTime);
    const events = { loadedmetadata: metadata, play: applyPlaybackRate, canplay: resume, seeked: resume, waiting: pause, ended: stop, error: failed };
    videos.forEach(video => Object.entries(events).forEach(([event, handler]) => video.addEventListener(event, handler)));
    before.addEventListener('timeupdate', updateTime);
    controlsRef.current = {
      toggle: () => {
        if (wantsPlayback) return stop();
        setError(false);
        applyPlaybackRate();
        if (videos.some(video => video.ended)) videos.forEach(video => { video.currentTime = 0; });
        wantsPlayback = true;
        setPlaying(true);
        // Metadata is sufficient until playback is requested. Setting auto here
        // lets canplay resume both streams together once their frames are ready.
        videos.forEach(video => { video.preload = 'auto'; });
        resume();
      },
      seek: (value) => {
        pause();
        videos.forEach(video => { video.currentTime = value; });
        setTime(value);
      },
    };
    metadata();
    frame = requestAnimationFrame(sync);
    return () => {
      disposed = true;
      pause();
      cancelAnimationFrame(frame);
      videos.forEach(video => Object.entries(events).forEach(([event, handler]) => video.removeEventListener(event, handler)));
      before.removeEventListener('timeupdate', updateTime);
      controlsRef.current = null;
    };
  }, [beforeSrc, afterSrc, active]);

  const moveSplit = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setSplit(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)));
  };

  return (
    <div ref={containerRef} className="video-comparison" role="group" aria-label={label}>
      <div
        className="video-comparison-stage"
        style={{
          '--comparison-split': `${split}%`,
          '--comparison-clip': split === 0 ? 'inset(0)' : split === 100 ? 'inset(0 0 0 100%)' : undefined,
          '--comparison-divider-opacity': split === 0 || split === 100 ? 0 : 1,
        }}
        onPointerMove={event => { if (event.pointerType === 'mouse' || event.buttons) moveSplit(event); }}
        onPointerDown={event => {
          event.currentTarget.setPointerCapture(event.pointerId);
          moveSplit(event);
        }}
      >
        <video ref={beforeRef} src={active ? beforeSrc : undefined} poster={beforePoster} muted playsInline preload="metadata" aria-label="3DGS Only" />
        <video ref={afterRef} src={active ? afterSrc : undefined} poster={afterPoster} muted playsInline preload="metadata" className="video-comparison-after" aria-label="Diffusion refinement" />
        <span className="video-comparison-label video-comparison-label--left">3DGS Only</span>
        <span className="video-comparison-label video-comparison-label--right">Diff. Refine</span>
        <div className="video-comparison-divider" aria-hidden="true">
          <span>
            <svg viewBox="0 0 24 16" focusable="false">
              <path d="M8 3L3 8L8 13M16 3L21 8L16 13" />
            </svg>
          </span>
        </div>
        <input
          className="video-comparison-split"
          type="range" min="0" max="100" step="0.1" value={split}
          aria-label={ko ? '3DGS와 Diffusion 비교 경계' : '3DGS and diffusion comparison boundary'}
          aria-valuetext={`${Math.round(split)}% 3DGS, ${Math.round(100 - split)}% diffusion`}
          onChange={event => setSplit(Number(event.target.value))}
        />
      </div>
      <div className="video-comparison-controls">
        <button type="button" onClick={() => controlsRef.current?.toggle()} disabled={!duration}>
          {playing ? (ko ? '일시정지' : 'Pause') : (ko ? '재생' : 'Play')}
        </button>
        <input
          type="range" min="0" max={duration || 1} step="0.01" value={Math.min(time, duration)}
          style={{ '--playback-progress': `${duration ? Math.min(time / duration * 100, 100) : 0}%` }}
          disabled={!duration}
          aria-label={ko ? '비교 영상 재생 위치' : 'Comparison playback position'}
          onChange={event => controlsRef.current?.seek(Number(event.target.value))}
        />
        <span>{formatTime(time)} / {formatTime(duration)}</span>
      </div>
      {error && <p role="alert">{ko ? '영상 재생에 실패했습니다. 다시 시도해주세요.' : 'Video playback failed. Please try again.'}</p>}
    </div>
  );
};

export default VideoComparison;
