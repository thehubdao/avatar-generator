import { useEffect, useRef, useState } from "react";
import { ConfigLight } from "../../../../../interfaces/light.interface";
import { AGVector3 } from "../../../../../interfaces/common.interface";
import AGButton from "../../../../common/ag-button.component";
import { MdKeyboardArrowDown } from "react-icons/md";
import { LightType } from "../../../../../enums/light.enum";
import { LIGHT_TYPE_LABELS } from "../../../../../constants/lightType.constant";
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete } from "react-icons/ai";
import { DEFAULT_THREE_JS_PROPS } from "../../../../../constants/threeJsDefault.constant";

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
    e: React.ChangeEvent<HTMLInputElement>,
    setFunction: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const newValue = e.currentTarget.valueAsNumber;
    setFunction(isNaN(newValue) ? 0 : newValue);
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

  //* Function to return an empty string if a number is NaN.
  const controlNaN = (number: number) => {
    return isNaN(number) ? "" : number.toString();
  };

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
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Light position:
          </p>
          <div className="flex gap-4 px-2">
            {["X", "Y", "Z"].map((axis) => (
              <div className="flex items-center gap-2" key={axis}>
                <p>{axis}:</p>
                <input
                  type="number"
                  name={axis.toLowerCase()}
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(lightPosition[axis.toLowerCase() as "x" | "y" | "z"])}
                  onChange={(e) => handleInputChange(e, (value) => setLightPosition({ ...lightPosition, [axis.toLowerCase()]: value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Look at input fields */}
      {('lAt' in lightParams || sectionOnLightType[createLightOption as LightType].includes('lookAt')) && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Look at:
          </p>
          <div className="flex gap-4 px-2">
            {["X", "Y", "Z"].map((axis) => (
              <div className="flex items-center gap-2" key={axis}>
                <p>{axis}:</p>
                <input
                  type="number"
                  name={axis.toLowerCase()}
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(lightLookAt[axis.toLowerCase() as "x" | "y" | "z"])}
                  onChange={(e) => handleInputChange(e, (value) => setLightLookAt({ ...lightLookAt, [axis.toLowerCase()]: value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Color selection field */}
      {('color' in lightParams || sectionOnLightType[createLightOption as LightType].includes('color')) && (
        <>
          <div className="px-2">
            <p className="font-poppins font-medium text-purple pb-2">Default color:</p>
            <div className="relative rounded-full overflow-hidden w-full h-12">
              <input type="color" name="" value={`#${defaultColor}`} className="absolute -top-2 -left-2 w-[130%] h-[130%]"
                onChange={e => { setDefaultColor(e.target.value.substring(1)) }} />
              <div className="absolute bottom-2 left-2/4 -translate-x-2/4 rounded-full bg-bg shadow-inset-hard w-16 flex justify-center items-center">
                <p className="text-xs">{defaultColor}</p>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Size input fields */}
      {(('width' in lightParams || 'height' in lightParams) || sectionOnLightType[createLightOption as LightType].includes('size')) && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Size:
          </p>
          <div className="flex gap-4 px-2">
            {["Width", "Height"].map((axis) => (
              <div className="flex items-center gap-2" key={axis}>
                <p>{axis}:</p>
                <input
                  type="number"
                  name={axis.toLowerCase()}
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(lightSize[axis.toLowerCase() as "width" | "height"])}
                  onChange={(e) => handleInputChange(e, (value) => setLightSize({ ...lightSize, [axis.toLowerCase()]: value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Other input fields */}
      {'intst' in lightParams || sectionOnLightType[createLightOption as LightType].includes('intensity') && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Intensity:
          </p>
          <div className="flex items-center px-2">
            <input
              type="number"
              name='intensity'
              className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-full rounded-lg text-center bg-bg"
              value={controlNaN(lightIntensity)}
              onChange={(e) => handleInputChange(e, setLightIntensity)}
            />
          </div>
        </div>
      )}
      {'dist' in lightParams || sectionOnLightType[createLightOption as LightType].includes('distance') && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Distance:
          </p>
          <div className="flex items-center px-2">
            <input
              type="number"
              name='distance'
              className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-full rounded-lg text-center bg-bg"
              value={controlNaN(lightDistance)}
              onChange={(e) => handleInputChange(e, setLightDistance)}
            />
          </div>
        </div>
      )}
      {'decay' in lightParams || sectionOnLightType[createLightOption as LightType].includes('decay') && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Decay:
          </p>
          <div className="flex items-center px-2">
            <input
              type="number"
              name='decay'
              className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-full rounded-lg text-center bg-bg"
              value={controlNaN(lightDecay)}
              onChange={(e) => handleInputChange(e, setLightDecay)}
            />
          </div>
        </div>
      )}
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
