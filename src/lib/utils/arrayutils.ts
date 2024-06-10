/**
 * @param {Array} values
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unique(values: any[]) {
    const reduction = values.reduce((accumulator, value) => accumulator[value] = true);
    return Object.keys(reduction);
}