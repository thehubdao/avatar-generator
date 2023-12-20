import {IFrameEvent} from "../enums/common.enum";

export interface IFrameInBound<T> {
  target: string;
  eventName: IFrameEvent;
  payload: T;
}

export interface IFrameOutBound<T> {
  source: string;
  eventName: string;
  data?: T;
}