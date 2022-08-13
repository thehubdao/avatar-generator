import Image from "next/image";
import { BodyPartLocationApi } from "../interfaces/api.interface";

interface ExampleProps {
  list: BodyPartLocationApi[];
  handleClick: Function;
}

function optionList(props: ExampleProps) {
  return props.list.map((x: BodyPartLocationApi) => {
    return (
      <div className="w-14 h-14 bg-gray-200 border-2 border-gray-100 rounded-[6px] drop-shadow-md mx-2 inline-block" key={x.id} onClick={() => {props.handleClick(x.id, x.path, x.name)}}>
        <div className="flex flex-col items-center justify-center h-full">
          <Image src={'/resources/icos/features/' + x.type + '.svg'} width={25} height={25} alt={x.type}/>
          <p className="text-[0.75rem]">{x.name}</p>
        </div>
      </div>
    )
  });
}

function CategoryChildrenComponent(props: ExampleProps) {
  return (
    <div className="fixed bottom-0 right-0 w-screen h-[20%] flex items-center" >
      <div className="h-16 w-screen overflow-auto whitespace-nowrap px-4">
        {optionList(props)}
      </div>
    </div>
  )
}

export {CategoryChildrenComponent};