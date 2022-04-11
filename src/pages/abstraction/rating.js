import { db } from '../../db'

/**
 * Returns the rating of an abstraction.
 * Each reflection that implements the abstraction will count positive, while each reflection that does not implement the abstraction will count negative.
 * @param {Object} abstraction The abstraction to get the rating of.
 * @returns {Promise<number>} The rating of the abstraction.
 */
export function useAbstractionRating(abstractionId) {
  return db.reflections.where({ abstractionId: abstractionId }).toArray()
    .then((reflections) => {
      return reflections.reduce((rating, reflection) => {
        return (
          rating +
          (reflection.implementsAbstraction === true
            ? 1
            : reflection.implementsAbstraction === false
              ? -1
              : 0)
        )
      }, 0)
    })
}
