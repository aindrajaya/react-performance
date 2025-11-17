import { useState, useEffect, useRef } from 'react';
import { subscribe, getState, shallowEqual } from '../store';

function useSelector(selector) {
  const lastSelectedRef = useRef();
  const [selected, setSelected] = useState(() => {
    const initial = selector(getState());
    lastSelectedRef.current = initial;
    return initial;
  });

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const newSelected = selector(getState());
      if (!shallowEqual(lastSelectedRef.current, newSelected)) {
        lastSelectedRef.current = newSelected;
        setSelected(newSelected);
      }
    });
    return unsubscribe;
  }, [selector]);

  return selected;
}

export { useSelector };