export const sendResponse = <T>(data: T, message: string) => ({
  success: true as const,
  data,
  message,
})

export const sendSuccess = (message: string) => ({
  success: true as const,
  message,
})

export const sendError = (message: string) => ({
  success: false as const,
  message,
})
