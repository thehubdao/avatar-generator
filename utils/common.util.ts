export function GetOptions<TEnum>(SomeEnum: TEnum) {
  return Object.keys(SomeEnum).filter(x => !(parseInt(x) >= 0));
}

export function RandomArrayElement<T>(array: T[]) {
  return array[Math.floor((Math.random() * array.length))];
}

export async function LogError(origin: string, message: string) {
  // Maybe save a log at some point either through api or just firebase
  console.error(origin, message);
}

export const Delay = (ms: number) => new Promise<void>(resolve => {
  setTimeout(resolve, ms);
});