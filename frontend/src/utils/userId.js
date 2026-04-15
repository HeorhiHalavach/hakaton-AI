export const USER_ID_STORAGE_KEY = 'diary_uid'

export const getUserId = () => {
  let userId = window.localStorage.getItem(USER_ID_STORAGE_KEY)
  if (!userId) {
    if (typeof crypto?.randomUUID === 'function') {
      userId = crypto.randomUUID()
    } else {
      userId = Array.from({ length: 36 }, (_, index) => {
        const random = Math.floor(Math.random() * 16)
        const hex = random.toString(16)
        if ([8, 12, 16, 20].includes(index)) return '-'
        return hex
      }).join('')
    }
    window.localStorage.setItem(USER_ID_STORAGE_KEY, userId)
  }
  return userId
}

export const ensureUserId = () => getUserId()
