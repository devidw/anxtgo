import Dexie from 'dexie'

export const db = new Dexie('anxtgo')

db.version(2).stores({
  reflections:
    '++id, date, description, abstractionId, implementsAbstraction, consequences',
  abstractions: '++id, date, description',
  consequences: '++id, name, type, unit, symbol',
})
