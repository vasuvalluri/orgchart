import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Button } from "antd";
import { config } from "./Config";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.css";
import MenuItem from "antd/lib/menu/MenuItem";
const IMAGE_URL = config.IMAGE_URL;
interface OrgNavBarProps {
  isAuthenticated: boolean;
  authButtonMethod: any;
  user: any;
}

interface OrgNavBarState {
  isOpen: boolean;
}

function UserAvatar(props: any) {
  // If a user avatar is available, return an img tag with the pic
  if (props.user.avatar) {
    return (
      <img
        src={props.user.avatar}
        alt="user"
        className="rounded-circle align-self-center mr-2"
        style={{ width: "32px" }}
      ></img>
    );
  }

  // No avatar available, return a default icon
  return (
    <i
      className="far fa-user-circle fa-lg rounded-circle align-self-center mr-2"
      style={{ width: "32px" }}
    ></i>
  );
}

function AuthNavItem(props: OrgNavBarProps) {
  // If authenticated, return a dropdown with the user's info and a
  // sign out button
  if (props.isAuthenticated) {
    return (
      <UncontrolledDropdown>
        <DropdownToggle nav caret>
          <UserAvatar user={props.user} />
        </DropdownToggle>
        <DropdownMenu right>
          <h5 className="dropdown-item-text mb-0">{props.user.displayName}</h5>
          <p className="dropdown-item-text text-muted mb-0">
            {props.user.email}
          </p>
          <DropdownItem divider />
          <DropdownItem onClick={props.authButtonMethod}>Sign Out</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  // Not authenticated, return a sign in link
  return (
    <NavItem>
      <Button type="link" onClick={props.authButtonMethod} color="gray">
        Sign In
      </Button>
    </NavItem>
  );
}
let visible = false;
export default class OrgNavBar extends React.Component<
  OrgNavBarProps,
  OrgNavBarState
> {
  constructor(props: OrgNavBarProps) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }
  showModal() {
    visible = true;
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }
  render() {
    let calendarLink = null;
    if (this.props.isAuthenticated) {
      calendarLink = (
        <>
          <NavItem>
            <RouterNavLink to="/orgchart" className="nav-link" exact>
              Org Chart
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink to="/orgchartbyname" className="nav-link" exact>
              Search By Name
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink to="/feedback" className="nav-link" exact>
              Feedback
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <a
              href={config.IMAGE_URL + "UserGuide.pdf"}
              target="_blank"
              className="nav-link"
            >
              User Guide
            </a>
          </NavItem>
          {this.props.user.exceptionUsers.includes(this.props.user.email.split("@")[0]) ?
            <NavItem>
              <a href={config.IMAGE_URL + "exception_report.csv"} className="nav-link">
                Exception Report
              </a>
            </NavItem>
            : ""
          }
        </>
      );
    }

    return (
      <>
        <div>
          <Navbar color="dark" dark expand="md" fixed="top">
            <div className="navFlex">
              <div>
                <NavbarBrand href="/">
                  <div className="row">
                    <div className="rowspan2">
                      <img
                        alt=""
                        src="/wmata_logo.png"
                        width="60"
                        height="78"
                      />
                    </div>
                    <div className="column">
                      <div>
                        &nbsp;&nbsp;Washington Metropolitan Area Transit
                        Authority
                      </div>
                      <div>
                        <Nav className="mr-auto" navbar>
                          <NavItem>
                            <RouterNavLink to="/" className="nav-link" exact>
                              Home
                            </RouterNavLink>
                          </NavItem>
                          {calendarLink}
                        </Nav>
                      </div>
                    </div>
                  </div>
                </NavbarBrand>
              </div>
              <div className="right">
                <NavbarToggler onClick={this.toggle} />
                <Collapse isOpen={this.state.isOpen} navbar>
                  <Nav navbar>
                    <NavItem>
                      <NavLink href="https://washingtondcmetro.sharepoint.com/sites/Metroweb" target="_blank">
                        <i className="fas fa-external-link-alt mr-1"></i>
                        MetroWeb
                      </NavLink>
                    </NavItem>
                    <AuthNavItem
                      isAuthenticated={this.props.isAuthenticated}
                      authButtonMethod={this.props.authButtonMethod}
                      user={this.props.user}
                    />
                  </Nav>
                </Collapse>
              </div>
            </div>
          </Navbar>
        </div>
      </>
    );
  }
}
