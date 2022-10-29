import {IFrameInBound, IFrameOutBound} from "../interfaces/iframe.interface";
import {IFrameEvents, IFrameValues} from "../enums/common.enum";
import {BasicData, ExportInterface} from "../interfaces/common.interface";

export function IFrameReady(onSubscribed: Function, onChangePart?: (params?: BasicData) => Promise<void>) {
  TellParentReady();
  SetSubscribeEvent(onSubscribed);
  SetOnChangePart(onChangePart)
}

function TellParentReady() {
  const message: IFrameOutBound = {
    source: IFrameValues.Project,
    eventName: IFrameEvents.Ready
  };
  
  window.parent.postMessage(message, '*');
}

function SetSubscribeEvent(onSubscribed: Function) {
  window.addEventListener(IFrameValues.Event, ({data, source}) => {
    const { target, eventName } = data as IFrameInBound<void>;
    if(target === IFrameValues.Project && eventName === IFrameEvents.Subscribe)
      onSubscribed();
  });
}

function SetOnChangePart(onChangePart: ((params?: BasicData) => Promise<void>) | undefined) {
  window.addEventListener(IFrameValues.Event, ({data, source}) => {
    const { target, eventName, payload } = data as IFrameInBound<BasicData>;
    if(onChangePart && target === IFrameValues.Project && eventName === IFrameEvents.ChangePart)
      onChangePart(payload).then();
  });
}

export function IFrameExportData(data: ExportInterface) {
  SendMessage(data);
}

function SendMessage(sendData: any) {
  const message: IFrameOutBound = {
    source: IFrameValues.Project,
    eventName: IFrameEvents.Exported,
    data: sendData,
  };
  window.parent.postMessage(message, '*');
}