import {ChangeEvent, Component, FormEvent} from "react";
import Head from "next/head";
import AGButton from "../../components/common/ag-button.component";
import AGLoading from "../../components/common/ag-loading.component";
import {IsLogIn, LogIn} from "../../utils/firebase.util";
import {withRouter} from "next/router";
import {WithRouterProps} from "next/dist/client/with-router";
import {PageLocation} from "../../enums/common.enum";
import {FirebaseError} from "@firebase/util";

interface LoginProps extends WithRouterProps {
}

interface LoginState {
  user?: string;
  pass?: string;
  loading: boolean;
}

class Login extends Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  
  async componentDidMount() {
    if(await IsLogIn()){
      this.GoToList();
    }
    else {
      this.SetLoading(false);
    }
  }

  render() {
    return (
      <>
        <Head>
          <title>Admin</title>
        </Head>
        <AGLoading loading={this.state?.loading} transparency />
        <div className="flex justify-center h-screen items-center bg-amber-100">
          <div className="w-5/6">
            <div className="flex justify-center">
              <form onSubmit={event => this.handleSubmit(event)} className="w-2/3 max-w-xs">
                <div className="my-2 flex justify-center">
                  <p className="font-bold text-3xl">Welcome</p>
                </div>
                <div className="my-2">
                  <p>User</p>
                  <input className="border-2 border-emerald-900 rounded w-full px-2 focus:bg-sky-300"
                         type="text" required onChange={event => this.handleStateChange("user", event)}/>
                </div>
                <div className="my-2">
                  <p>Password</p>
                  <input className="border-2 border-emerald-900 rounded w-full px-2 focus:bg-fuchsia-400"
                         type="password" required onChange={event => this.handleStateChange("pass", event)}/>
                </div>
                <AGButton type="primary" form>Log In</AGButton>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  private handleStateChange(key: keyof Omit<LoginState, 'loading'>, event: ChangeEvent<HTMLInputElement>, callback?: () => void) {
    const newState = {
      [key]: event.target.value
    } as Pick<LoginState, keyof Omit<LoginState, 'loading'>>;
    this.setState(newState, callback);
  }

  private async handleSubmit(event: FormEvent<HTMLFormElement>) {
    const { user, pass } = this.state;
    event.preventDefault();
    if(!(user && pass)) {
      alert('Please insert a User and password.');
      return;
    }
    
    this.SetLoading();
    try {
      const logged = await LogIn({user: user!, pass: pass!});
      if (logged)
        this.GoToList();
    }
    catch (err) {
      // console.log('LogInError: ', JSON.parse(JSON.stringify(err)));
      const error = err as FirebaseError;
      this.SetLoading(false);
      alert(`LogIn error: ${error.code}`);
    }
  }
  
  private SetLoading(newState: boolean = true) {
    this.setState({ loading: newState });
  }
  
  private GoToList() {
    this.SetLoading();
    this.props.router.push(PageLocation.AssetList).then();
  }
}

export default withRouter(Login);