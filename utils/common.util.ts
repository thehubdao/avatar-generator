export function GetOptions<TEnum>(SomeEnum: TEnum) {
  return Object.keys(SomeEnum).filter(x => !(parseInt(x) >= 0));
}

export function RandomArrayElement<T>(array: T[]) {
  return array[Math.floor((Math.random() * array.length))];
}