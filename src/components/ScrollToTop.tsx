import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Scroll window to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });

    // 2. Scroll all scrollable main and app-main containers to top
    const scrollContainers = document.querySelectorAll('main, .app-main, .scroll-container');
    scrollContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
