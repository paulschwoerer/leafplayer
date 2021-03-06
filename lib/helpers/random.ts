export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomArrayElements<T = unknown>(
  pool: T[],
  count: number,
): T[] {
  if (count < 0) {
    throw new RangeError('count cannot be negative');
  }

  if (pool.length <= count) {
    return pool;
  }

  let length = pool.length;
  const result: T[] = new Array(count);
  const taken: number[] = new Array(length);

  while (count--) {
    const i = Math.floor(Math.random() * length);

    result[count] = pool[i in taken ? taken[i] : i];
    taken[i] = --length in taken ? taken[length] : length;
  }

  return result;
}
