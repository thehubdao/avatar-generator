import {useEffect, useState} from "react";
import {GlobalValues, Module} from "../../enums/common.enum";
import {FeatureBasic} from "../../interfaces/common.interface";
import {AnimationInterface, FeatureInterface} from "../../interfaces/api.interface";
import {GetAnimationListByCampaign, GetAssetsListByCampaign} from "../../utils/api.util";
import AvatarBuilder from "../avatar/builder.component";
import AGLoading from "../common/ag-loading.component";
import {LogError} from "../../utils/common.util";
import {UpdateDocObject} from "../../utils/firebase.util";
import {FirestoreLocation} from "../../enums/firebase.enum";

enum RangeType {
  Single,
  StartToEnd,
  StartToMax,
  MinToEnd,
  MinToMax,
}

let _isRange: boolean = true;
let _start: Map<number, number> | undefined;
let _end: Map<number, number> | undefined;

const _minIndexValues: Map<number, number> = new Map();
const _maxIndexValues: Map<number, number> = new Map();

const _featureOptionListData: Map<number, FeatureInterface[] | undefined> = new Map();
let _animationListData: AnimationInterface[] | undefined;
const _featureOptionToUpdate: Map<string, FeatureInterface> = new Map();

function GetRangeType(single: string | undefined, start: string | undefined, end: string | undefined) {
  if (single != undefined)
    return RangeType.Single;

  if (start != undefined) {
    if (end != undefined)
      return RangeType.StartToEnd;
    else
      return RangeType.StartToMax;
  }

  if (end != undefined)
    return RangeType.MinToEnd;

  return RangeType.MinToMax;
}

function IsRange(single: string | undefined, start: string | undefined, end: string | undefined, size: number) {
  const rangeType = GetRangeType(single, start, end);
  console.log('RangeType', rangeType);
  switch (rangeType) {
    case RangeType.Single:
      const singleValues = GetIndexValues(single, size);
      if (singleValues.valid) {
        _start = new Map(singleValues.map);
        _end = singleValues.map;
        _isRange = false;
      }
      break;
    case RangeType.StartToEnd:
      const startValuesSTE = GetIndexValues(start, size);
      const endValuesSTE = GetIndexValues(end, size);
      if (startValuesSTE.valid && endValuesSTE.valid) {
        _start = startValuesSTE.map;
        _end = endValuesSTE.map;
        _isRange = true;
      }
      break;
    case RangeType.StartToMax:
      const startValuesSTM = GetIndexValues(start, size);
      if (startValuesSTM.valid) {
        _start = startValuesSTM.map;
        _end = _maxIndexValues;
        _isRange = true;
      }
      break;
    case RangeType.MinToEnd:
      const endValuesMTE = GetIndexValues(end, size);
      if (endValuesMTE.valid) {
        _start = _minIndexValues;
        _end = endValuesMTE.map;
        _isRange = true;
      }
      break;
    case RangeType.MinToMax:
      _start = _minIndexValues;
      _end = _maxIndexValues;
      _isRange = true;
      break;
  }
  
  console.log('Kek', _start, _end, _isRange);
}

function GetIndexValues(input: string | undefined, size: number): { map: Map<number, number> | undefined, valid: boolean } {
  if (input == undefined) return {map: undefined, valid: false};

  const result = new Map<number, number>();
  const indexArray = input.split(GlobalValues.CollectorIndexSeparator);

  for (const [index, value] of indexArray.entries()) {
    const valueNum = Number(value);
    if (valueNum >= 0) {
      result.set(index, valueNum | 0);
    }
  }

  return IsValidIndexValues(result, size);
}

function IsValidIndexValues(indexValues: Map<number, number>, size: number) {
  if (indexValues.size !== size) return {map: undefined, valid: false};

  for (const [key, value] of indexValues.entries()) {
    const maxVal = _maxIndexValues.get(key);
    if (maxVal == undefined || maxVal < value) {
      return {map: undefined, valid: false};
    }
  }

  return {map: indexValues, valid: true};
}

function SetMinIndexValues(size: number) {
  for (let i = 0; i < size; i++) {
    _minIndexValues.set(i, 0);
  }
  
  console.log('MinValues', _minIndexValues);
}

function SetMaxIndexValues(featureList: FeatureBasic[]) {
  for (const feature of featureList) {
    const optionList = _featureOptionListData.get(feature.index);
    if (optionList != undefined)
      _maxIndexValues.set(feature.index, optionList.length);
  }
  
  console.log('MaxValues', _maxIndexValues);
}

function GetNextIteration() {
  // _currentIteration;
  // Current to end
  // TODO:
  //  recursive function, on max value on this certain augmented index change values and switch to next index
  //  Always start from last index of map
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
  
  console.log(_featureOptionListData, _featureOptionToUpdate, orderedList, missingIndexList);
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

interface AvatarCollectionProps {
  start: string | undefined;
  end: string | undefined;
  single: string | undefined;
  campaign: string;
  avatarBasePath: string;
  defaultAnimation: string | undefined;
  featureList: FeatureBasic[];
}

export default function AvatarCollection({start, end, single, campaign, avatarBasePath, featureList}: AvatarCollectionProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const isDoable = avatarBasePath !== '' || featureList.length > 0;

  useEffect(() => {
    const componentDidMount = async () => {
      await Promise.all([
        getFeatureList(featureList),
        getAnimationList()
      ]);
      
      setLoading(false);
    };
    
    componentDidMount()
      .catch(err => console.error(err));
  }, []);
  
  async function onCollectionReady() {
    await ReadjustAllFeatureIndexes(featureList, campaign);
    // Get size from amount of features
    const size = featureList?.length;
    // Set min index values base on size
    SetMinIndexValues(size);
    // Set max index values base on db information
    SetMaxIndexValues(featureList);

    IsRange(start, end, single, size);

    // SetCombination();
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
  
  async function getAnimationList() {
    const animationData = await GetAnimationListByCampaign(campaign);
    if (animationData.success)
      _animationListData = animationData.value;
  }

  function onStartCollection() {
    
  }
  
  function onExport() {
    
  }

  return (
    <>
      <AGLoading loading={loading} transparency />
      {isDoable ?
        <AvatarBuilder avatarBasePath={avatarBasePath}
                       onReady={() => onCollectionReady()}/>
        :
        <h1>Missing info</h1>
      }
    </>
  );
}