import Image from "next/image";
import {FeatureInterface} from "../interfaces/api.interface";
import {BasicData} from "../interfaces/common.interface";
import {MouseEvent} from "react";

interface ExampleProps {
  list: FeatureInterface[] | BasicData[];
  handleClick: (id: string) => void;
  handleClick2: (flag: boolean) => void;
  activeFeature: string;
  close: boolean;
}

function getSiblings(el: HTMLElement) {

  // for collecting siblings
  const siblings: ChildNode[] = [];

  // if no parent, return no sibling
  if (!el.parentNode) {
    return siblings;
  }

  // first child of the parent node
  let sibling = el.parentNode.firstChild;

  // collecting siblings
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== el) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }
  return siblings;
}

function optionList(props: ExampleProps) {

  function selectFeature(e: MouseEvent<HTMLDivElement>, id: string) {
    e.preventDefault();
    const el = e.target as HTMLElement;
    const siblings = getSiblings(el);
    siblings.forEach(sibling => {
      const bro = sibling as HTMLElement
      bro.classList.add('!bg-transparent');
    });
    el.classList.remove('!bg-transparent');
    props.handleClick(id);
  }

  return props.list.map((x) => {
    return (
      <div
        className={"overflow-hidden w-12 h-12 flex justify-center flex-col items-center bg-slate-50" + (props.activeFeature === x.id ? '' : ' !bg-transparent')}
        key={x.id} onClick={event => selectFeature(event, x.id)}>
        <div className="pointer-events-none">
          <Image src={'/resources/icons/features/' + x.id + '.svg'} width={30} height={30} alt={x.id}/>
        </div>
      </div>
    )
  });
}

function CategorySelectorComponent(props: ExampleProps) {

  return (
    <div
      className={"w-14 bg-gray-200 border-2 border-gray-100 fixed top-4 left-4 rounded-[6px] drop-shadow-md flex flex-col items-center " + (props.close ? 'h-[50px] overflow-hidden left-20' : '')}>
      <div className="w-12 h-12 flex justify-center items-center border-b-2 border-solid border-gray-100 p-2"
           onClick={() => props.handleClick2(true)}>
        <Image src={'/resources/icons/features/features.svg'} width={30} height={30} alt={'features'}/>
      </div>
      <div className="py-4">
        {optionList(props)}
      </div>
    </div>
  )
}

export {CategorySelectorComponent};