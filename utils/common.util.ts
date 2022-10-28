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