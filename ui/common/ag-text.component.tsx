import {Component} from "react";
import {Delay} from "../../utils/common.util";

type TextType = 'th1' | 'th1.5' | 'th2' | 'th3' | 'text' | 'code' | 'link' | 'end' | 'icon';
type MarkType = 'bullet' | 'dash';

interface AGTextProps {
  type: TextType;
  mark?: MarkType | string;
  href?: string;
  justText?: boolean;
  side?: 'center' | 'left' | 'right';
  children?: string | JSX.Element | (string | JSX.Element)[];
}

interface AGTextState {
  copied: boolean;
}

export default class AGText extends Component<AGTextProps, AGTextState> {
  getSide() {
    const { side } = this.props;
    if(!side)
      return '';
    
    switch (side) {
      case "center":
        return ' text-center';
      case "left":
        return ' text-left';
      case "right":
        return ' text-right';
    }
  }
  
  renderMark() {
    const { mark } = this.props;
    if(!mark)
      return;
    
    let leMark = mark;
    
    switch (mark) {
      case "bullet":
        leMark = '◉';
        break;
      case "dash":
        leMark = '-';
        break;
    }
    
    return <span className="ml-1 mr-3">{leMark}</span>;
  }
  
  renderType() {
    const { children, type, href } = this.props;
    
    switch (type) {
      case 'th1':
        return <p className={"mt-2 mb-10 font-bold text-5xl" + this.getSide()}>{this.renderMark()}{children}</p>;
      case 'th1.5':
        return <p className={"mt-10 mb-2 font-semibold text-3xl text-gray-500" + this.getSide()}>{this.renderMark()}{children}</p>;
      case 'th2':
        return <p className={"mb-2 mt-5 font-semibold text-lg" + this.getSide()}>{this.renderMark()}{children}</p>;
      case 'th3':
        return <p className={"mt-2 mb-1 font-medium text-base" + this.getSide()}>{this.renderMark()}{children}</p>;
      case 'text':
        return <p className="my-1 text-justify">{this.renderMark()}{children}</p>;
      case 'code':
        return (
          <div>
            <button title="Copy"
                    className="bg-sky-300 border-cyan-500 border-2 rounded-lg p-2 float-right mr-3 -mt-2"
                    onClick={() => void this.copyToClipboard(children as string)}>{this.state?.copied ? '✔' : '📄'}</button>
            <p className={'my-2 mx-1 p-2 bg-slate-400 text-sm text-indigo-900 rounded' + (this.props.justText ? ' break-all' : ' whitespace-pre-wrap') }
               style={{fontFamily: '"Lucida Console", Monaco'}}>{children}</p>
          </div>
        );
      case "link":
        return <> <a target="_blank" rel='noreferrer' href={href} className="underline">{children}</a></>
      case "end":
        return <div className="mb-20"></div>;
      case "icon":
        return <span className="text-4xl">{children}</span>
    }
  }
  
  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);

      this.setState({copied: true});
      await Delay(1000);
      this.setState({copied: false});
    } catch (e) {
      console.error("Error copying to clipboard: ", e);
    }
  }
  
  render() {
    return (
      this.renderType()
    );
  }
}