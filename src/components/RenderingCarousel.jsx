import React, { useState } from 'react';
import VideoComparison from './VideoComparison';

const RenderingCarousel = ({ scenes, ko }) => {
  const [selected, setSelected] = useState(0);
  if (!scenes.length) return null;
  const index = selected % scenes.length;
  const scene = scenes[index];

  return (
    <div className="rendering-carousel" role="region"
      aria-roledescription={ko ? '캐러셀' : 'carousel'}
      aria-label="3DGS / Diffusion Refinement">
      <div id="rendering-active-scene" role="group"
        aria-roledescription={ko ? '슬라이드' : 'slide'}
        aria-label={`${index + 1} / ${scenes.length}`}>
        {/* Unmount the previous pair so its playback and media resources are released. */}
        <VideoComparison
          key={scene.id}
          label={`${ko ? '장면' : 'Scene'} ${index + 1}: 3DGS / Diffusion Refinement`}
          beforeSrc={`${process.env.PUBLIC_URL}/videos/rendering/${scene.before}`}
          afterSrc={`${process.env.PUBLIC_URL}/videos/rendering/${scene.after}`}
          beforePoster={`${process.env.PUBLIC_URL}/videos/rendering/${scene.beforePoster}`}
          afterPoster={`${process.env.PUBLIC_URL}/videos/rendering/${scene.afterPoster}`}
          ko={ko}
        />
      </div>
      <nav className="rendering-scene-nav" aria-label={ko ? '비교 장면 선택' : 'Choose comparison scene'}>
        <div className="rendering-scene-buttons">
          {scenes.map((item, itemIndex) => (
            <button type="button" key={item.id} onClick={() => setSelected(itemIndex)}
              className="rendering-scene-button"
              aria-label={`${ko ? '장면' : 'Scene'} ${itemIndex + 1}`}
              aria-current={index === itemIndex ? 'true' : undefined}
              aria-controls="rendering-active-scene">
              {itemIndex + 1}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default RenderingCarousel;
