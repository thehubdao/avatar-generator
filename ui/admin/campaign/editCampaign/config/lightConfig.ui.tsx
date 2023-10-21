import { useEffect, useState } from "react";
import { ConfigLight } from "../../../../../interfaces/light.interface";
import { AGVector3 } from "../../../../../interfaces/common.interface";
import AGButton from "../../../../common/ag-button.component";
import { MdKeyboardArrowDown } from "react-icons/md";
import { LightType } from "../../../../../enums/light.enum";
import { INDEX_OUT_LIGHT_ARRAY, LIGHT_PROPERTIES, LIGHT_TYPE_LABELS } from "../../../../../constants/lightType.constant";
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete } from "react-icons/ai";
import { DEFAULT_THREE_JS_PROPS } from "../../../../../constants/threeJsDefault.constant";
import AxisInputFieldUI from "./inputFields/axisInputFiled.ux";
import SingleInputFieldUI from "./inputFields/singleInputField.ux";
import ColorInputFieldUI from "./inputFields/colorInputField.ux";

interface LightConfigUIProps {
  lightOption: number;
  lights: ConfigLight[] | undefined;
  updateLightConfig: (config: ConfigLight[], messages: { success: string, error: string }, newLightOption: number) => void;
}

export default function LightConfigUI({
  lightOption,
  lights,
  updateLightConfig,
}: LightConfigUIProps) {
  //* Retrieve the current option based on the selected light type
  const currentOption = lights?.find((_, index) => index === lightOption);
  const currentParams = currentOption?.params ?? {};
  const [willDelete, setWillDelete] = useState<boolean>(false);

  //* Initialize state variables for various light properties.currentParams
  const [lightParams, setLightParams] = useState({
    decay: currentParams.decay ?? DEFAULT_THREE_JS_PROPS.decay,
    distance: currentParams.dist ?? DEFAULT_THREE_JS_PROPS.distance,
    intensity: currentParams.intst ?? DEFAULT_THREE_JS_PROPS.intensity,
    color: currentParams.color ?? DEFAULT_THREE_JS_PROPS.color,
    lookAt: currentParams.lAt ?? DEFAULT_THREE_JS_PROPS.lookAt,
    position: currentParams.pos ?? DEFAULT_THREE_JS_PROPS.position,
    size: {
      width: currentParams.width ?? DEFAULT_THREE_JS_PROPS.width,
      height: currentParams.height ?? DEFAULT_THREE_JS_PROPS.height
    }
  });

  //* Create new light config variables.
  const lightTypeOptions = Object.values(LightType);
  const [createLightOption, setCreateLightOption] = useState<string>('');
  const MAX_POINT_LIGHTS = 5;
  const MAX_RECT_AREA_LIGHT = 2;
  const MAX_AMBIENT_LIGHT = 1;

  // Count the number of each type of light
  const pointLightCount = lights?.filter(light => light.type === LightType.PointLight).length || 0;
  const rectAreaLightCount = lights?.filter(light => light.type === LightType.RectAreaLight).length || 0;
  const ambientLightCount = lights?.filter(light => light.type === LightType.AmbientLight).length || 0;

  // Check if you have a number of supported lights
  const isAllOptionsDisabled = !(pointLightCount < MAX_POINT_LIGHTS &&
    rectAreaLightCount < MAX_RECT_AREA_LIGHT &&
    ambientLightCount < MAX_AMBIENT_LIGHT);

  const sendUpdateLightConfig = () => {
    if (!currentOption || !lights) return;

    // Map the updated properties for the selected light type
    const newlightsArray = lights.map((light, index) => {
      if (index !== lightOption) return light;

      const newLightParams: Partial<ConfigLight["params"]> = {};

      if ('dist' in light.params) newLightParams.dist = lightParams.distance;
      if ('decay' in light.params) newLightParams.decay = lightParams.decay;
      if ('intst' in light.params) newLightParams.intst = lightParams.intensity;
      if ('color' in light.params) newLightParams.color = lightParams.color;
      if ('pos' in light.params) newLightParams.pos = { ...lightParams.position };
      if ('lAt' in light.params) newLightParams.lAt = { ...lightParams.lookAt };
      if ('width' in light.params || 'height' in light.params) {
        newLightParams.width = lightParams.size.width;
        newLightParams.height = lightParams.size.height;
      }
      return { ...light, params: { ...light.params, ...newLightParams, }, };
    });

    updateLightConfig(
      newlightsArray, {
      success: `The ${LIGHT_TYPE_LABELS[lights[lightOption].type].toLowerCase()} has been successfully updated!`,
      error: `The ${LIGHT_TYPE_LABELS[lights[lightOption].type].toLowerCase()} was not updated satisfactorily!`
    }, lightOption);
  };

  const sendNewLightConfig = () => {
    const newLightParams: Partial<ConfigLight["params"]> = {};
    const selectedLightType = createLightOption as LightType;

    // Map the properties based on the selected light type
    LIGHT_PROPERTIES[selectedLightType].forEach((section) => {
      switch (section) {
        case 'position':
          newLightParams.pos = { ...lightParams.position };
          break;
        case 'lookAt':
          newLightParams.lAt = { ...lightParams.lookAt };
          break;
        case 'color':
          newLightParams.color = lightParams.color;
          break;
        case 'intensity':
          newLightParams.intst = lightParams.intensity;
          break;
        case 'decay':
          newLightParams.decay = lightParams.decay;
          break;
        case 'distance':
          newLightParams.dist = lightParams.distance;
          break;
        case 'size':
          newLightParams.width = lightParams.size.width;
          newLightParams.height = lightParams.size.height;
          break;
        default:
          break;
      }
    });

    const newLight: ConfigLight = {
      type: selectedLightType,
      params: newLightParams
    }

    // Update the light configurations with the new light.
    const newlightsArray = [...(lights || []), newLight];

    updateLightConfig(
      newlightsArray, {
      success: `The new ${LIGHT_TYPE_LABELS[selectedLightType].toLowerCase()} has been successfully created!`,
      error: `The new ${LIGHT_TYPE_LABELS[selectedLightType].toLowerCase()} was not created satisfactorily!`
    }, lights?.length ?? 0);
  }

  const sendDeleteLightConfig = () => {
    if (!lights) return;
    // Update the light configurations without the current light.
    const newlightsArray = lights?.filter((_, index) => index !== lightOption);

    updateLightConfig(
      newlightsArray ?? [], {
      success: `The ${LIGHT_TYPE_LABELS[lights[lightOption].type].toLowerCase()} has been successfully deleted!`,
      error: `The ${LIGHT_TYPE_LABELS[lights[lightOption].type].toLowerCase()} was not deleted satisfactorily!`
    }, INDEX_OUT_LIGHT_ARRAY.create_light);
    setWillDelete(false);
  }

  //* Effect to update state variables when the selected light option changes.
  useEffect(() => {
    const newOption = lights?.find((_, index) => index === lightOption);

    setLightParams({
      decay: newOption?.params.decay ?? DEFAULT_THREE_JS_PROPS.decay,
      distance: newOption?.params.dist ?? DEFAULT_THREE_JS_PROPS.distance,
      intensity: newOption?.params.intst ?? DEFAULT_THREE_JS_PROPS.intensity,
      color: newOption?.params.color ?? DEFAULT_THREE_JS_PROPS.color,
      lookAt: newOption?.params.lAt ?? DEFAULT_THREE_JS_PROPS.lookAt,
      position: newOption?.params.pos ?? DEFAULT_THREE_JS_PROPS.position,
      size: {
        width: newOption?.params.width ?? DEFAULT_THREE_JS_PROPS.width,
        height: newOption?.params.height ?? DEFAULT_THREE_JS_PROPS.height
      }
    });
    setWillDelete(false);

    // Filter available light types to create a new light.
    if (lightOption === INDEX_OUT_LIGHT_ARRAY.create_light) {
      if (pointLightCount < MAX_POINT_LIGHTS) {
        setCreateLightOption(LightType.PointLight);
      } else if (rectAreaLightCount < MAX_RECT_AREA_LIGHT) {
        setCreateLightOption(LightType.RectAreaLight);
      } else if (ambientLightCount < MAX_AMBIENT_LIGHT) {
        setCreateLightOption(LightType.AmbientLight);
      }
    } else {
      setCreateLightOption('');
    }
  }, [lightOption, lights]);

  const calculeOtherInputWidth = () => {
    const componentsToRender = [
      { prefix: 'intst', completeName: 'intensity' },
      { prefix: 'dist', completeName: 'distance' },
      { prefix: 'decay', completeName: 'decay' }
    ];

    let numRenderedComponents = componentsToRender.reduce((count, component) => {
      if (component.prefix in currentParams || LIGHT_PROPERTIES[createLightOption as LightType].includes(component.completeName)) {
        return count + 1;
      }
      return count;
    }, 0);

    switch (numRenderedComponents) {
      case 1:
        return 'w-full';
      case 2:
        return 'w-1/2';
      default:
        return 'w-1/3';
    }
  };


  return (
    <>
      {lightOption === INDEX_OUT_LIGHT_ARRAY.create_light && <div className="relative mt-5 w-full cursor-pointer px-2">
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
          {lightTypeOptions.map((lightType) => {
            if (
              (lightType === LightType.PointLight && pointLightCount < MAX_POINT_LIGHTS) ||
              (lightType === LightType.RectAreaLight && rectAreaLightCount < MAX_RECT_AREA_LIGHT) ||
              (lightType === LightType.AmbientLight && ambientLightCount < MAX_AMBIENT_LIGHT)
            ) {
              return (
                <option key={lightType} value={lightType}>
                  {LIGHT_TYPE_LABELS[lightType]}
                </option>
              );
            }
            return null;
          })}
        </select>
      </div>}
      {/* Position input fields */}
      {('pos' in currentParams || LIGHT_PROPERTIES[createLightOption as LightType].includes('position')) && (
        <AxisInputFieldUI<AGVector3>
          inputLabel="Light Position"
          axisLabels={['X', 'Y', 'Z']}
          configProp={lightParams.position}
          setConfigProp={(value: AGVector3) => {
            setLightParams({
              ...lightParams,
              position: value
            })
          }}
        />
      )}
      {/* Look at input fields */}
      {('lAt' in currentParams || LIGHT_PROPERTIES[createLightOption as LightType].includes('lookAt')) && (
        <AxisInputFieldUI<AGVector3>
          inputLabel="Look At"
          axisLabels={['X', 'Y', 'Z']}
          configProp={lightParams.lookAt}
          setConfigProp={(value: AGVector3) => {
            setLightParams({
              ...lightParams,
              lookAt: value
            })
          }}
        />
      )}
      {/* Color selection field */}
      {('color' in currentParams || LIGHT_PROPERTIES[createLightOption as LightType].includes('color')) && (
        <ColorInputFieldUI
          inputLabel="Default Color"
          configProp={lightParams.color}
          setConfigProp={(value: string) => {
            setLightParams({
              ...lightParams,
              color: value
            })
          }}
        />
      )}
      {/* Size input fields */}
      {(('width' in currentParams || 'height' in currentParams) || LIGHT_PROPERTIES[createLightOption as LightType].includes('size')) && (
        <AxisInputFieldUI<{ width: number, height: number }>
          inputLabel="Size"
          axisLabels={["Width", "Height"]}
          configProp={lightParams.size}
          setConfigProp={(value: { width: number, height: number }) => {
            setLightParams({
              ...lightParams,
              size: value
            })
          }}
        />
      )}
      {/* Other input fields */}
      <div className="w-[350px] flex flex-wrap justify-between">
        {('intst' in currentParams || LIGHT_PROPERTIES[createLightOption as LightType].includes('intensity')) && (
          <SingleInputFieldUI
            inputLabel="Intensity"
            configProp={lightParams.intensity}
            setConfigProp={(value: number) => {
              setLightParams({
                ...lightParams,
                intensity: value
              })
            }}
            width={calculeOtherInputWidth()}
          />
        )}
        {('dist' in currentParams || LIGHT_PROPERTIES[createLightOption as LightType].includes('distance')) && (
          <SingleInputFieldUI
            inputLabel="Distance"
            configProp={lightParams.distance}
            setConfigProp={(value: number) => {
              setLightParams({
                ...lightParams,
                distance: value
              })
            }}
            width={calculeOtherInputWidth()}
          />
        )}
        {('decay' in currentParams || LIGHT_PROPERTIES[createLightOption as LightType].includes('decay')) && (
          <SingleInputFieldUI
            inputLabel="Decay"
            configProp={lightParams.decay}
            setConfigProp={(value: number) => {
              setLightParams({
                ...lightParams,
                decay: value
              })
            }}
            width={calculeOtherInputWidth()}
          />
        )}
      </div>
      {/* Create and Update button */}
      <div className="pt-4 px-2">
        {lightOption === INDEX_OUT_LIGHT_ARRAY.create_light
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
                  <p className="pl-2 text-sm">Delete {LIGHT_TYPE_LABELS[currentOption ? currentOption.type : LightType.PointLight].toLowerCase()}</p>
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