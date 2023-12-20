import {useRef, useState} from "react";
import {Module} from "../../enums/common.enum";
import {FeatureBasic} from "../../interfaces/common.interface";
import {AnimationInterface, FeatureInterface} from "../../interfaces/api.interface";
import {GetAnimationListByCampaign, GetAssetsListByCampaign} from "../../utils/api.util";
import AvatarEditor, {
  ChangeFeature,
  ChangeSkinColor,
  ChangeStartAnimation,
  GetAvatarGLB,
  SetFeaturesData
} from "../avatar/editor.component";
import AGLoading from "../../ui/common/ag-loading.component";
import {Delay, LogError, LogWarning, SetMapToMap} from "../../utils/common.util";
import AGButton from "../../ui/common/ag-button.component";
import {TakeCanvasPicture} from "../avatar/viewer.component";
import {SaveFile} from "../../utils/exporter.util";
import {
  IndexValuesToNumber,
  NumberToIndexValues,
  ReadjustFeatureIndexes,
  GetMaxIndexValues,
  GetMinIndexValues, GetMaxCombinationNum
} from "../../utils/collection.util";
import {ChangeMaterialOption} from "../../enums/model.enum";

let _didReachEnd = false;
let _start: Map<number, number> | undefined;
let _end: Map<number, number> | undefined;
let _maxCombination = 0;
let _multValues: number[] | undefined;

let _currentIteration: Map<number, number> | undefined;
const _minIndexValues: Map<number, number> = new Map();
const _maxIndexValues: Map<number, number> = new Map();

const _featureOptionListData: Map<number, FeatureInterface[] | undefined> = new Map();
let _animationListData: AnimationInterface[] | undefined;

function InitValues() {
  _start = new Map(_minIndexValues);
  _end = new Map(_maxIndexValues);
  NextIteration(true);
}

function NextIteration(forceStart = false) {
  if (_currentIteration == undefined || forceStart) {
    _currentIteration = new Map(_start);
    // console.log('CurrentIteration first: ', _currentIteration);
    return;
  }

  LowerIteration(_currentIteration.size - 1);
  // console.log('CurrentIteration follow: ', _currentIteration);
}

function LowerIteration(index: number) {
  if (index < 0) {
    _didReachEnd = true;
    return void LogWarning(Module.CollectionComponent, "Reached end of the line");
  }

  const current = _currentIteration?.get(index);
  const max = _end?.get(index);

  // console.log('current & max', { 
  //   current,
  //   max,
  //   kek: IndexValuesToString(_currentIteration),
  //   min: IndexValuesToString(_start),
  //   max_m: IndexValuesToString(_end)
  // });


  if (current == undefined || max == undefined)
    return void LogError(Module.CollectionComponent, "Missing current and max index values!");

  if (current < max) {
    _currentIteration?.set(index, current + 1);
  } else {
    const min = _minIndexValues?.get(index);
    if (min == undefined) return void LogError(Module.CollectionComponent, "Missing min index value!");

    _currentIteration?.set(index, min);
    LowerIteration(index - 1);
  }
}

async function ReadjustAllFeatureIndexes(featureList: FeatureBasic[], campaign: string) {
  for (const feature of featureList) {
    await ReadjustFeatureIndexes(_featureOptionListData.get(feature.index), campaign);
  }
}

interface AvatarCollectionProps {
  campaign: string;
  avatarBasePath: string;
  defaultAnimation: string | undefined;
  featureList: FeatureBasic[];
  skinColor: string;
  changeMaterial?: ChangeMaterialOption;
}

