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

export async function fetchDashboardStats() {
  return await request('/dashboard/stats')
}

export async function fetchRecentEntries() {
  return await request('/recent-entries')
}

export async function submitQuickNote(note) {
  return await request('/quick-note', {
    method: 'POST',
    body: JSON.stringify({ note }),
  })
}
