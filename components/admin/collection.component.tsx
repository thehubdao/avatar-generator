import {useRef, useState} from "react";
import {Module} from "../../enums/common.enum";
import {FeatureBasic} from "../../interfaces/common.interface";
import {AnimationInterface, FeatureInterface} from "../../interfaces/api.interface";
import {GetAnimationListByCampaign, GetAssetsListByCampaign} from "../../utils/api.util";
import AvatarBuilder, {
  ChangeFeature,
  ChangeSkinColor,
  ChangeStartAnimation,
  GetAvatarGLB,
  SetFeaturesData
} from "../avatar/builder.component";
import AGLoading from "../common/ag-loading.component";
import {Delay, LogError, LogWarning} from "../../utils/common.util";
import {UpdateDocObject} from "../../utils/firebase.util";
import {FirestoreLocation} from "../../enums/firebase.enum";
import AGButton from "../common/ag-button.component";
import {TakeCanvasPicture} from "../avatar/viewer.component";
import {SaveFile} from "../../utils/exporter.util";

let _reachedEnd = false;
let _start: Map<number, number> | undefined;
let _end: Map<number, number> | undefined;
let _maxCombination = 0;
let _multValues: number[] | undefined;

let _currentIteration: Map<number, number> | undefined;
const _minIndexValues: Map<number, number> = new Map();
const _maxIndexValues: Map<number, number> = new Map();

const _featureOptionListData: Map<number, FeatureInterface[] | undefined> = new Map();
let _animationListData: AnimationInterface[] | undefined;
const _featureOptionToUpdate: Map<string, FeatureInterface> = new Map();

// TODO: move logic that can be call anywhere to own util file
function InitValues() {
  _start = new Map(_minIndexValues);
  _end = new Map(_maxIndexValues);
  NextIteration(true);
}

function SetMinIndexValues(size: number) {
  for (let i = 0; i < size; i++) {
    _minIndexValues.set(i, 0);
  }
  
  // console.log('MinValues', _minIndexValues);
}

function SetMaxIndexValues(featureList: FeatureBasic[]) {
  for (const feature of featureList) {
    const optionList = _featureOptionListData.get(feature.index);
    if (optionList != undefined)
      _maxIndexValues.set(feature.index, optionList.length);
  }
  
  // console.log('MaxValues', _maxIndexValues);
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
    _reachedEnd = true;
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
    if(min == undefined) return void LogError(Module.CollectionComponent, "Missing min index value!");
    
    _currentIteration?.set(index, min);
    LowerIteration(index - 1);
  }
}

function ReadjustFeatureIndexes(featureList: FeatureInterface[] | undefined) {
  if(featureList == undefined)
    return LogError(Module.CollectionComponent, "Missing feature option list!");
  
  // Order list by index (is numeric)
  const orderedList = featureList
    .filter(opt => opt.index != undefined)
    .sort((a, b) => a.index - b.index);
  
  // Have list of items without index
  const missingIndexList = featureList.filter(opt => opt.index == undefined);
  
  // Start iterating 1 by 1
  for (let i = 0; i < featureList.length; i++) {
    if (orderedList.some(f => f.index === i)) {
      orderedList.splice(orderedList.findIndex(f => f.index === i), 1);
      continue;
    }
    
    if (missingIndexList.length > 0) {
      const toSetIndex = missingIndexList.pop();
      if (toSetIndex == undefined) { i--; break; }

      const toUpdate = featureList.find(opt => opt.id === toSetIndex.id);
      if (toUpdate == undefined) { i--; break; }
      toUpdate.index = i;
      _featureOptionToUpdate.set(toUpdate.id, toUpdate);
    } else if(orderedList.length > 0) {
      orderedList.forEach(opt => opt.index = opt.index - 1);
      i--;
    }
  }
  
  // console.log('EndValues', _featureOptionListData, _featureOptionToUpdate, orderedList, missingIndexList);
}

async function UpdateNewIndexesOnDB(campaign: string) {
  const updatePromises: Promise<unknown>[] = [];
  
  for (const [key, toUpdate] of _featureOptionToUpdate) {
    updatePromises.push(UpdateDocObject(FirestoreLocation.Features, toUpdate, campaign, key));
  }
  
  await Promise.all(updatePromises);
}

async function ReadjustAllFeatureIndexes(featureList: FeatureBasic[], campaign: string) {
  for (const feature of featureList) {
    await ReadjustFeatureIndexes(_featureOptionListData.get(feature.index));
  }
  
  await UpdateNewIndexesOnDB(campaign);
}

function IndexValuesToString(indexValues: Map<number, number> | undefined) {
  let result = '';
  
  if (indexValues != undefined) {
    for (let i = 0; i < indexValues.size; i++) {
      const value = indexValues.get(i);
      result += `-${value ?? ''}`;
    }
    result = result.substring(1);
  }
  
  return result;
}

function MaxCombinationNum() {
  let result = 1;

  for (let i = 0; i < _maxIndexValues.size; i++) {
    const value = _maxIndexValues.get(i);
    result *= value ?? 1;
  }

  _maxCombination = result;
  return result;
}

function IndexValuesToNumber(indexValues: Map<number, number> | undefined, maxValues: Map<number, number> = _maxIndexValues) {
  if (indexValues == undefined)
    return void LogError(Module.CollectionComponent, "No indexValues to work on!");
  
  if (indexValues.size !== maxValues.size)
    return void LogError(Module.CollectionComponent, "Error parsing indexValues to number, out of range!");
  
  const multNums = GetMultiplyNums(maxValues);
  if (multNums == undefined)
    return void LogError(Module.CollectionComponent, "Error getting misshaped values for multiply nums!");
  
  let result = 0;
  for (let i = 0; i < maxValues.size; i++) {
    const indexVal = indexValues.get(i) ?? 0;
    const newVal = indexVal * multNums[i + 1];
    
    result += newVal;
  }
  
  return result;
}

