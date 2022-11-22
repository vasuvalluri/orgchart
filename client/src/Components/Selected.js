import React from "react";
import "./Selected.css";
import NameSearch from "./NameSearch";
import { config } from "../Config";
import {
  setLeafCollapsedMap,
  centerTheScreen,
  setImagesPhone,
  centerOnNode,
} from "./CommonFunctions";
import { Checkbox } from "antd";

const ReactDOM = require("react-dom");

const BASE_URL = config.BASE_URL;
const DEPT = "/getDepartments";
const DATA_BY_DEPT = "/getDataByDept/";
let $ = require("jquery"),
  ocSelected = null,
  localData = null,
  collapsedMap = {},
  accessToken = "";

class Selected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      names: null,
    };
    this.setData = this.setData.bind(this);
  }
  setData(data, collapsedMap, isShowContractors, isShowVacant, deptValue) {
    this.props.setData(
      data,
      collapsedMap,
      isShowContractors,
      isShowVacant,
      deptValue
    );
  }
  onNameChange = (value, option) => {
    centerOnNode(value, ocSelected);
  };

  initChart = (isShowContractors, isShowVacant) => {
    let self = this;
    let url = `${BASE_URL}${DATA_BY_DEPT}${isShowContractors}&${isShowVacant}&${this.state.deptValue}`;
    fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          ocSelected.init({ data: result });
          this.setState({
            selectedData: result,
          });
        },
        (error) => {
          this.setState({ selectedData: null });
        }
      );

    ocSelected.$chart.on(
      "show-children.orgchart",
      function (event, extraParams) {
        setTimeout(function () {
          self.setChart();
        }, 500);
      }
    );
    ocSelected.$chart.on(
      "hide-children.orgchart",
      function (event, extraParams) {
        setTimeout(function () {
          self.setChart();
        }, 500);
      }
    );
    ocSelected.$chart.on(
      "hide-siblings.orgchart",
      function (event, extraParams) {
        setTimeout(function () {
          self.setChart();
        }, 500);
      }
    );
    ocSelected.$chart.on(
      "show-siblings.orgchart",
      function (event, extraParams) {
        setTimeout(function () {
          self.setChart();
        }, 500);
      }
    );
    ocSelected.$chart.on("hide-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    ocSelected.$chart.on("show-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
  };
  setChart = () => {
    setLeafCollapsedMap(collapsedMap, ocSelected);
    centerTheScreen();
    this.saveState();
  };
  saveState = () => {
    const $employee = $(".orgchart").find(".employee, .contractor");
    const options = [];
    $employee.each(function (i, e) {
      const nodeId = $(e).attr("id");
      if (
        !$(e).parent().hasClass("hidden") &&
        !$(e).closest("ul").hasClass("hidden")
      ) {
        options.push({
          label: $(".orgchart")
            .find("#name" + nodeId)
            .html(),
          value: nodeId,
        });
      }
    });
    this.setState({ names: options });
    let localData = ocSelected.getHierarchy(true);
    setImagesPhone(accessToken);
    this.setData(
      localData,
      collapsedMap,
      this.state.isShowContractors,
      this.state.isShowVacant,
      this.state.deptValue
    );
  };
  onCBChange = (e) => {
    this.setState({ isShowContractors: e.target.checked });
    this.initChart(e.target.checked, this.state.isShowVacant);
  };
  onCBVacantChange = (e) => {
    this.setState({ isShowVacant: e.target.checked });
    this.initChart(this.state.isShowContractors, e.target.checked);
  };

  componentDidMount() {
    accessToken = this.props.user.accessToken;
    this.setState({
      isShowContractors: this.props.isShowContractors,
      isShowVacant: this.props.isShowVacant,
      deptValue: this.props.deptValue,
    });
    this.$elSelected = $(this.elSelected);
    const nodeTemplate = function (data) {
      let initials = "";
      if (data.name !== "Vacant") {
        initials = `${data.name.split(" ")[0].substring(0, 1)}${data.name
          .split(" ")[1]
          .substring(0, 1)}`;
      } else {
        initials = "  ";
      }
      const red = Math.floor(Math.random() * 255);
      const green = Math.floor(Math.random() * 255);
      const blue = Math.floor(Math.random() * 255);

      return `       
        <div class="title"><div><span id="name${data.id}">${data.name}</span>
        <span id="image${data.id}"><div class="imgcircle" style="background:rgba(${red},${green},${blue},.6)" data-initials="${initials}"></div></span>
        </div>
        <div>${data.title}</div></div>
        <div class="content">
          <table><tr><td style="width:90%">
            <div>${data.deptname}</div>
            <div><img src="/multi.png" style="width:20px;height=20px"/>Total E (${data.employeeCount}) includes ${data.vacantCount} (V), Total C (${data.contractorCount})</div> 
            <div><img src="/single.png" style="width:20px;height=20px"/> Directs E (${data.employee_count}) includes ${data.vacant_count} (V), Direct C (${data.contractor_count})</span></div> 
            <td style="width:10%;text-align:right">
            </td></tr></table>                    
        </div>
      `;
    };
    let self = this;

    ocSelected = this.$elSelected.orgchart({
      data: this.props.selectedData,
      // ajaxURL: ajaxURLs,
      nodeContent: "title",
      nodeId: "id",
      nodeTemplate: nodeTemplate,
      pan: true,
      zoom: true,
      zoominLimit: 2,
      zoomoutLimit: 0.5,
      //draggable: true,
      toggleSiblingsResp: true,
      createNode: function ($node, data) {
        $node.on("click", function (event) {
          if (
            !$(event.target).is(".edge, .toggleBtn") &&
            !$(event.target).is(".second-menu-icon")
          ) {
            var $this = $(this);
            var $chart = $this.closest(".orgchart");
            var newX = window.parseInt(
              $chart.outerWidth(true) / 2 -
                ($this.offset().left - $chart.offset().left) -
                $this.outerWidth(true) / 2
            );
            var newY = window.parseInt(
              $chart.outerHeight(true) / 2 -
                ($this.offset().top - $chart.offset().top) -
                $this.outerHeight(true) / 2
            );
            $chart.css(
              "transform",
              "matrix(1, 0, 0, 1, " + newX + ", " + (newY - 100) + ")"
            );
          }
        });
        var secondMenuIcon = $("<i>", {
          class: "oci oci-info-circle second-menu-icon",
          click: function () {
            $(this).siblings(".second-menu").toggle();
          },
        });
        var secondMenu =
          '<div class="second-menu">Email: <span id="email' +
          data.id +
          '"></span><br/>Desk Phone: <span id="deskPhone' +
          data.id +
          '"></span><br/>Mobile Phone: <span id="mobilePhone' +
          data.id +
          '"</span></div>';
        $node.append(secondMenuIcon).append(secondMenu);
      },
      initCompleted: function () {
        setTimeout(function () {
          self.setChart();
        }, 500);
      },
    });

    ocSelected.$chart.on(
      "show-children.orgchart",
      function (event, extraParams) {
        setTimeout(function () {
          self.setChart();
        }, 500);
      }
    );
    ocSelected.$chart.on(
      "hide-children.orgchart",
      function (event, extraParams) {
        setTimeout(function () {
          self.setChart();
        }, 500);
      }
    );
    ocSelected.$chart.on(
      "hide-siblings.orgchart",
      function (event, extraParams) {
        setTimeout(function () {
          self.setChart();
        }, 500);
      }
    );
    ocSelected.$chart.on(
      "show-siblings.orgchart",
      function (event, extraParams) {
        setTimeout(function () {
          self.setChart();
        }, 1000);
      }
    );
    ocSelected.$chart.on("hide-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    ocSelected.$chart.on("show-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
  }

  componentWillUnmount() {
    this.$elSelected.empty();
  }

  render() {
    this.elSelected = null;
    return (
      <>
        {ReactDOM.createPortal(
          <div style={{ marginTop: "8px", marginBottom: "8px" }}>
            <NameSearch
              names={this.state.names}
              onNameChange={(value, option) => this.onNameChange}
            />
          </div>,
          document.getElementById("navNameSelect")
        )}
        {ReactDOM.createPortal(
          <div style={{ marginTop: "8px", marginBottom: "8px" }}>
            <Checkbox
              onChange={this.onCBChange}
              checked={this.props.isShowContractors}
            >
              Show Contractors
            </Checkbox>
            <Checkbox
              onChange={this.onCBVacantChange}
              checked={this.props.isShowVacant}
            >
              Show Vacant
            </Checkbox>
          </div>,
          document.getElementById("navContractor")
        )}
        <div
          id="chart-container"
          ref={(elSelected) => (this.elSelected = elSelected)}
        ></div>
      </>
    );
  }
}
export default Selected;
