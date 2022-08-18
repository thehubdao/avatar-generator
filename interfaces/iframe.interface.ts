export interface IFrameInBound {
  target: string;
  eventName: string;
}

export interface IFrameOutBound {
  source: string;
  eventName: string;
  data?: any;
}