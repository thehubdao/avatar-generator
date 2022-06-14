export function GetOptions<TEnum>(SomeEnum: TEnum) {
  return Object.keys(SomeEnum).filter(x => !(parseInt(x) >= 0));
}