export default function AvatarCollection({
                                           campaign,
                                           avatarBasePath,
                                           featureList,
                                           skinColor,
                                           defaultAnimation, 
                                           changeMaterial
                                         }: AvatarCollectionProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [maxCombination, setMaxCombination] = useState<number>(0);
  const [currentIteration, setCurrentIteration] = useState<number>();

  const doCollection = useRef<boolean>(false);
  const isDoable = avatarBasePath !== '' || featureList.length > 0;


  // useEffect(() => {
  //   console.log('CurrentIteration: ', currentIteration);
  // }, [currentIteration]);

  async function onCollectionReady() {
    await Promise.all([
      getFeatureList(featureList),
      getAnimationList()
    ]);

    setIsLoading(false);

    await ReadjustAllFeatureIndexes(featureList, campaign);
    // Set min index values base on size
    SetMapToMap(_minIndexValues, GetMinIndexValues(featureList.length));
    // Set max index values base on db information
    SetMapToMap(_maxIndexValues, GetMaxIndexValues(featureList, _featureOptionListData));
    InitValues();

    const maxCombinationNum = GetMaxCombinationNum(_maxIndexValues);
    _maxCombination = maxCombinationNum;
    setMaxCombination(maxCombinationNum);

    await SetFeaturesData(featureList);
    await onRenderCurrentIteration();
    await ChangeSkinColor(skinColor);

    const startAnimation = _animationListData?.find(a => a.name == defaultAnimation) ?? _animationListData?.at(0);
    await ChangeStartAnimation(startAnimation?.path);
  }

  // TODO review meshName
  async function getFeatureList(featureList: FeatureBasic[]) { 
    const featureData = await GetAssetsListByCampaign(campaign);
    if (!featureData.success) return LogError(Module.CollectionComponent, "Could not retrieve feature option data!");

    for (const feature of featureList) {
      if (feature.index == undefined) {
        void LogError(Module.CollectionComponent, `Missing index on ${feature.meshName} feature type!`);
        continue;
      }

      _featureOptionListData.set(feature.index, featureData.value?.filter(f => f.type === feature.meshName));
    }
  }

  async function onRenderCurrentIteration() {
    // console.log('Current: ', _currentIteration, currentIteration);

    if (_currentIteration == undefined)
      return LogError(Module.CollectionComponent, "Missing current iteration to render!");

    for (const [index, val] of _currentIteration.entries()) {
      const listData = _featureOptionListData.get(index);
      if (listData == undefined) {
        void LogWarning(Module.CollectionComponent, "Missing list data to render!");
        continue;
      }

      const item = listData.find(l => l.index === val);
      if (item == undefined) {
        void LogWarning(Module.CollectionComponent, `Missing item on key: ${index} index: ${val}`);
        continue;
      }
      // console.log('Item', item);
      // TODO: add skinName from configuration
      await ChangeFeature(item.id, item.path, item.name, item.type, skinColor, undefined, changeMaterial);
      // TODO: find ways to avoid this (SetFeaturesData)
      await SetFeaturesData(featureList);
      // addReplaceAttribute(selectedFeature, name);
    }
  }

  async function getAnimationList() {
    const animationData = await GetAnimationListByCampaign(campaign);
    if (animationData.success)
      _animationListData = animationData.value;
  }

  async function onExport() {
    // console.log("Doing export!");
    // Maybe add on iframe
    const [picturePromise, modelPromise] = await Promise.all([
      TakeCanvasPicture(),
      GetAvatarGLB()
    ]);

    if (modelPromise.success)
      await SaveFile(modelPromise.value, 'model.glb');
    await SaveFile(picturePromise, 'picture.png');
  }

  async function processSingle() {
    await onRenderCurrentIteration();
    await Delay(2500);
    await onExport();
    NextIteration();
    setCurrentIteration(prev => {
      if (prev == undefined) return IndexValuesToNumber(_currentIteration, _maxIndexValues, _multValues);
      return prev + 1;
    });
  }

  function startOver() {
    NextIteration(true);
    setCurrentIteration(IndexValuesToNumber(_start, _maxIndexValues, _multValues));
  }

  async function onStartCollection() {
    if (_didReachEnd) {
      _didReachEnd = false;
      startOver();
    }

    while (!_didReachEnd && doCollection.current) {
      // console.log('Started process single');
      await processSingle();
      // console.log("Doing while", _reachedEnd, doCollection.current);
      await Delay(1000);
    }

    if (_didReachEnd) doCollection.current = false;
  }

  function onClickDoSingle() {
    void processSingle();
  }

  function onClickDoCollection() {
    // console.log('Pressed start')
    if (doCollection.current) return;

    doCollection.current = true;
    void onStartCollection();
  }

  function onClickStopCollection() {
    // console.log('Pressed stop')
    doCollection.current = false;
  }

  function onChangeStartValue(newVal: number) {
    if (newVal < 0)
      newVal = 0;

    _start = NumberToIndexValues(newVal, _maxCombination, _maxIndexValues, _multValues);
    startOver();
  }

  function onChangeEndValue(newVal: number) {
    if (newVal > maxCombination)
      newVal = maxCombination;

    if (!_didReachEnd && currentIteration != undefined && currentIteration < newVal) {
      _start = NumberToIndexValues(currentIteration, _maxCombination, _maxIndexValues, _multValues);
    }

    _end = NumberToIndexValues(newVal, _maxCombination, _maxIndexValues, _multValues);
  }

  function mahUi() {
    return (
      <>
        <div>
          <p>Info</p>
          <p>Current: <span>{currentIteration}</span></p>
          <p>Max Combination: <span>{maxCombination}</span></p>
          <p>Start:</p><input type="number" min={0} max={maxCombination}
                              onChange={(e) => onChangeStartValue(e.target.valueAsNumber)}/>
          <p>End:</p><input type="number" min={0} max={maxCombination}
                            onChange={(e) => onChangeEndValue(e.target.valueAsNumber)}/>
        </div>
        <AGButton onClickEvent={() => onClickDoCollection()}>Start</AGButton>
        <AGButton onClickEvent={() => onClickStopCollection()}>Stop</AGButton>
        <AGButton onClickEvent={() => onClickDoSingle()}>Single</AGButton>
      </>
    );
  }

  return (
    <>
      <AGLoading loading={isLoading} transparency/>
      {isDoable ?
        <>
          {mahUi()}
          <AvatarEditor avatarBasePath={avatarBasePath}
                        onReady={() => onCollectionReady()}
                        changeMaterial={changeMaterial}
          />
        </>
        :
        <h1>Missing info</h1>
      }
    </>
  );
}