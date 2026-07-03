import React, { useEffect, useState } from 'react';

/** Cycles through strings with a type/delete effect and a blinking caret. */
const TypewriterText: React.FC<{ strings: string[]; className?: string }> = ({
  strings,
  className,
}) => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentString = strings[index];
    const typeSpeed = isDeleting ? 30 : 60;

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentString) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setIndex((index + 1) % strings.length);
      } else {
        setText(currentString.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, strings]);

  return (
    <span className={`inline-block min-h-[1.5em] ${className ?? ''}`}>
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default TypewriterText;
