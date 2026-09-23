"use client";

import { useEffect, useMemo, useState } from "react";

function shuffle(items) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // При нескольких тегах не оставляем исходный порядок случайно неизменным.
  if (shuffled.length > 1 && shuffled.every((item, i) => item.originalIndex === i)) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

export default function useShuffledTagItems(tags, questionKey) {
  const sourceItems = useMemo(
    () => tags.map((tag, originalIndex) => ({ tag, originalIndex })),
    [tags],
  );
  const [shuffledItems, setShuffledItems] = useState(sourceItems);

  useEffect(() => {
    setShuffledItems(shuffle(sourceItems));
  }, [questionKey, sourceItems]);

  return shuffledItems;
}
