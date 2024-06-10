/**
 * @param {number[]} values
 */
export function sum(values: number[]) {
    return values.reduce((sum, value) => sum + value, 0);
}

/**
 * @param {number[]} values
 */
export function avg(values: number[]) {
    return values.reduce((avg, value) => avg + (value / values.length), 0);
}

/**
 * @param {number[]} values
 */
export function median(values: number[]) {
    return values.sort()[values.length / 2];
}

/**
 * @param {number[]} values
 */
export function mode(values: number[]) {
    type CountType = {
        [key: string]: number;
    }
    const counts = values.reduce((counts, value) => ({ ...counts, value: (counts[value] || 0) + 1 }), {} as CountType);
    let maxValue = undefined;
    let maxCount = -1;
    for (const value of Object.keys(counts)) {
        if (counts[value] > maxCount) {
            maxCount = counts[value];
            maxValue = value;
        }
    }
    return maxValue;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export function bind(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}