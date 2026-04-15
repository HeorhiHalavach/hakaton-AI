import { getUserId } from '../utils/userId'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const withUserIdQuery = (endpoint) => {
  const userId = getUserId()
  const separator = endpoint.includes('?') ? '&' : '?'
  return `${endpoint}${separator}user_id=${encodeURIComponent(userId)}`
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  console.log('API request:', { url, options })

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  console.log('API response status:', response.status, response.statusText)

  if (!response.ok) {
    const message = await response.text()
    console.error('API response error:', { url, status: response.status, body: message })
    throw new Error(`API request failed (${response.status}): ${message}`)
  }

  const data = response.status === 204 ? null : await response.json()
  console.log('API response data:', { url, data })
  return data
}

export async function fetchHistory() {
  const endpoint = withUserIdQuery('/api/history')
  console.log('General history request: fetching history from', `${API_BASE_URL}${endpoint}`)
  const result = await request(endpoint)
  console.log('Fetched history:', result)
  return result.data ?? result
}

export async function fetchWeeklyStatistics() {
  const endpoint = withUserIdQuery('/api/statistics/weekly')
  console.log('Weekly statistics request: fetching weekly stats from', `${API_BASE_URL}${endpoint}`)
  const result = await request(endpoint)
  console.log('Fetched weekly statistics:', result)
  return result.data ?? result
}

export async function fetchMonthlyStatistics() {
  const endpoint = withUserIdQuery('/api/statistics/monthly')
  console.log('Monthly statistics request: fetching monthly stats from', `${API_BASE_URL}${endpoint}`)
  const result = await request(endpoint)
  console.log('Fetched monthly statistics:', result)
  return result.data ?? result
}

export async function analyzeNote(text) {
  const userId = getUserId()
  return await request('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, text }),
  })
}

export async function speakText(text) {
  const url = `${API_BASE_URL}/api/speak`
  console.log('Speak request:', { url, text })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const message = await response.text()
    console.error('Speak response error:', { url, status: response.status, body: message })
    throw new Error(`Ошибка при получении аудио (${response.status}): ${message}`)
  }

  return await response.blob()
}
