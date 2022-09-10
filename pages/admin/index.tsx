import {ChangeEvent, Component, FormEvent} from "react";
import Head from "next/head";
import AGButton from "../../components/ag-button.component";
import AGLoading from "../../components/ag-loading.component";
import {FirebaseUtil} from "../../utils/firebase.util";
import {withRouter} from "next/router";
import {WithRouterProps} from "next/dist/client/with-router";

interface AdminProps extends WithRouterProps {
}

interface AdminState {
  user?: string;
  pass?: string;
  loading: boolean;
}

class Admin extends Component<AdminProps, AdminState> {
  constructor(props: AdminProps) {
    super(props);
    this.state = {
      loading: true,
    }
  }
  
  async componentDidMount() {
    if(await FirebaseUtil.Instance().IsLogIn()){
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
  
  private handleStateChange(key: keyof Omit<AdminState, 'loading'>, event: ChangeEvent<HTMLInputElement>, callback?: () => void) {
    const newState = {
      [key]: event.target.value
    } as Pick<AdminState, keyof Omit<AdminState, 'loading'>>;
    this.setState(newState, callback);
  }

  private handleSubmit(event: FormEvent<HTMLFormElement>) {
    const { user, pass } = this.state;
    
    this.SetLoading();
    FirebaseUtil.Instance().LogIn({ user: `${user}@freak.com`, pass: pass! })
      .then((result) => {
        // console.log('LogInSuccess: ', result);
        this.GoToList();
      })
      .catch((err) => {
        // console.log('LogInError: ', JSON.parse(JSON.stringify(err)));
        this.SetLoading(false);
        alert(`LogIn error: ${err.code}`);
      });
    
    event.preventDefault();
  }
  
  private SetLoading(newState: boolean = true) {
    this.setState({ loading: newState });
  }
  
  private GoToList() {
    this.SetLoading();
    this.props.router.push('/admin/assets/list').then();
  }
}

export default withRouter(Admin);