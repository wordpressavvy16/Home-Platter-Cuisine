import { useState, useEffect } from 'react';

/**
 * A custom hook to create an animated "typing" placeholder effect.
 * It cycles through an array of phrases, typing and deleting them.
 * @param phrases - An array of strings to display.
 * @param typingSpeed - Speed of typing in ms.
 * @param deletingSpeed - Speed of deleting in ms.
 * @param delay - Delay before starting to delete in ms.
 * @returns The current placeholder string.
 */
export const useTypingPlaceholder = (phrases: string[], typingSpeed = 100, deletingSpeed = 50, delay = 2000) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    
    // Logic to switch between typing, deleting, and moving to the next phrase
    if (!isDeleting && charIndex === currentPhrase.length) {
      // Finished typing, wait before deleting
      const timer = setTimeout(() => setIsDeleting(true), delay);
      return () => clearTimeout(timer);
    }
    
    if (isDeleting && charIndex === 0) {
      // Finished deleting, move to the next phrase
      setIsDeleting(false);
      setPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
      return;
    }

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(() => {
      setCharIndex((prevIndex) => prevIndex + (isDeleting ? -1 : 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, delay]);

  useEffect(() => {
    // Update the visible placeholder string
    setPlaceholder(phrases[phraseIndex].substring(0, charIndex));
  }, [charIndex, phraseIndex, phrases]);

  return placeholder;
};