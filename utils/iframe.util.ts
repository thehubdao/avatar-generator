import {IFrameInBound, IFrameOutBound} from "../interfaces/iframe.interface";
import {IFrameEvents, IFrameValues} from "../enums/common.enum";
import {BasicData, ExportInterface} from "../interfaces/common.interface";

export function IFrameReady(onSubscribed: () => void) {
  TellParentReady();
  SetSubscribeEvent(onSubscribed);
}

export function SetIFrameEvents(onChangePart?: (params?: BasicData) => Promise<void>,
                                onExport?: () => Promise<void>,
                                onChangeSkinColor?: (newSkin?: string) => Promise<void>) {
  SetOnChangePart(onChangePart);
  Export(onExport);
  ChangeSkinColor(onChangeSkinColor);
}

function TellParentReady() {
  const message: IFrameOutBound<void> = {
    source: IFrameValues.Project,
    eventName: IFrameEvents.Ready
  };
  
  window.parent.postMessage(message, '*');
}

function SetSubscribeEvent(onSubscribed: () => void) {
  InBoundEventListener(IFrameEvents.Subscribe, onSubscribed);
}

function SetOnChangePart(onChangePart?: (params?: BasicData) => Promise<void>) {
  InBoundEventListener(IFrameEvents.ChangePart, onChangePart);
}

function Export(onExport?: () => Promise<void>) {
  InBoundEventListener(IFrameEvents.Exported, onExport);
}

function ChangeSkinColor(onChangeSkin?: (newSkinColor?: string) => Promise<void>) {
  InBoundEventListener(IFrameEvents.ChangeSkinColor, onChangeSkin);
}

function InBoundEventListener<T>(event: IFrameEvents, onFunc?: ((data?: T) => Promise<void>) | ((data?: T) => void )) {
  window.addEventListener(IFrameValues.Event, ({data, source}) => {
    const {target, eventName, payload} = data as IFrameInBound<T>;
    if(onFunc && target === IFrameValues.Project && eventName === event)
      onFunc(payload);
  });
}

export function IFrameExportData(data: ExportInterface) {
  SendMessage(data);
}

function SendMessage<T>(sendData: T) {
  const message: IFrameOutBound<T> = {
    source: IFrameValues.Project,
    eventName: IFrameEvents.Exported,
    data: sendData,
  };
  window.parent.postMessage(message, '*');
}