import { ChangeEvent, Component, FormEvent } from "react";
import Head from "next/head";
import AGButton from "../../components/common/ag-button.component";
import AGLoading from "../../components/common/ag-loading.component";
import { IsLogIn, LogIn } from "../../utils/firebase.util";
import { PageLocation } from "../../enums/common.enum";
import { FirebaseError } from "@firebase/util";
import { GoToPage } from "../../utils/router.util";

interface LoginState {
  user?: string;
  pass?: string;
  loading: boolean;
}

export default class Login extends Component<undefined, LoginState> {
  constructor(props: undefined) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    if (await IsLogIn()) {
      await this.GoToDashboard();
    }
    else {
      this.SetLoading(false);
    }
  }

  render() {
    return (
      <>
        <Head>
          <title>Login</title>
        </Head>
        <AGLoading loading={this.state?.loading} transparency />
        {/* <div className="flex justify-center h-screen items-center bg-amber-100">
          <div className="w-5/6">
            <div className="flex justify-center">
              <form onSubmit={event => void this.handleSubmit(event)} className="w-2/3 max-w-xs">
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
        </div> */}
        <div className="w-full h-screen grid grid-cols-[65%_1fr] font-work">
          <div className="bg-gray-900">
            avatar iFrame
          </div>
          <div className="bg-bg p-28">
            <div className="flex flex-col justify-between h-full">
              <div>
                <h1 className="font-humane text-right text-[10rem] text-gray-dark leading-[0.75]">META<br />AVATAR<br />BUILDER</h1>
                <p className="text-right text-gray-light">
                  by&nbsp;
                  <a className="underline" href="https://www.metagamehub.io/" target="_blank" rel="noopener noreferrer">MetaGameHub DAO</a>
                </p>
              </div>
              <div className="flex justify-end">
                <form onSubmit={event => void this.handleSubmit(event)} className="w-2/3 max-w-xs">
                  <input className="shadow-inset-medium rounded-full w-full py-2 px-4 mb-4" placeholder="User"
                    type="text" required onChange={event => this.handleStateChange("user", event)} />
                  <input className="shadow-inset-medium rounded-full w-full py-2 px-4 mb-4" placeholder="Password"
                    type="password" required onChange={event => this.handleStateChange("pass", event)} />
                  <AGButton form nm align="end">Log In</AGButton>
                </form>
              </div>
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
    if (!(user && pass)) {
      alert('Please insert a User and password.');
      return;
    }

    this.SetLoading();
    try {
      const logged = await LogIn({ user, pass });
      if (logged)
        await this.GoToDashboard();
    }
    catch (err) {
      // console.log('LogInError: ', JSON.parse(JSON.stringify(err)));
      const error = err as FirebaseError;
      this.SetLoading(false);
      alert(`LogIn error: ${error.code}`);
    }
  }

  private SetLoading(newState = true) {
    this.setState({ loading: newState });
  }

  private async GoToDashboard() {
    this.SetLoading();
    await GoToPage(PageLocation.Admin);
  }
}