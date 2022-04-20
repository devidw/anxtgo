import { date } from 'quasar'
const { formatDate } = date

export const required = (val) => !!val || 'Field is required'

export const formatDateDefault = (date) => {
  return formatDate(date, 'dddd, MMMM DD, YYYY') + ' at ' + formatDate(date, 'HH:mm:ss')
}

export const stripHtml = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export const standardizeText = (text) => {
  return stripHtml(text).replace(/\s/g, '').toLowerCase()
}

export const toolbar = [
  ['unordered', 'ordered', 'outdent', 'indent'],
  ['undo', 'redo'],
  ['fullscreen', 'viewsource'],
]

