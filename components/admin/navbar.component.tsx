import {Component} from "react";

interface NavbarProps {
  children: JSX.Element;
}

export default class Navbar extends Component<NavbarProps> {
  render() {
    return (
      <>
        <div>
          
        </div>
        {this.props.children}
      </>
    );
  }
}