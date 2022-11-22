import React from "react";
import { Cascader } from "antd";
import PrintableNew from "./PrintableNew";
import Explore from "./Explore";
import Selected from "./Selected";
import { config } from "../Config";
import "bootstrap/dist/css/bootstrap.css";

const ReactDOM = require("react-dom");

const BASE_URL = config.BASE_URL;
const DEPT = "/getDepartments";
const DATA_BY_DEPT = "/getDataByDept/";

let deptLength = 0;
let deptValue = null;
//let isShowContractors = false;
function filter(inputValue, path) {
  return path.some(
    (option) =>
      option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
  );
}
class ChartRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      deptValue: null,
      chartData: null,
      isShowContractors: false,
      isShowVacant: false,
      isPrintable: false,
    };
    this.setData = this.setData.bind(this);
    this.onDeptChange = this.onDeptChange.bind(this);
  }

  setData = (
    dataFromChild,
    collapsedMapFromChild,
    isShowContractors,
    isShowVacant,
    deptValue
  ) => {
    this.setState({
      data: dataFromChild,
      collapsedMap: collapsedMapFromChild,
      isShowContractors: isShowContractors,
      isShowVacant: isShowVacant,
      deptValue: deptValue,
    });
  };

  componentDidMount() {
    fetch(`${BASE_URL}${DEPT}`)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            departments: result,
          });
        },
        (error) => {
          this.setState({});
        }
      );
  }
  onDeptChange = (value) => {
    this.setState({ isDeptFetched: false });
    deptLength = value.length;
    deptValue = value;
    //this.setState({ deptValue: value });
    if (deptLength > 1) {
      fetch(
        `${BASE_URL}${DATA_BY_DEPT}${this.state.isShowContractors}&${this.state.isShowVacant}&${value}`
      )
        .then((res) => res.json())
        .then(
          (result) => {
            this.setState({
              selectedData: result,
              isDeptFetched: true,
              deptValue: value,
            });
          },
          (error) => {
            this.setState({ selectedData: null });
          }
        );
    } else {
      this.setState({ selectedData: null, isDeptFetched: false });
    }
  };
  /*  onCBChange = (e) => {
    isShowContractors = e.target.checked;
    if (deptLength > 2) {
      fetch(`${BASE_URL}${DATA_BY_DEPT}${deptValue}`)
        .then((res) => res.json())
        .then(
          (result) => {
            this.setState({ selectedData: result, isDeptFetched: true });
          },
          (error) => {
            this.setState({ selectedData: null });
          }
        );
    } else {
      this.setState({ selectedData: null, isDeptFetched: false });
      //<Checkbox onChange={this.onCBChange}>Show Contractors</Checkbox>;
    }
  };
*/
  render() {
    const treeData = this.state.departments;
    //ReactDOM.render("<div>hi</div>", document.getElementById("navChoices"));
    if (this.props.isPrintable) {
      return (
        <>
          <PrintableNew
            setData={this.setData}
            setPrintable={this.props.setPrintable}
            data={this.state.data}
            depts={deptValue}
            collapsedMap={this.state.collapsedMap}
          />
        </>
      );
    } else {
      return (
        <>
          {ReactDOM.createPortal(
            <div style={{ marginTop: "8px", marginBottom: "8px" }}>
              <Cascader
                //size="large"
                style={{ width: "800px" }}
                options={treeData}
                placeholder="Select Departments"
                changeOnSelect
                value={this.state.deptValue}
                showSearch={{ filter }}
                onChange={this.onDeptChange}
              />
            </div>,
            document.getElementById("navSelect")
          )}

          {deptLength > 0 && this.state.isDeptFetched ? (
            <Selected
              onDeptChange={this.state.onDeptChange}
              setData={this.setData}
              isDeptFetched={this.state.isDeptFetched}
              isShowContractors={this.state.isShowContractors}
              isShowVacant={this.state.isShowVacant}
              deptValue={this.state.deptValue}
              user={this.props.user}
              selectedData={this.state.selectedData}
            />
          ) : (
            <Explore
              setData={this.setData}
              data={this.state.data}
              user={this.props.user}
              isShowContractors={this.props.isShowContractors}
              isShowVacant={this.props.isShowVacant}
            />
          )}
        </>
      );
    }
  }
}
export default ChartRouter;
