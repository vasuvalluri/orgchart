import { Component } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import OrgNavBar from "./OrgNavBar";
import Welcome from "./Welcome";
import ChartRouter from "./Components/ChartRouter";
import Feedback from "./Components/Feedback";
import NameChartRouter from "./Components/NameChartRouter";
import "./App.css";
import withAuthProvider, {
  AuthComponentProps,
  AuthProviderState,
} from "./AuthProvider";
import { Switch } from "antd";
import "antd/dist/antd.css";
require("orgchart/src/js/jquery.orgchart");
require("orgchart/src/css/jquery.orgchart.css");
const ReactDOM = require("react-dom");

function SelctionBar() {
  return (
    <div
      className="fixed-top fixed-top-2 bg-info"
      style={{ paddingTop: "0px", paddingBottom: "0px" }}
    >
      <div className="selectBar">
        <div id="navPrintable"></div>
        <div id="navSelect"></div>
        <div id="navNameSelect"></div>
        <div id="navContractor"></div>
      </div>
    </div>
  );
}

class App extends Component<AuthComponentProps, AuthProviderState> {
  constructor(props: any) {
    super(props);
    this.state = {
      ...this.state,
      isPrintable: false,
    };
  }
  setPrintable = (isPrintable: boolean) => {
    this.setState({ isPrintable: isPrintable });
  };
  handleChange = (checked: boolean) => {
    this.setState({ isPrintable: checked });
  };

  render() {
    let error = null;
    console.log("app", this.props.user);
    if (this.props.error) {
      error = (
        <ErrorMessage
          message={this.props.error.message}
          debug={this.props.error.debug}
        />
      );
    }
    return (
      <Router>
        <OrgNavBar
          isAuthenticated={this.props.isAuthenticated}
          authButtonMethod={
            this.props.isAuthenticated ? this.props.logout : this.props.login
          }
          user={this.props.user}
        ></OrgNavBar>
        {error}
        <SelctionBar />
        <div id="route" className="jumbotron">
          <Route
            exact
            path="/"
            render={(props) => (
              <Welcome
                {...props}
                isAuthenticated={this.props.isAuthenticated}
                user={this.props.user}
                authButtonMethod={this.props.login}
              />
            )}
          />
          <Route
            exact
            path="/orgchart"
            render={(props) =>
              this.props.isAuthenticated ? (
                <>
                  {ReactDOM.createPortal(
                    <div style={{ marginTop: "8px", marginBottom: "8px" }}>
                      <Switch
                        checkedChildren="Explore"
                        unCheckedChildren="Print Preview"
                        onChange={this.handleChange}
                      />
                    </div>,
                    document.getElementById("navPrintable")
                  )}
                  <ChartRouter
                    key={1}
                    isPrintable={this.state.isPrintable}
                    onCBChange={this.state.onCBChange}
                    setPrintable={this.setPrintable}
                    isShowContractors={this.state.isShowContractors}
                    user={this.props.user}
                  />
                </>
              ) : (
                <Redirect to="/" />
              )
            }
          />
          <Route
            exact
            path="/orgchartbyname"
            render={(props) =>
              this.props.isAuthenticated ? (
                <>
                  <NameChartRouter
                    key={2}
                    user={this.props.user}
                    handleChange={this.handleChange}
                    setPrintable={this.setPrintable}
                    isPrintable={this.state.isPrintable}
                  />
                </>
              ) : (
                <Redirect to="/" />
              )
            }
          />
          <Route
            exact
            path="/feedback"
            render={(props) =>
              this.props.isAuthenticated ? (
                <>
                  <Feedback user={this.props.user} />
                </>
              ) : (
                <Redirect to="/" />
              )
            }
          />
        </div>
      </Router>
    );
  }
}

export default withAuthProvider(App);
