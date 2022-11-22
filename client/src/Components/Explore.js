import React from "react";
import "./explore.css";
import NameSearch from "./NameSearch";
import {
  setLeafCollapsedMap,
  centerTheScreen,
  setImagesPhone,
  centerOnNode,
} from "./CommonFunctions";
import { config } from "../Config";
import { Checkbox } from "antd";

const ReactDOM = require("react-dom");

const BASE_URL = config.BASE_URL;
const LEVEL1 = "/getLevel1/";
let CHILDREN = "/getChildren/";
const TEMP_CHILDREN = "/getChildren/";
//const PARENT = "/parent/";
//const SIBLINGS = "/siblings/";
//const FAMILIES = "/families/";
let localData = null,
  $ = require("jquery"),
  oc = null,
  chartData = null,
  collapsedMap = {},
  accessToken = "";
class Explore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      names: null,
      isShowContractors: false,
      isShowVacant: false,
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

  initChart = (url, childrenUrl) => {
    oc.opts.ajaxURL.children = childrenUrl;
    oc.init({ data: url });
    let self = this;
    oc.$chart.on("load-children.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("show-children.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("hide-children.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("hide-siblings.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("show-siblings.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("hide-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("show-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
  };
  onCBChange = (e) => {
    this.setState({ isShowContractors: e.target.checked });
    const url = `${BASE_URL}${LEVEL1}${e.target.checked}&${this.state.isShowVacant}`;
    const childrenUrl = `${BASE_URL}${CHILDREN}${e.target.checked}&${this.state.isShowVacant}&`;
    this.initChart(url, childrenUrl);
  };
  onNameChange = (value, option) => {
    centerOnNode(value);
  };
  onCBVacantChange = (e) => {
    this.setState({ isShowVacant: e.target.checked });
    const url = `${BASE_URL}${LEVEL1}${this.state.isShowContractors}&${e.target.checked}`;
    const childrenUrl = `${BASE_URL}${CHILDREN}${this.state.isShowContractors}&${e.target.checked}&`;
    this.initChart(url, childrenUrl);
  };
  setChart = () => {
    setLeafCollapsedMap(collapsedMap, oc);
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
    let localData = oc.getHierarchy(true);
    setImagesPhone(accessToken);
    this.setData(
      localData,
      collapsedMap,
      this.state.isShowContractors,
      this.state.isShowVacant,
      ""
    );
  };

  componentDidMount() {
    accessToken = this.props.user.accessToken;
    this.$el = $(this.el);

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

    const ajaxURLs = {
      children: `${BASE_URL}${CHILDREN}${this.state.isShowContractors}&${this.state.isShowVacant}&`,
      //parent: `${BASE_URL}${PARENT}`,
      // 'siblings': function(nodeData) {
      //   return `${BASE_URL}${SIBLINGS}` + nodeData.id;
      // },
      //'families': function(nodeData) {
      //  return `${BASE_URL}${FAMILIES}` + nodeData.id;
      //}
    };
    const url = `${BASE_URL}${LEVEL1}${this.state.isShowContractors}&${this.state.isShowVacant}`;
    oc = this.$el.orgchart({
      data: url,
      ajaxURL: ajaxURLs,
      nodeContent: "title",
      nodeId: "id",
      zoominLimit: 1.5,
      zoomoutLimit: 0.5,
      //draggable: true,
      toggleSiblingsResp: true,
      nodeTemplate: nodeTemplate,
      pan: true,
      zoom: true,
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

    oc.$chart.on("load-children.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("show-children.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("hide-children.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("hide-siblings.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("show-siblings.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 1000);
    });
    oc.$chart.on("hide-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    oc.$chart.on("show-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        self.setChart();
      }, 500);
    });
    //function saveState() {}
  }
  componentWillUnmount() {
    this.$el.empty();
  }

  render() {
    $(".metroLogo").remove();
    $(".metroLogoHeader").remove();
    this.el = null;
    //CHILDREN = TEMP_CHILDREN + this.state.isShowContractors + "&";
    if (oc) {
      // oc.opts.ajaxURL.children = `${BASE_URL}${CHILDREN}`;
    }
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
              checked={this.state.isShowContractors}
            >
              Show Contractors
            </Checkbox>
            <Checkbox
              onChange={this.onCBVacantChange}
              checked={this.state.isShowVacant}
            >
              Show Vacant
            </Checkbox>
          </div>,
          document.getElementById("navContractor")
        )}

        <div id="chart-container" ref={(el) => (this.el = el)}></div>
      </>
    );
  }
}
export default Explore;
