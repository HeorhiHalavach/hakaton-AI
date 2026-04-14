const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`API request failed (${response.status}): ${message}`)
  }

  return response.status === 204 ? null : response.json()
}

export async function fetchHistory() {
  const result = await request('/api/history')
  return result.data ?? result
}

export async function analyzeNote(text) {
  return await request('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}
