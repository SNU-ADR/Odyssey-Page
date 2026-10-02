import React, { useMemo, useRef } from 'react';
import useVideoLifecycle from '../../hooks/useVideoLifecycle';

const ViewportVideo = ({ src, ...props }) => {
  const videoRef = useRef(null);
  const sources = useMemo(() => [{ ref: videoRef, src }], [src]);
  useVideoLifecycle(videoRef, sources);

  return <video {...props} ref={videoRef} preload="metadata">Your browser does not support the video tag.</video>;
};

export default ViewportVideo;
