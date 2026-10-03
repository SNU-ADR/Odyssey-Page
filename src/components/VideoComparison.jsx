import React, { useEffect, useMemo, useRef, useState } from 'react';
import useVideoLifecycle from '../hooks/useVideoLifecycle';
import '../styles/components/VideoComparison.css';

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const PLAYBACK_RATE = 2;

const VideoComparison = ({ beforeSrc, afterSrc, beforePoster, afterPoster, ko, label }) => {
  const containerRef = useRef(null);
  const beforeRef = useRef(null);
  const afterRef = useRef(null);
  const controlsRef = useRef(null);
  const stageRef = useRef(null);
  const splitInputRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const sources = useMemo(() => [
    { ref: beforeRef, src: beforeSrc },
    { ref: afterRef, src: afterSrc },
  ], [beforeSrc, afterSrc]);

  useVideoLifecycle(containerRef, sources, () => controlsRef.current?.stop());

  useEffect(() => {
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
    let syncTimer;
    let starting = false;
    const pause = () => videos.forEach(video => video.pause());
    const stop = () => {
      wantsPlayback = false;
      clearInterval(syncTimer);
      syncTimer = undefined;
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
      if (videos.every(video => video.readyState >= 1 && Number.isFinite(video.duration))) {
        setDuration(Math.min(before.duration, after.duration));
        setReady(true);
      }
    };
    const sync = () => {
      if (disposed) return;
      if (wantsPlayback) {
        if (videos.every(video => !video.paused && !video.seeking && video.readyState >= 3) && Math.abs(before.currentTime - after.currentTime) > 0.06) {
          after.currentTime = before.currentTime;
        }
        resume();
      }
    };
    const failed = () => { stop(); setError(true); };
    const updateTime = () => { if (before.readyState >= 1) setTime(before.currentTime); };
    const emptied = () => { stop(); setReady(false); };
    const events = { loadedmetadata: metadata, emptied, play: applyPlaybackRate, canplay: resume, seeked: resume, waiting: pause, ended: stop, error: failed };
    videos.forEach(video => Object.entries(events).forEach(([event, handler]) => video.addEventListener(event, handler)));
    before.addEventListener('timeupdate', updateTime);
    controlsRef.current = {
      stop,
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
        // The source runs at 10 fps. Avoid a permanent animation loop for every
        // card, including paused cards, when many comparisons are on the page.
        if (syncTimer === undefined) syncTimer = setInterval(sync, 100);
        resume();
      },
      seek: (value) => {
        pause();
        videos.forEach(video => { video.currentTime = value; });
        setTime(value);
      },
    };
    metadata();
    return () => {
      disposed = true;
      pause();
      clearInterval(syncTimer);
      videos.forEach(video => Object.entries(events).forEach(([event, handler]) => video.removeEventListener(event, handler)));
      before.removeEventListener('timeupdate', updateTime);
      controlsRef.current = null;
    };
  }, [beforeSrc, afterSrc]);

  const updateSplit = (value) => {
    const split = Math.max(0, Math.min(100, value));
    const stage = stageRef.current;
    // Keep pointer feedback independent of React's playback/time updates. Only
    // the clipping boundary changes; neither video needs to render again.
    stage.style.setProperty('--comparison-split', `${split}%`);
    if (split === 0 || split === 100) {
      stage.style.setProperty('--comparison-clip', split === 0 ? 'inset(0)' : 'inset(0 0 0 100%)');
    } else {
      stage.style.removeProperty('--comparison-clip');
    }
    stage.style.setProperty('--comparison-divider-opacity', split === 0 || split === 100 ? '0' : '1');
    splitInputRef.current.value = split;
    splitInputRef.current.setAttribute('aria-valuetext', `${Math.round(split)}% 3DGS, ${Math.round(100 - split)}% diffusion`);
  };

  const moveSplit = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width) updateSplit((event.clientX - bounds.left) / bounds.width * 100);
  };

  return (
    <div ref={containerRef} className="video-comparison" role="group" aria-label={label}>
      <div
        ref={stageRef}
        className="video-comparison-stage"
        onPointerMove={event => { if (event.pointerType === 'mouse' || event.buttons) moveSplit(event); }}
        onPointerDown={event => {
          splitInputRef.current.focus({ preventScroll: true });
          event.currentTarget.setPointerCapture(event.pointerId);
          moveSplit(event);
        }}
      >
        <video ref={beforeRef} poster={beforePoster} muted playsInline preload="metadata" aria-label="3DGS Only" />
        <video ref={afterRef} poster={afterPoster} muted playsInline preload="metadata" className="video-comparison-after" aria-label="Diffusion refinement" />
        <span className="video-comparison-label video-comparison-label--left">3DGS Only</span>
        <span className="video-comparison-label video-comparison-label--right">Diffusion Refinement</span>
        <div className="video-comparison-divider" aria-hidden="true">
          <span>
            <svg viewBox="0 0 24 16" focusable="false">
              <path d="M8 3L3 8L8 13M16 3L21 8L16 13" />
            </svg>
          </span>
        </div>
        <input
          ref={splitInputRef}
          className="video-comparison-split"
          type="range" min="0" max="100" step="0.1" defaultValue={50}
          aria-label={ko ? '3DGS와 Diffusion 비교 경계' : '3DGS and diffusion comparison boundary'}
          aria-valuetext="50% 3DGS, 50% diffusion"
          onChange={event => updateSplit(Number(event.target.value))}
        />
      </div>
      <div className="video-comparison-controls">
        <button type="button" onClick={() => controlsRef.current?.toggle()} disabled={!ready}
          aria-label={playing ? (ko ? '일시정지' : 'Pause') : (ko ? '재생' : 'Play')}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {playing
              ? <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>
              : <path d="M8 5L19 12L8 19Z" />}
          </svg>
        </button>
        <input
          type="range" min="0" max={duration || 1} step="0.01" value={Math.min(time, duration)}
          style={{ '--playback-progress': `${duration ? Math.min(time / duration * 100, 100) : 0}%` }}
          disabled={!ready}
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
