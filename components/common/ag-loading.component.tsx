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
          <div className='fixed top-0 left-0 w-screen h-screen flex justify-center items-center' style={{backgroundColor: `#${this.props.bgColor ?? "FFFFFF"}`}}>
            <div className="leap-frog">
            <div className="leap-frog__dot"></div>
            <div className="leap-frog__dot"></div>
            <div className="leap-frog__dot"></div>
          </div>
          </div>: ''
        }
      </>
    );
  }
}