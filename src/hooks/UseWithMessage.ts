import { useCallback, useState } from 'react';

/* eslint-disable-next-line */
export const useErrorHandler = () => {
  const [errorText, setErrorText] = useState('');

  const withError = useCallback((func: () => Promise<void>, errorText: string) => {
    return async () => {
      try {
        await func();
      }
      catch {
        setErrorText(errorText);
      }
    }
  }, []);

  return { withError, errorText };
};

/* eslint-disable-next-line */
export const useLoadingHandler = () => {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = useCallback((func: () => Promise<void>) => {
    return async () => {
      try {
        setIsLoading(true);
        await func();
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  return { withLoading, isLoading };
};