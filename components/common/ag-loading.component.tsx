import {Component} from "react";

interface AGLoadingProps {
  loading?: boolean;
  transparency?: boolean;
  bgColor?: string;
}

export default class AGLoading extends Component<AGLoadingProps> {
  render() {
    return (
      <>
        {
          this.props.loading ?
            <div style={{backgroundColor: `#${this.props.bgColor ?? "FFFFFF"}`}}
                 className={"fixed z-50 left-0 top-0 w-full h-full" + (this.props.transparency ? ' bg-opacity-50 backdrop-blur-sm' : '')}>
              <div className="flex justify-center items-center h-full align-middle space-x-2">
                <div style={{borderTopColor: "transparent"}}
                     className="w-20 h-20 border-4 border-blue-400 border-dotted rounded-full animate-spin">
                </div>
              </div>
            </div> : ''
        }
      </>
    );
  }
}