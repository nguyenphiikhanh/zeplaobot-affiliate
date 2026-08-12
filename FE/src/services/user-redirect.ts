const USER_REDIRECT_PATH_KEY = 'user_redirect_path'

export const saveUserRedirectPath = (path: string) => {
  if (path.startsWith('/') && !path.startsWith('/admin') && path !== '/login') {
    localStorage.setItem(USER_REDIRECT_PATH_KEY, path)
  }
}

export const consumeUserRedirectPath = (): string | null => {
  const path = localStorage.getItem(USER_REDIRECT_PATH_KEY)
  localStorage.removeItem(USER_REDIRECT_PATH_KEY)
  return path?.startsWith('/') && !path.startsWith('/admin') && path !== '/login' ? path : null
}
