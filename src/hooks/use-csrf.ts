'use client';

import { parse } from 'cookie';

export const useCSRF = () => {
  return (): string => `${parse(document.cookie).csrfToken}`;
};