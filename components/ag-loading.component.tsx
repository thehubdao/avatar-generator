import {Component} from "react";

interface AGLoadingProps {
  loading?: boolean;
}

export default class AGLoading extends Component<AGLoadingProps> {
  render() {
    return (
      <>
        {
          this.props.loading ?
            <div className="fixed left-0 top-0 w-full h-full bg-white">
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