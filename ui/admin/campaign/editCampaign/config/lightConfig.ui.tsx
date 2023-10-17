import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { ConfigLight } from "../../../../../interfaces/light.interface";
import { AGVector3 } from "../../../../../interfaces/common.interface";
import AGButton from "../../../../common/ag-button.component";
import { MdKeyboardArrowDown } from "react-icons/md";
import { LightType } from "../../../../../enums/light.enum";
import { LIGHT_TYPE_LABELS } from "../../../../../constants/lightType.constant";
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete } from "react-icons/ai";
import { DEFAULT_THREE_JS_PROPS } from "../../../../../constants/threeJsDefault.constant";
import AxisInputFieldUI from "./inputFields/axisInputFiled.ux";
import SingleInputFieldUI from "./inputFields/singleInputField.ux";
import ColorInputFieldUI from "./inputFields/colorInputField.ux";

interface LightConfigUIProps {
  lightOption: string;
  lights: ConfigLight[] | undefined;
  updateLightConfig: (config: ConfigLight[], messages: { success: string, error: string }, newLightOption: string) => void;
}

const sectionOnLightType = {
  [LightType.PointLight]: ['position', 'lookAt', 'color', 'intensity', 'distance', 'decay'],
  [LightType.RectAreaLight]: ['position', 'lookAt', 'color', 'intensity', 'size'],
  [LightType.AmbientLight]: ['color', 'intensity'],
  ['']: []
}

