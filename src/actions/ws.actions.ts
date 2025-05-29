'use server';

import { getSession } from '@/lib/session';

export async function getWebSocketToken() {
  const session = await getSession();
  
  if (!session.auth?.accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.API_URL}/auth/ws-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.auth.accessToken}`,
      }
    });

    if (!response.ok) {
      return null;
    }

    const { access_token: accessToken } = await response.json();
    return accessToken;
  } catch {
    return null;
  }
}
