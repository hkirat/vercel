const MAX_LEN = 5;

// This generate random id we use for each product
// You could also use something like uuid
export function generateRandomID() {
  let ans = "";
  const subset = "123456789qwertyuiopasdfghjklzxcvbnm";
  for (let i = 0; i < MAX_LEN; i++) {
    ans += subset[Math.floor(Math.random() * subset.length)];
  }
  return ans;
}

// This function runs all many promises chunk wise so
// might not break our process
// Think of this function as glorified Promise.allSettled
export const chunkedPromiseAll = async <TItem, TReturn>(
  arr: TItem[],
  promiseFn: (item: TItem) => Promise<TReturn>,
  chunkSize = 10
) => {
  const values: PromiseSettledResult<TReturn>[] = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    values.push(
      ...(await Promise.allSettled(chunk.map((item) => promiseFn(item))))
    );
  }

  return values;
};
