import { useState, useEffect } from 'react';

export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => setReady(true));
  }, []);

  return ready;
}
