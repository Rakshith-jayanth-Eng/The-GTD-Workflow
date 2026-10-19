import { getAccessToken } from './firebaseAuth';

export interface GmailEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export async function fetchRecentEmails(maxResults = 8): Promise<GmailEmail[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google OAuth. Please sign in with Google first.');
  }

  // 1. List message IDs from INBOX
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=label:INBOX`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!listRes.ok) {
    const errData = await listRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gmail API error (${listRes.status})`);
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];
  if (messages.length === 0) return [];

  // 2. Fetch metadata for each message
  const emailPromises = messages.map(async (msg: { id: string }) => {
    try {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!detailRes.ok) return null;
      const detail = await detailRes.json();

      const headers = detail.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      return {
        id: detail.id,
        threadId: detail.threadId,
        subject: getHeader('Subject') || '(No Subject)',
        from: getHeader('From') || 'Unknown Sender',
        date: getHeader('Date') || '',
        snippet: detail.snippet || '',
      } as GmailEmail;
    } catch (e) {
      return null;
    }
  });

  const results = await Promise.all(emailPromises);
  return results.filter((item): item is GmailEmail => item !== null);
}

export async function archiveGmailMessage(messageId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        removeLabelIds: ['INBOX'],
      }),
    }
  );

  return res.ok;
}

export async function sendGmailEmail(to: string, subject: string, bodyText: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  // Build raw RFC 2822 email format
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    bodyText,
  ];

  const rawEmail = emailLines.join('\r\n');
  // Base64url encode
  const base64Encoded = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: base64Encoded,
    }),
  });

  return res.ok;
}
