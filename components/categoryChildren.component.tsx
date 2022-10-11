import Image from "next/image";
import { FeatureInterface } from "../interfaces/api.interface";

interface ExampleProps {
  list?: FeatureInterface[];
  handleClick: (id: string, path: string, name: string) => void;
}

function optionList(props: ExampleProps) {
  return props.list.map((x: FeatureInterface) => {
    return (
      <div className="w-16 h-16 bg-gray-200 border-2 border-gray-100 rounded-[6px] drop-shadow-md mb-4" key={x.id} onClick={() => {props.handleClick(x.id, x.path, x.name)}}>
        <div className="flex flex-col items-center justify-center h-full">
          <Image src={'/resources/icos/features/' + x.type + '.svg'} width={30} height={30} alt={x.type}/>
          <p className="text-[0.7rem] whitespace-nowrap">{x.name}</p>
        </div>
      </div>
    )
  });
}

function CategoryChildrenComponent(props: ExampleProps) {
  return (
    <div className="fixed top-4 right-4 h-[75%] overflow-auto scrollbar-hide" >
      <div>
        {optionList(props)}
      </div>
      <div className="fixed top-[80%] right-4">
        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16px"
        viewBox="0 0 330 330">
          <path fill="rgba(255, 255, 255, 0.5)" d="M328.859,84.26C326.537,78.655,321.067,75,315,75H15c-6.067,0-11.537,3.655-13.858,9.26
            c-2.321,5.605-1.038,12.057,3.252,16.347l150,150C157.323,253.536,161.161,255,165,255s7.678-1.464,10.606-4.394l150-150
            C329.897,96.317,331.18,89.865,328.859,84.26z M165,218.787L51.214,105h227.573L165,218.787z"/>
        </svg>
      </div>
    </div>
  )
}

export {CategoryChildrenComponent};