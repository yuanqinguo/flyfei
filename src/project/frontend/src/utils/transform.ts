/**
 * 将秒转换成播放器显示的格式
 * @param seconds
 * @returns
 */
export const formatDuration = (seconds: number) => {
  if (!seconds) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  const pad = (num: number) => String(num).padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`
  }
  return `${pad(minutes)}:${pad(remainingSeconds)}`
}
