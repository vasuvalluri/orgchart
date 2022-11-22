import React from "react";
import { Switch } from "antd";
import PrintableNew from "./PrintableNew";
import { config } from "../Config";
import NameSelected from "./NameSelected";
import NamesList from "./NamesList";
import "bootstrap/dist/css/bootstrap.css";

const ReactDOM = require("react-dom");
let nameLength = 0;
let nameValue = null,
  $ = require("jquery");
const BASE_URL = config.BASE_URL;
const DATA_BY_NAME = "/getDataByName/";

class NameChartRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      nameValue: null,
      chartData: null,
      isPrintable: false,
    };
    this.setData = this.setData.bind(this);
  }

  onNameChange = (value) => {
    this.setState({ selectedData: null, isNameFetched: false });
    if (value !== undefined) {
      nameLength = value.length;
      nameValue = value;
      this.setState({ nameValue: value });
      if (nameLength > 2) {
        fetch(`${BASE_URL}${DATA_BY_NAME}${value}`)
          .then((res) => res.json())
          .then(
            (result) => {
              this.setState({
                selectedData: result,
                isNameFetched: true,
                nameValue: value,
              });
            },
            (error) => {
              this.setState({ selectedData: null });
            }
          );
      } else {
        this.setState({ selectedData: null, isNameFetched: false });
      }
    } else {
      this.setState({ selectedData: null, isNameFetched: false });
    }
  };
  setData = (
    dataFromChild,
    collapsedMapFromChild,
    isShowContractors,
    isPrintable
  ) => {
    this.setState({
      data: dataFromChild,
      collapsedMap: collapsedMapFromChild,
      isShowContractors: isShowContractors,
      isPrintable: isPrintable,
    });
  };

  render() {
    $(".oc-export-btn").remove();

    return (
      <>
        {ReactDOM.createPortal(
          <div style={{ marginTop: "8px", marginBottom: "8px" }}>
            <NamesList
              style={{ width: "800px" }}
              onNameChange={(value) => this.onNameChange}
              placeholder="Enter name to search"
            />
          </div>,
          document.getElementById("navSelect")
        )}

        {nameLength > 2 && this.state.isNameFetched ? (
          ReactDOM.createPortal(
            <div style={{ marginTop: "8px", marginBottom: "8px" }}>
              <Switch
                checkedChildren="Explore"
                unCheckedChildren="Print Preview"
                onChange={this.props.handleChange}
              />
            </div>,
            document.getElementById("navPrintable")
          )
        ) : (
          <h4>
            Please enter at least three(3) characters in the name search field
            to list names and build orgchart
          </h4>
        )}

        {this.props.isPrintable &&
          nameLength > 2 &&
          this.state.isNameFetched ? (
          <PrintableNew
            setData={this.setData}
            data={this.state.data}
            setPrintable={this.props.setPrintable}
            collapsedMap={this.state.collapsedMap}
          />
        ) : (
          <></>
        )}
        {!this.props.isPrintable &&
          nameLength > 2 &&
          this.state.isNameFetched ? (
          <NameSelected
            setData={this.setData}
            isNameFetched={this.state.isNameFetched}
            isShowContractors={this.props.isShowContractors}
            user={this.props.user}
            nameValue={this.state.nameValue}
            selectedData={this.state.selectedData}
          />
        ) : (
          <></>
        )}
      </>
    );
  }
}
export default NameChartRouter;
