import React from "react";
import { Card, Button, Row, Col } from "antd";
import ContactCard from "./Components/ContactCard";

interface WelcomeProps {
  isAuthenticated: boolean;
  authButtonMethod: any;
  user: any;
}

interface WelcomeState {
  isOpen: boolean;
}

function WelcomeContent(props: WelcomeProps) {
  // If authenticated, greet the user
  if (props.isAuthenticated) {
    //const url = window.URL || window.webkitURL;
    //const blobUrl = ""; //url.createObjectURL(props.user.photo);
    return <ContactCard user={props.user} />;
  }

  // Not authenticated, present a sign in button
  return (
    <Button type="primary" size="large" onClick={props.authButtonMethod}>
      Click here to Sign In
    </Button>
  );
}

export default class Welcome extends React.Component<
  WelcomeProps,
  WelcomeState
> {
  render() {
    return (
      <>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="logo">
              <span>
                <h1>Metro Organization Chart</h1>
              </span>
              <p className="lead">
                Welcome to Metro Organization Chart based on PeopleSoft HCM data
                (position based)
              </p>
            </div>
            <WelcomeContent
              user={this.props.user}
              isAuthenticated={this.props.isAuthenticated}
              authButtonMethod={this.props.authButtonMethod}
            />
          </Col>
          <Col span={12}>
            <Card type="inner" title="Curent Version Features" bordered={true}>
              <table>
                <tr>
                  <td>
                    {" "}
                    <ul>
                      <li>Build Custom Org Chart (Explore Mode)</li>
                      <li>Build by Office/Branch</li>
                      <li>Build by Name</li>
                      <li>Search a Name</li>
                      <li>Print to PDF</li>
                      <li>Export to Excel</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>Show or Hide Contractors</li>
                      <li>Show or Hide Vacant Positions</li>
                      <li>
                        Total reportees for Employees (E), Contractors (C) and
                        Vacant (V){" "}
                      </li>
                      <li>
                        Direct reportees for Employees (E), Contractors (C) and
                        Vacant (V){" "}
                      </li>
                    </ul>
                  </td>
                </tr>
              </table>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>&nbsp;</Col>
          <Col span={12}>
            <Card type="inner" title="Coming Soon" bordered={true}>
              <p>
                <ul>
                  <li>ADA Compliance</li>
                  <li>Functional Org Chart based on WMATA.COM</li>
                  <li>
                    Executive & Senior Management Org Chart based on MetroWeb
                  </li>
                </ul>
              </p>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
