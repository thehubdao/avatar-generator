import {Component} from "react";

interface LayoutProps {
  children: JSX.Element | JSX.Element[];
}

interface LayoutState {
}

export default class Layout extends Component<LayoutProps, LayoutState> {
  render() {
    return (
      <div>
        <div>
          
        </div>
        {this.props.children}
      </div>
    );
  }
}