export interface IFrameInBound<T> {
  target: string;
  eventName: string;
  payload: T;
}

export interface IFrameOutBound {
  source: string;
  eventName: string;
  data?: any;
}