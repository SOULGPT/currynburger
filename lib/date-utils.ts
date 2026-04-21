// Native JavaScript date formatting utilities (no external dependencies)

export function formatDistanceToNow(date: Date | string | number): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`
}

export function format(date: Date | string | number, formatStr: string): string {
  const d = new Date(date)

  if (isNaN(d.getTime())) {
    return "Invalid date"
  }

  const day = d.getDate().toString().padStart(2, "0")
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, "0")
  const minutes = d.getMinutes().toString().padStart(2, "0")
  const seconds = d.getSeconds().toString().padStart(2, "0")

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const fullMonthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Common format patterns
  switch (formatStr) {
    case "PPp":
    case "PPP":
      return `${monthNames[d.getMonth()]} ${day}, ${year} at ${hours}:${minutes}`
    case "PP":
      return `${monthNames[d.getMonth()]} ${day}, ${year}`
    case "p":
      return `${hours}:${minutes}`
    case "dd/MM/yyyy":
      return `${day}/${month}/${year}`
    case "yyyy-MM-dd":
      return `${year}-${month}-${day}`
    case "dd MMM yyyy":
      return `${day} ${monthNames[d.getMonth()]} ${year}`
    case "HH:mm":
      return `${hours}:${minutes}`
    case "HH:mm:ss":
      return `${hours}:${minutes}:${seconds}`
    case "EEEE, MMMM d, yyyy":
      return `${dayNames[d.getDay()]}, ${fullMonthNames[d.getMonth()]} ${d.getDate()}, ${year}`
    case "MMM d, yyyy":
      return `${monthNames[d.getMonth()]} ${d.getDate()}, ${year}`
    default:
      return `${day}/${month}/${year} ${hours}:${minutes}`
  }
}

export function isValid(date: any): boolean {
  if (!date) return false
  const d = new Date(date)
  return !isNaN(d.getTime())
}

export function parseISO(dateString: string): Date {
  return new Date(dateString)
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function isBefore(date1: Date, date2: Date): boolean {
  return date1.getTime() < date2.getTime()
}

export function isAfter(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime()
}

export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Safely converts any date-like value (Date, Firestore Timestamp, string, number) to a JavaScript Date
 * Handles Firestore Timestamps with .toDate() method
 */
export function toDate(value: any): Date {
  if (!value) return new Date()

  // Already a Date object
  if (value instanceof Date) return value

  // Firestore Timestamp with toDate() method
  if (value && typeof value.toDate === "function") {
    return value.toDate()
  }

  // String or number
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    if (!isNaN(date.getTime())) return date
  }

  // Fallback
  return new Date()
}

/**
 * Safely formats any date-like value as a locale date string
 */
export function formatDate(value: any, locale = "en-US", options?: Intl.DateTimeFormatOptions): string {
  const date = toDate(value)
  return date.toLocaleDateString(locale, options)
}
