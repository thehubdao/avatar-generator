export interface IFrameInBound<T> {
  target: string;
  eventName: string;
  payload: T;
}

export interface IFrameOutBound<T> {
  source: string;
  eventName: string;
  data?: T;
}