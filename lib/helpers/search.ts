export function weighStringsUsingSearchTerm(
  q: string,
  a: string,
  b: string,
): number {
  let weight = 0;

  if (a.startsWith(q) && !b.startsWith(q)) {
    weight -= 4;
  } else if (b.startsWith(q) && !a.startsWith(q)) {
    weight += 4;
  }

  if (
    a.toLowerCase().startsWith(q.toLowerCase()) &&
    !b.toLowerCase().startsWith(q.toLowerCase())
  ) {
    weight -= 2;
  } else if (
    b.toLowerCase().startsWith(q.toLowerCase()) &&
    !a.toLowerCase().startsWith(q.toLowerCase())
  ) {
    weight += 2;
  }

  return weight;
}
