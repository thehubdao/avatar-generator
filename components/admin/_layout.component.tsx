import {Component} from "react";
import {HandleNotLoggedIn} from "../../utils/firebase.util";

interface LayoutProps {
  children: JSX.Element | JSX.Element[];
}

interface LayoutState {
}

export default class Layout extends Component<LayoutProps, LayoutState> {
  async componentDidMount() {
    await HandleNotLoggedIn();
  }

  render() {
    return (
      <div>
        <div>
          <h1>This is the Layout</h1>
        </div>
        {this.props.children}
      </div>
    );
  }
}