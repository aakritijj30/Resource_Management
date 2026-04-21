const IST_TIME_ZONE = 'Asia/Kolkata'
const IST_OFFSET_MINUTES = 330

function isTimezonedIso(value) {
  return /([zZ]|[+-]\d{2}:\d{2})$/.test(value)
}

export function parseApiDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value !== 'string') return new Date(value)

  if (isTimezonedIso(value)) {
    return new Date(value)
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
  )

  if (!match) {
    return new Date(value)
  }

  const [, year, month, day, hour, minute, second = '0', ms = '0'] = match
  const localMillis = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(ms.padEnd(3, '0'))
  )
  return new Date(localMillis - IST_OFFSET_MINUTES * 60 * 1000)
}

function formatDateParts(date, options) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIME_ZONE,
    ...options,
  }).format(date)
}

export function formatISTDate(value, includeYear = true) {
  const date = parseApiDate(value)
  if (!date) return ''
  return formatDateParts(date, {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  })
}

export function formatISTTime(value) {
  const date = parseApiDate(value)
  if (!date) return ''
  return formatDateParts(date, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatISTDateTime(value, includeYear = true) {
  const date = parseApiDate(value)
  if (!date) return ''
  return `${formatISTDate(date, includeYear)}, ${formatISTTime(date)}`
}

export function isAfterNowIST(value) {
  const date = parseApiDate(value)
  return !!date && date.getTime() > Date.now()
}

export function isTodayIST(value) {
  const date = parseApiDate(value)
  if (!date) return false

  const todayParts = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const valueParts = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const getPart = (parts, type) => parts.find(part => part.type === type)?.value

  return (
    getPart(todayParts, 'year') === getPart(valueParts, 'year') &&
    getPart(todayParts, 'month') === getPart(valueParts, 'month') &&
    getPart(todayParts, 'day') === getPart(valueParts, 'day')
  )
}

export function toISTDateTimeInput(value) {
  const date = parseApiDate(value)
  if (!date) return ''
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const getPart = (type) => parts.find(part => part.type === type)?.value
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`
}
