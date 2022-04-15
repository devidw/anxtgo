import { date } from 'quasar'
const { formatDate } = date

export const formatDateDefault = (date) => {
  return formatDate(date, 'dddd, MMMM d, YYYY') + ' at ' + formatDate(date, 'HH:mm')
}

export const required = (val) => !!val || 'Field is required'

export const stripHtml = (html) => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export const toolbar = [
  ['unordered', 'ordered', 'outdent', 'indent'],
  ['undo', 'redo'],
  ['fullscreen', 'viewsource'],
]

