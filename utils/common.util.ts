import {Module} from "../enums/common.enum";

export function RandomArrayElement<T>(array: T[]) {
  return array[Math.floor((Math.random() * array.length))];
}

// Maybe save a log at some point either through api or just firebase
export async function LogError(origin: string | Module, message: string) {
  console.error(`${origin} - `, message);
}

export const Delay = (ms: number) => new Promise<void>(resolve => {
  setTimeout(resolve, ms);
});

export function IsEmail(text: string) {
  const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  return regExp.test(text.toLowerCase());
}