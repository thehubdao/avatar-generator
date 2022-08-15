import {Component} from "react";

interface AGButtonProps {
  type?: 'primary' | 'secondary' | 'alert' | 'danger';
  side?: 'center' | 'start' | 'end';
  onClickEvent?: Function;
  children?: string;
  form?: boolean;
}

interface AGButtonState {
  color: string;
  borderColor: string;
  textColor: string;
  hover: string;
  side?: string;
}

export default class AGButton extends Component<AGButtonProps, AGButtonState>{
  constructor(props: AGButtonProps) {
    super(props);
    this.state = {
      ...this.getBtnType(props.type),
      side: this.getSide(props.side),
    };
  }
  
  getBtnType(type?: string): AGButtonState {
    switch (type) {
      case 'secondary':
        return { color: 'bg-teal-600', textColor: 'text-white', borderColor: 'border-gray-600', hover: 'hover:bg-teal-500' };
      case 'alert':
        return { color: 'bg-yellow-500', textColor: 'text-white', borderColor: 'border-gray-600', hover: 'hover:bg-yellow-400' };
      case 'danger':
        return { color: 'bg-rose-600', textColor: 'text-white', borderColor: 'border-gray-600', hover: 'hover:bg-rose-500' };
      default:
        // primary
        return { color: 'bg-sky-600', textColor: 'text-white', borderColor: 'border-gray-600', hover: 'hover:bg-sky-500' };
    }
  }

  private getSide(side: "center" | "start" | "end" | undefined) {
    switch(side) {
      case "start":
        return "justify-start";
      case "end":
        return "justify-end";
      default:
        return 'justify-center';
    }
  }
  
  render() {
    const { color, borderColor, textColor, hover} = this.state;
    
    return (
      <div className={`my-2 flex ${this.state.side}`}>
        <button type={this.props.form ? "submit": "button"} className={`mx-2 w-auto rounded py-1 border-1 ${hover} ${textColor} ${color} ${borderColor}`}
                onClick={() => this.props.onClickEvent ? this.props.onClickEvent() : undefined}>
          <p className='px-4'>{this.props.children}</p>
        </button>
      </div>
    );
  }
}
