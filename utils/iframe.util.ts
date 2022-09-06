import {IFrameInBound, IFrameOutBound} from "../interfaces/iframe.interface";
import {IFrameEvents, IFrameValues} from "../enums/common.enum";
import {ExportInterface} from "../interfaces/common.interface";

export function IFrameReady(onSubscribed: Function) {
  TellParentReady();
  SetSubscribeEvent(onSubscribed);
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
    const { target, eventName } = data as IFrameInBound;
    if(target === IFrameValues.Project && eventName === IFrameEvents.Subscribe)
      onSubscribed();
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