export default function LightConfigUI({
  lightOption,
  lights,
  updateLightConfig,
}: LightConfigUIProps) {
  //* Retrieve the current option based on the selected light type
  const currentOption = lights?.find((light) => light.type === lightOption);
  const lightParams = currentOption?.params ?? {};
  const [willDelete, setWillDelete] = useState<boolean>(false);

  //* Initialize state variables for various light properties.lightParams
  const [lightDecay, setLightDecay] = useState<number>(lightParams.decay ?? DEFAULT_THREE_JS_PROPS.decay);
  const [lightDistance, setLightDistance] = useState<number>(lightParams.dist ?? DEFAULT_THREE_JS_PROPS.distance);
  const [lightIntensity, setLightIntensity] = useState<number>(lightParams.intst ?? DEFAULT_THREE_JS_PROPS.intensity);
  const [defaultColor, setDefaultColor] = useState<string>(lightParams.color ?? DEFAULT_THREE_JS_PROPS.color);
  const [lightLookAt, setLightLookAt] = useState<AGVector3>(lightParams.lAt ?? DEFAULT_THREE_JS_PROPS.lookAt);
  const [lightPosition, setLightPosition] = useState<AGVector3>(lightParams.pos ?? DEFAULT_THREE_JS_PROPS.position);
  const [lightSize, setLightSize] = useState<{ width: number, height: number }>({ width: lightParams.width ?? DEFAULT_THREE_JS_PROPS.width, height: lightParams.height ?? DEFAULT_THREE_JS_PROPS.height });

  //* Create new light config variables.
  const lightTypeOptions = Object.values(LightType);
  const [createLightOption, setCreateLightOption] = useState<string>('');
  const isAllOptionsDisabled = lightTypeOptions.every(lightType => lights?.some(light => light.type === lightType));

  //* Handle input change for every numeric input fields on lights config
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFunction: Dispatch<SetStateAction<number>>
  ) => {
    const newValue = e.currentTarget.valueAsNumber;
    setFunction(newValue);
  };

  const sendUpdateLightConfig = () => {
    if (!currentOption) return;

    // Map the updated properties for the selected light type
    const newLights = lights
      ? lights.map((light) => {
        if (light.type !== lightOption) return light;

        const props: Partial<ConfigLight["params"]> = {};

        if ('dist' in light.params) props.dist = lightDistance;
        if ('decay' in light.params) props.decay = lightDecay;
        if ('intst' in light.params) props.intst = lightIntensity;
        if ('color' in light.params) props.color = defaultColor;
        if ('pos' in light.params) props.pos = { ...lightPosition };
        if ('lAt' in light.params) props.lAt = { ...lightLookAt };
        if ('width' in light.params || 'height' in light.params) {
          props.width = lightSize.width;
          props.height = lightSize.height;
        }
        return { ...light, params: { ...light.params, ...props, }, };
      })
      : [];

    updateLightConfig(
      newLights, {
      success: `The ${LIGHT_TYPE_LABELS[lightOption as LightType].toLowerCase()} has been successfully updated!`,
      error: `The ${LIGHT_TYPE_LABELS[lightOption as LightType].toLowerCase()} was not updated satisfactorily!`
    }, lightOption);
  };

  const sendNewLightConfig = () => {
    const props: Partial<ConfigLight["params"]> = {};
    const selectedLightType = createLightOption as LightType;

    // Map the properties based on the selected light type
    sectionOnLightType[selectedLightType].forEach((section) => {
      switch (section) {
        case 'position':
          props.pos = { ...lightPosition };
          break;
        case 'lookAt':
          props.lAt = { ...lightLookAt };
          break;
        case 'color':
          props.color = defaultColor;
          break;
        case 'intensity':
          props.intst = lightIntensity;
          break;
        case 'decay':
          props.decay = lightDecay;
          break;
        case 'distance':
          props.dist = lightDistance;
          break;
        case 'size':
          props.width = lightSize.width;
          props.height = lightSize.height;
          break;
        default:
          break;
      }
    });

    const newLight: ConfigLight = {
      type: selectedLightType,
      params: props
    }

    // Update the light configurations with the new light.
    const newLights = [...(lights || []), newLight];

    updateLightConfig(
      newLights, {
      success: `The new ${LIGHT_TYPE_LABELS[selectedLightType].toLowerCase()} has been successfully created!`,
      error: `The new ${LIGHT_TYPE_LABELS[selectedLightType].toLowerCase()} was not created satisfactorily!`
    }, selectedLightType);
  }

  const sendDeleteLightConfig = () => {
    // Update the light configurations without the current light.
    const newLights = lights?.filter(light => light.type !== lightOption);

    updateLightConfig(
      newLights ?? [], {
      success: `The ${LIGHT_TYPE_LABELS[lightOption as LightType].toLowerCase()} has been successfully deleted!`,
      error: `The ${LIGHT_TYPE_LABELS[lightOption as LightType].toLowerCase()} was not deleted satisfactorily!`
    }, 'new light');
    setWillDelete(false);
  }

  //* Effect to update state variables when the selected light option changes.
  useEffect(() => {
    const newOption = lights?.find((light) => light.type === lightOption);

    setLightDecay(newOption?.params.decay ?? DEFAULT_THREE_JS_PROPS.decay);
    setLightDistance(newOption?.params.dist ?? DEFAULT_THREE_JS_PROPS.distance);
    setLightIntensity(newOption?.params.intst ?? DEFAULT_THREE_JS_PROPS.intensity);
    setDefaultColor(newOption?.params.color ?? DEFAULT_THREE_JS_PROPS.color);
    setLightLookAt(newOption?.params.lAt ?? DEFAULT_THREE_JS_PROPS.lookAt);
    setLightPosition(newOption?.params.pos ?? DEFAULT_THREE_JS_PROPS.position);
    setLightSize({ width: newOption?.params.width ?? DEFAULT_THREE_JS_PROPS.width, height: newOption?.params.height ?? DEFAULT_THREE_JS_PROPS.height });
    setWillDelete(false);

    // Filter available light types to create a new light.
    const lightTypes = [LightType.PointLight, LightType.RectAreaLight, LightType.AmbientLight];
    const filteredLightTypes = lightTypes.filter(lightType => !lights?.some(light => light.type === lightType));
    setCreateLightOption((lightOption === 'new light') ? filteredLightTypes[0] ?? '' : '');
  }, [lightOption, lights]);

  const calculeOtherInputWidth = () => {
    let numRenderedComponents = 0;

    if ('intst' in lightParams || sectionOnLightType[createLightOption as LightType].includes('intensity')) {
      numRenderedComponents++;
    } if ('dist' in lightParams || sectionOnLightType[createLightOption as LightType].includes('distance')) {
      numRenderedComponents++;
    } if ('decay' in lightParams || sectionOnLightType[createLightOption as LightType].includes('decay')) {
      numRenderedComponents++;
    }

    return numRenderedComponents === 1 ? 'w-full' : numRenderedComponents === 2 ? 'w-1/2' : 'w-1/3';
  }

  return (
    <>
      {lightOption === 'new light' && <div className="relative mt-5 w-full cursor-pointer px-2">
        <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
          <MdKeyboardArrowDown />
        </div>
        <select
          className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer"
          onChange={(e) => { setCreateLightOption(e.target.value) }}
          value={createLightOption}
        >
          {isAllOptionsDisabled && (
            <option value="" disabled>
              No lights available to add
            </option>
          )}
          {lightTypeOptions.map((lightType) => (
            !lights?.some(light => light.type === lightType) && (
              <option key={lightType} value={lightType}>
                {LIGHT_TYPE_LABELS[lightType]}
              </option>
            )
          ))}
        </select>
      </div>}
      {/* Position input fields */}
      {('pos' in lightParams || sectionOnLightType[createLightOption as LightType].includes('position')) && (
        <AxisInputFieldUI<AGVector3>
          inputLabel="Light Position"
          axisLabels={['X', 'Y', 'Z']}
          configProp={lightPosition}
          setConfigProp={setLightPosition}
          handleInputChange={handleInputChange}
        />
      )}
      {/* Look at input fields */}
      {('lAt' in lightParams || sectionOnLightType[createLightOption as LightType].includes('lookAt')) && (
        <AxisInputFieldUI<AGVector3>
          inputLabel="Look At"
          axisLabels={['X', 'Y', 'Z']}
          configProp={lightLookAt}
          setConfigProp={setLightLookAt}
          handleInputChange={handleInputChange}
        />
      )}
      {/* Color selection field */}
      {('color' in lightParams || sectionOnLightType[createLightOption as LightType].includes('color')) && (
        <ColorInputFieldUI
          inputLabel="Default Color"
          configProp={defaultColor}
          setConfigProp={setDefaultColor}
        />
      )}
      {/* Size input fields */}
      {(('width' in lightParams || 'height' in lightParams) || sectionOnLightType[createLightOption as LightType].includes('size')) && (
        <AxisInputFieldUI<{ width: number, height: number }>
          inputLabel="Size"
          axisLabels={["Width", "Height"]}
          configProp={lightSize}
          setConfigProp={setLightSize}
          handleInputChange={handleInputChange}
        />
      )}
      {/* Other input fields */}
      <div className="w-[350px] flex flex-wrap justify-between">
        {('intst' in lightParams || sectionOnLightType[createLightOption as LightType].includes('intensity')) && (
          <SingleInputFieldUI
            inputLabel="Intensity"
            configProp={lightIntensity}
            setConfigProp={setLightIntensity}
            width={calculeOtherInputWidth()}
          />
        )}
        {('dist' in lightParams || sectionOnLightType[createLightOption as LightType].includes('distance')) && (
          <SingleInputFieldUI
            inputLabel="Distance"
            configProp={lightDistance}
            setConfigProp={setLightDistance}
            width={calculeOtherInputWidth()}
          />
        )}
        {('decay' in lightParams || sectionOnLightType[createLightOption as LightType].includes('decay')) && (
          <SingleInputFieldUI
            inputLabel="Decay"
            configProp={lightDecay}
            setConfigProp={setLightDecay}
            width={calculeOtherInputWidth()}
          />
        )}
      </div>
      {/* Create and Update button */}
      <div className="pt-4 px-2">
        {lightOption === 'new light'
          ? <>{!isAllOptionsDisabled && <AGButton nm full onClickEvent={() => sendNewLightConfig()}>
            <p className="py-2">Create</p>
          </AGButton>}</>
          : <>
            {willDelete
              ? (
                <div className="flex items-center justify-between w-full">
                  <p className="pl-2 text-sm">Are you sure?</p>
                  <div className="flex">
                    <AGButton nm fit onClickEvent={() => sendDeleteLightConfig()}>
                      <AiOutlineCheckCircle className="group-hover/button:text-green-600 transition-all duration-300" />
                    </AGButton>
                    <AGButton nm fit onClickEvent={() => setWillDelete(false)}>
                      <AiOutlineCloseCircle className="group-hover/button:text-red transition-all duration-300" />
                    </AGButton>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <p className="pl-2 text-sm">Delete {LIGHT_TYPE_LABELS[lightOption as LightType]}</p>
                  <div className="flex">
                    <AGButton nm fit onClickEvent={() => setWillDelete(true)}>
                      <AiOutlineDelete className="group-hover/button:text-red transition-all duration-300" />
                    </AGButton>
                  </div>
                </div>
              )}
            <AGButton nm full onClickEvent={() => sendUpdateLightConfig()}>
              <p className="py-2">Update</p>
            </AGButton>
          </>}
      </div >
    </>
  );
}