"use client"
import { useEffect, useState } from 'react';

const useLoading = (initialState = true, delay = 0) => {
  const [isLoading, setIsLoading] = useState(initialState);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay]);

  return isLoading;
};

export default useLoading;