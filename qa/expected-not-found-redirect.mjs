export async function inspectExpectedNotFoundRedirect(initialResponse, baseUrl, fetchImpl = fetch) {
  const origin = new URL(baseUrl).origin;
  let location = initialResponse.headers.get('location') || '';
  if (initialResponse.status < 300 || initialResponse.status >= 400 || !location) {
    return { accepted: false, terminalStatus: null, finalUrl: null, hops: 0 };
  }

  let current = new URL(location, baseUrl);
  let terminalStatus = null;
  for (let hop = 1; hop <= 5; hop++) {
    if (current.origin !== origin) {
      return { accepted: false, terminalStatus, finalUrl: current.href, hops: hop - 1 };
    }

    const response = await fetchImpl(current.href, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(15000)
    });
    terminalStatus = response.status;

    if (response.status >= 300 && response.status < 400) {
      location = response.headers.get('location') || '';
      if (!location) return { accepted: false, terminalStatus, finalUrl: current.href, hops: hop };
      current = new URL(location, current);
      continue;
    }

    if ([403, 404, 410].includes(response.status)) {
      return { accepted: true, terminalStatus, finalUrl: current.href, hops: hop };
    }

    if (response.status === 200 && (response.headers.get('content-type') || '').toLowerCase().includes('text/html')) {
      const body = (await response.text()).toLowerCase();
      const explicitNoindex = /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(body);
      const explicitNotFoundPage = /<title>\s*page moved\b/i.test(body);
      return { accepted: explicitNoindex && explicitNotFoundPage, terminalStatus, finalUrl: current.href, hops: hop };
    }

    return { accepted: false, terminalStatus, finalUrl: current.href, hops: hop };
  }

  return { accepted: false, terminalStatus, finalUrl: current.href, hops: 5 };
}
