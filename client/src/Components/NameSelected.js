import React from "react";
import "./Selected.css";
import {
  setLeafCollapsedMap,
  centerTheScreen,
  setImagesPhone,
  centerOnNode,
} from "./CommonFunctions";
import { Checkbox } from "antd";

const ReactDOM = require("react-dom");

var $ = require("jquery");
let ocName = null;
let localData = null;
let collapsedMap = {};
let isShowContractors,
  isShowVacant = false;

class NameSelected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
    };
    this.setData = this.setData.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
  }
  setData(data, collapsedMap) {
    this.props.setData(data, collapsedMap);
  }
  onNameChange() {
    this.props.onNameChange();
  }

  componentDidMount() {
    let accessToken = this.props.user.accessToken;
    this.$elName = $(this.elName);
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

    ocName = this.$elName.orgchart({
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
          saveState();
          //centerTheScreen();
        }, 500);
      },
    });

    let self = this;
    function saveState() {
      const deptName = self.props.nameValue.split(";");
      let centerOn = "";
      const $employee = $(".orgchart").find(".employee, .contractor");
      const options = [];
      $employee.each(function (i, e) {
        let nodeId = $(e).attr("id");
        const name = $(".orgchart")
          .find("#name" + nodeId)
          .html();
        if (name === deptName[1]) {
          centerOn = nodeId;
        }
        if (!$(e).parent().hasClass("hidden")) {
          options.push({
            label: name,
            value: nodeId,
          });
        }
      });
      if (centerOn !== "") {
        centerOnNode(centerOn);
      }

      self.setState({ names: options });
      localData = ocName.getHierarchy(true);
      setLeafCollapsedMap(collapsedMap, ocName);
      setImagesPhone(accessToken);
      self.setData(localData, collapsedMap);
    }
    ocName.$chart.on("load-children.orgchart", function (event, extraParams) {
      setTimeout(function () {
        setLeafCollapsedMap(collapsedMap, ocName);
        centerTheScreen();
        saveState();
      }, 1000);
    });
    ocName.$chart.on("show-children.orgchart", function (event, extraParams) {
      setTimeout(function () {
        setLeafCollapsedMap(collapsedMap, ocName);
        centerTheScreen();
        saveState();
      }, 500);
    });
    ocName.$chart.on("hide-children.orgchart", function (event, extraParams) {
      setTimeout(function () {
        setLeafCollapsedMap(collapsedMap, ocName);
        centerTheScreen();
        saveState();
      }, 500);
    });
    ocName.$chart.on("hide-siblings.orgchart", function (event, extraParams) {
      setTimeout(function () {
        setLeafCollapsedMap(collapsedMap, ocName);
        centerTheScreen();
        saveState();
      }, 500);
    });
    ocName.$chart.on("show-siblings.orgchart", function (event, extraParams) {
      setTimeout(function () {
        setLeafCollapsedMap(collapsedMap, ocName);
        centerTheScreen();
        saveState();
      }, 500);
    });
    ocName.$chart.on("hide-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        setLeafCollapsedMap(collapsedMap, ocName);
        centerTheScreen();
        saveState();
      }, 500);
    });
    ocName.$chart.on("show-parent.orgchart", function (event, extraParams) {
      setTimeout(function () {
        setLeafCollapsedMap(collapsedMap, ocName);
        centerTheScreen();
        saveState();
      }, 500);
    });
  }

  componentWillUnmount() {
    this.$elName.empty();
  }

  render() {
    this.elName = null;
    return (
      <>
        <div
          id="chart-container"
          ref={(elName) => (this.elName = elName)}
        ></div>
      </>
    );
  }
}
export default NameSelected;
