import React from 'react';

const VideoEmbed = ({ url, title, placeholder }) => {
  if (!url) {
    return (
      <div className="video-placeholder">
        <p>{placeholder || '데모 영상 준비 중'}</p>
      </div>
    );
  }

  if (url.includes('.gif') || url.includes('.webm') || url.includes('.mp4')) {
    return (
      <div className="video-embed-gif">
        <video autoPlay loop muted playsInline>
          <source src={url} />
        </video>
      </div>
    );
  }

  return (
    <div className="video-embed">
      <iframe
        src={url}
        title={title}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default VideoEmbed;
