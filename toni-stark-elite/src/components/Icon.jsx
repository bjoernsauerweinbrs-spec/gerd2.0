import React, { useEffect, useRef } from 'react';

// Developer Note:
// The icon creation logic below is a wrapper for Lucide icons that were injected globally in the monolith.
// For a production Vite app, it is highly recommended to `npm install lucide-react` and import icons directly 
// e.g., `import { Zap } from 'lucide-react'` instead of using this DOM-manipulation wrapper.
// This is preserved initially to ensure 1:1 functional compatibility during the split.

const Icon = ({ name, size = 20, className = "" }) => {
  const iconRef = useRef(null);

  useEffect(() => {
    if (iconRef.current && window.lucide) {
      iconRef.current.innerHTML = `<i data-lucide="${name}" class="${className}" style="width:${size}px; height:${size}px"></i>`;
      window.lucide.createIcons({ root: iconRef.current });
    }
  }, [name, size, className]);

  return (
    <span
      ref={iconRef}
      className={`inline-flex items-center justify-center ${className}`}
    ></span>
  );
};

export default Icon;
