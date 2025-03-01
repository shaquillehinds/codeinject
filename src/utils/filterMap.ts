type FilterMapFunc<T, E> = (arr: T) => E;

export default function filterMap<T, E>(arr: T[], func: FilterMapFunc<T, E>) {
  const mapped: ReturnType<FilterMapFunc<T, E>>[] = [];
  for (let i = 0; i < arr.length; i++) {
    const mappedValue = func(arr[i]);
    if (mappedValue !== null && mappedValue !== undefined)
      mapped.push(mappedValue);
  }
  return mapped as NonNullable<E>[];
}
