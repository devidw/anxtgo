import Dexie from 'dexie'

export const db = new Dexie('anxtgo')

db.version(1).stores({
  reflections: '++id, date, description, abstractionId, implementsAbstraction',
  abstractions: '++id, date, description',
})
