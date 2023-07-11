import {EmailResult, GlobalValues, Module} from "../enums/common.enum";

export function RandomArrayElement<T>(array: T[]) {
  return array[Math.floor((Math.random() * array.length))];
}

// Maybe save a log at some point either through api or just firebase
export async function LogError(origin: string | Module, message: string) {
  console.error(`${origin} - `, message);
}

export async function LogWarning(origin: string | Module, message: string) {
  console.warn(`${origin} - `, message);
}

export function Delay(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

export function IsEmail(text: string): EmailResult {
  if (!text.includes('@') && !text.includes('.')) return EmailResult.NoEmail;

  const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  return regExp.test(text.toLowerCase()) ? EmailResult.GoodEmail : EmailResult.BadEmail;
}

export function RandomPassword() {
  return Math.random().toString(36).substring(2, 12);
}

export function AddOrRemoveSlash(text: string) {
  if (text.charAt(0) === '/')
    return text.substring(1);

  return `/${text}`;
}

export function Base64ToObj<T>(toParse: string) {
  return JSON.parse(Buffer.from(toParse, 'base64').toString('ascii')) as T;
}

export function FilterList<T>(list: T[] | undefined, key: keyof T, value: unknown) {
  if (list == undefined) return void LogError(Module.CommonUtil, 'Missing list to filter!');

  return list?.filter(l => l[key] === value);
}

export function SetMapToMap<TKey, TValue>(leMap: Map<TKey, TValue>, toAdd: Map<TKey, TValue>) {
  for (const [key, value] of toAdd) {
    leMap.set(key, value);
  }
}

export function RemoveUndefinedProperties<T>(obj: T)  {
  const clone = {...obj};
  for (const k in clone) {
    if (clone[k] == undefined)
      delete clone[k];
  }
  
  return clone;
}

export function CastStringToInteger(toCast: string) {
  const num = +toCast;
  return isNaN(num) ? undefined : num | 0;
}

export function RandomNumBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function RandomIntBetween(min: number, max: number) {
  return Math.floor(RandomNumBetween(min, max));
}

export function RandomIntMax(max: number) {
  return RandomIntBetween(0, max);
}

export function ColorStringToHexString(color: string | undefined) {
  if (color == undefined) return undefined;
  if (color.length !== 6) return undefined;
  
  return `#${color}`;
}

export function IsWebUrl(url: string) {
  return url.startsWith('http');
}

export function MixArrays<T>(arr1: T[] | undefined, arr2: T[] | undefined) {
  const mixed: T[] = [...(arr1 ?? []), ...(arr2 ?? [])];
  return mixed;
}

export function RemovedAcc(text: string) {
  if (!text.endsWith(GlobalValues.AccEnd)) return text;
  
  return text.slice(0, - GlobalValues.AccEnd.length);
}