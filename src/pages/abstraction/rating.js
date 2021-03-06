import { db } from 'boot/db'

/**
 * Returns the rating of an abstraction.
 *
 * Each reflection that implements the abstraction will count positive, while each reflection that does not implement the abstraction will count negative.
 *
 * @param {Number} abstractionId The abstraction ID to get the rating of.
 *
 * @returns {Promise<number>} The rating of the abstraction.
 */
export async function useAbstractionRating(abstractionId) {
  const getRating = (reflections) => {
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
  }

  const reflections = await db.reflections
    .where({ abstractionId: abstractionId })
    .toArray()

  return getRating(reflections)
}
