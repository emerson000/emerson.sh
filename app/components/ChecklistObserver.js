'use client';

import { useEffect } from 'react';

export function ChecklistObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once visible
          }
        });
      },
      {
        root: null,
        rootMargin: '50px 0px', // Start animation slightly before the item enters the viewport
        threshold: 0.1,
      }
    );

    // Observe all checklist items
    const checklistItems = document.querySelectorAll('.checklist li');
    checklistItems.forEach((item) => {
      // Ensure items start invisible
      item.classList.remove('visible');
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
} 