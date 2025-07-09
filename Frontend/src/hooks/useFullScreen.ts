import { useState, useEffect } from 'react';

export const useFullscreen = (
  externalFullscreen?: boolean,
  onFullscreenChange?: (fullscreen: boolean) => void
) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (externalFullscreen !== undefined) {
      setIsFullscreen(externalFullscreen);
    }
  }, [externalFullscreen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    if (onFullscreenChange) {
      onFullscreenChange(newFullscreenState);
    }
  };

  return {
    isFullscreen,
    toggleFullscreen
  };
};