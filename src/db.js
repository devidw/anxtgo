import Dexie from 'dexie'

export const db = new Dexie('ExpDb')
db.version(1).stores({
  reflections: '++id, date, description, abstractionId, implementsAbstraction',
  abstractions: '++id, date, description',
})
