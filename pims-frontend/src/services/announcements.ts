export async function postAnnouncement(webhookUrl: string, text: string) {
  if (!webhookUrl) return { ok: false, error: 'No webhook URL' }
  try {
    // Try Slack-compatible first; many webhooks accept {text}
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return { ok: resp.ok }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Failed' }
  }
}