function NumberToIndexValues(num: number, maxValues: Map<number, number> = _maxIndexValues) {
  if (num < 0 || num > _maxCombination)
    return void LogError(Module.CollectionComponent, "Number out of range!");
  
  const multNums = GetMultiplyNums(maxValues);
  if (multNums == undefined)
    return void LogError(Module.CollectionComponent, "Error getting misshaped values for multiply nums!");
  
  const result = new Map<number, number>();
  let currentValue = num;
  
  for (let i = 0; i < maxValues.size; i++) {
    const newIndexValue = (currentValue / multNums[i + 1]) | 0;
    currentValue -= newIndexValue * multNums[i + 1];
    result.set(i, newIndexValue);
  }
  
  // console.log('CheckThis: ', _maxCombination, maxValues, multNums, IndexValuesToString(result));
  return result;
}

function GetMultiplyNums(maxValues: Map<number, number>) {
  if (_multValues != undefined)
    return _multValues;
  
  const multNums: number[] = [];
  for (let i = maxValues.size - 1; i > 0; i--) {
    const multi = multNums[i + 1] ?? 1;
    const val = maxValues.get(i);
    // console.log('Iter: ', i, multi, val);
    
    if (val == undefined) return undefined;
    
    multNums[i] = val * multi;
  }
  multNums[maxValues.size] = 1;
  
  // console.log('MultiNums: ', multNums);
  _multValues = {...multNums};
  return multNums;
}

interface AvatarCollectionProps {
  campaign: string;
  avatarBasePath: string;
  defaultAnimation: string | undefined;
  featureList: FeatureBasic[];
  skinColor: string;
}

export default function AvatarCollection({
                                           campaign,
                                           avatarBasePath,
                                           featureList,
                                           skinColor,
                                           defaultAnimation}: AvatarCollectionProps) {
  const [loading, setLoading] = useState<boolean>(true);
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

    setLoading(false);
    
    await ReadjustAllFeatureIndexes(featureList, campaign);
    // Get size from amount of features
    const size = featureList?.length;
    // Set min index values base on size
    SetMinIndexValues(size);
    // Set max index values base on db information
    SetMaxIndexValues(featureList);
    InitValues();
    
    setMaxCombination(MaxCombinationNum());

    await SetFeaturesData(featureList);
    await onRenderCurrentIteration();
    await ChangeSkinColor(skinColor);

    const startAnimation = _animationListData?.find(a => a.name == defaultAnimation) ?? _animationListData?.at(0);
    await ChangeStartAnimation(startAnimation?.path);
  }

  async function getFeatureList(featureList: FeatureBasic[]) {
    const featureData = await GetAssetsListByCampaign(campaign);
    if (!featureData.success) return LogError(Module.CollectionComponent, "Could not retrieve feature option data!");
    
    for (const feature of featureList) {
      if (feature.index == undefined) {
        void LogError(Module.CollectionComponent, `Missing index on ${feature.id} feature type!`);
        continue;
      }
      
      _featureOptionListData.set(feature.index, featureData.value?.filter(f => f.type === feature.id));
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
      await ChangeFeature(item.id, item.path, item.name, item.type, featureList.find(sf => sf.id === item.type), skinColor);
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
    
    await SaveFile(modelPromise, 'model.glb');
    await SaveFile(picturePromise, 'picture.png');
  }

  async function processSingle() {
    await onRenderCurrentIteration();
    await Delay(2500);
    await onExport();
    NextIteration();
    setCurrentIteration(prev => {
      if (prev == undefined) return IndexValuesToNumber(_currentIteration);
      return prev + 1;
    });
  }
  
  function startOver() {
    NextIteration(true);
    setCurrentIteration(IndexValuesToNumber(_start));
  }

  async function onStartCollection() {
    if (_reachedEnd) {
      _reachedEnd = false;
      startOver();
    }
    
    while (!_reachedEnd && doCollection.current) {
      // console.log('Started process single');
      await processSingle();
      // console.log("Doing while", _reachedEnd, doCollection.current);
      await Delay(1000);
    }
    
    if (_reachedEnd) doCollection.current = false;
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
    
    _start = NumberToIndexValues(newVal);
    startOver();
  }
  
  function onChangeEndValue(newVal: number) {
    if (newVal > maxCombination)
      newVal = maxCombination;
    
    if (!_reachedEnd && currentIteration != undefined && currentIteration < newVal) {
      _start = NumberToIndexValues(currentIteration);
    }

    _end = NumberToIndexValues(newVal);
  }
  
  function mahUi() {
    return (
      <>
        <div>
          <p>Info</p>
          <p>Current: <span>{currentIteration}</span></p>
          <p>Max Combination: <span>{maxCombination}</span></p>
          <p>Start:</p><input type="number" min={0} max={maxCombination} onChange={(e) => onChangeStartValue(e.target.valueAsNumber)} />
          <p>End:</p><input type="number" min={0} max={maxCombination} onChange={(e) => onChangeEndValue(e.target.valueAsNumber)} />
        </div>
        <AGButton onClickEvent={() => onClickDoCollection()}>Start</AGButton>
        <AGButton onClickEvent={() => onClickStopCollection()}>Stop</AGButton>
        <AGButton onClickEvent={() => onClickDoSingle()}>Single</AGButton>
      </>
    );
  }

  return (
    <>
      <AGLoading loading={loading} transparency />
      {isDoable ?
        <>
          {mahUi()}
          <AvatarBuilder avatarBasePath={avatarBasePath}
                         onReady={() => onCollectionReady()}/>
        </>
        :
        <h1>Missing info</h1>
      }
    </>
  );
}