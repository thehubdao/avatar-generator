import {IFrameInBound, IFrameOutBound} from "../interfaces/iframe.interface";
import {IFrameEvent} from "../enums/common.enum";
import {BasicData, ExportInterface} from "../interfaces/common.interface";
import {IFRAME_VALUES} from "../constants/common.constant";

export function IFrameReady(onSubscribed: () => void) {
  TellParentReady();
  SetSubscribeEvent(onSubscribed);
}

export function SetIFrameEvents(onChangeFeature?: (params?: BasicData) => Promise<void>,
                                onExport?: () => Promise<void>,
                                onChangeSkinColor?: (newSkin?: string) => Promise<void>) {
  SetOnChangeFeature(onChangeFeature);
  Export(onExport);
  ChangeSkinColor(onChangeSkinColor);
}

function TellParentReady() {
  const message: IFrameOutBound<void> = {
    source: IFRAME_VALUES.Project,
    eventName: IFrameEvent.Ready
  };
  
  window.parent.postMessage(message, '*');
}

function SetSubscribeEvent(onSubscribed: () => void) {
  InBoundEventListener(IFrameEvent.Subscribe, onSubscribed);
}

function SetOnChangeFeature(onChangeFeature?: (params?: BasicData) => Promise<void>) {
  InBoundEventListener(IFrameEvent.ChangeFeature, onChangeFeature);
}

function Export(onExport?: () => Promise<void>) {
  InBoundEventListener(IFrameEvent.Exported, onExport);
}

function ChangeSkinColor(onChangeSkin?: (newSkinColor?: string) => Promise<void>) {
  InBoundEventListener(IFrameEvent.ChangeSkinColor, onChangeSkin);
}

function InBoundEventListener<T>(event: IFrameEvent, onFunc?: ((data?: T) => Promise<void>) | ((data?: T) => void )) {
  window.addEventListener(IFRAME_VALUES.Event, ({data}) => {
    const {target, eventName, payload} = data as IFrameInBound<T>;
    if(onFunc && target === IFRAME_VALUES.Project && eventName === event)
      void onFunc(payload);
  });
}

export function IFrameExportData(data: ExportInterface) {
  SendMessage(data);
}

function SendMessage<T>(sendData: T) {
  const message: IFrameOutBound<T> = {
    source: IFRAME_VALUES.Project,
    eventName: IFrameEvent.Exported,
    data: sendData,
  };
  window.parent.postMessage(message, '*');
}