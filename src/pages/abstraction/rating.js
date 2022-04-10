import Localbase from 'localbase'

/**
 * Returns the rating of an abstraction.
 * Each reflection that implements the abstraction will count positive, while each reflection that does not implement the abstraction will count negative.
 * @param {Object} abstraction The abstraction to get the rating of.
 * @returns {Promise<number>} The rating of the abstraction.
 */
export function useAbstractionRating(abstractionId) {
  const db = new Localbase('db')
  return db
    .collection('reflections')
    .get()
    .then((reflections) => {
      reflections = reflections.filter(
        (ref) => ref.abstractionId === abstractionId
      )
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
