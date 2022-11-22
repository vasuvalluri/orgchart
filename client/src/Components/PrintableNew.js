import React from "react";
import "./printable.css";
import * as html2canvas from "html2canvas";
import * as htmlToImage from "html-to-image";
import { toPng, toSvg } from "html-to-image";

import * as jspdf from "jspdf";
var $ = require("jquery");
let chartData = "";
let str =
  "Position Number, Name, Title,Department Name, Department Id, Reports To,Contractor Count, Employee Count, Vacant Count,Total Employee Count, Total Contractor Count, Total Vacant Count";

class PrintableNew extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      ...this.state,
    };
  }

  componentDidMount() {
    //this.props.setPrintable(false);
    this.$elPrintable = $(this.elPrintable);
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
    window.html2canvas = html2canvas;
    window.html2Image = htmlToImage;
    window.jspdf = jspdf;

    let self = this;

    var traverse = function (o, fn) {
      for (var i in o) {
        if (i === "id") {
          fn.apply(this, [i, o[i]]);
        }
        if (o[i] !== null && typeof o[i] == "object") {
          traverse(o[i], fn);
        }
      }
    };

    function findNode(id) {
      var $chart = $(".orgchart");
      $chart.addClass("noncollapsable");
      let foundNode = null;
      $chart.find(".node").filter(function (index, node) {
        if ($(node).attr("id") === id) foundNode = $(node);
      });
      return foundNode;
    }
    function findNode(id) {
      var $chart = $(".orgchart");
      $chart.addClass("noncollapsable");
      let foundNode = null;
      $chart.find(".node").filter(function (index, node) {
        if ($(node).attr("id") === id) foundNode = $(node);
      });
      //$chart.removeClass("noncollapsable");
      return foundNode;
    }
    function setOrgChart() {
      for (var i in self.props.collapsedMap) {
        if (self.props.collapsedMap[i].includes("hidden")) {
          try {
            ocPrintable.removeNodes(findNode(i));
          } catch {}
        }
      }
      var nodeArray = [];
      var $leaf = $(".orgchart").find(".leaf");
      $leaf.each(function (i, e) {
        const nodeId = $(e).attr("id");
        const $siblings = ocPrintable.getRelatedNodes(
          findNode(nodeId),
          "siblings"
        );
        let leafLength = 0;
        $siblings.each(function (i, e) {
          if ($(e).hasClass("leaf")) {
            leafLength += 1;
          }
        });

        if ($siblings.length === leafLength) {
          let $parentUL = $(e).parents("ul:first");
          if (!$parentUL.find("ul").length) {
            if (!$parentUL.hasClass("leaf")) {
              $parentUL.addClass("leaf");
            }
          }
        }
        if ($siblings.length > 50) {
          let $parentUL = $(e).parents("ul:first");
          //if (!$parentUL.hasClass("leaf")) {
          //  $parentUL.addClass("leaf");
          //}
          if ($(e).find("ul.leaf").length !== 0) {
            //console.log('found');
          } else {
            var $temp = $(e).find("li.hierarchy");
            nodeArray.push($temp);
          }
        }
      });
      nodeArray.forEach(function (i, e) {
        $(e).remove();
        //console.log(e);
      });
      let $chart = $(".orgchart");
      $chart.prepend(
        '<div class="metroLogo"><img alt="Metro Logo" src="/wmata_logo.png" width="60" height="78" /></div><div class="metroLogoHeader"><h4>Metro Organization Chart</h4></div>'
      );

      let $chartContainer = $("#printable-chart-container");
      let $exportExcelBtn = $("<button>", {
        class: "oc-export-btn",
        text: "Save as Excel",
        click: function (e) {
          e.preventDefault();
          exportToExcel();
        },
      });
      let $exporttoPNGBtn = $("<button>", {
        class: "oc-export-btn",
        text: "Save as PNG",
        click: function (e) {
          e.preventDefault();
          exportToPNG();
        },
      });
      let $exporttoSVGBtn = $("<button>", {
        class: "oc-export-btn",
        text: "Save as SVG",
        click: function (e) {
          e.preventDefault();
          exportToSVG();
        },
      });
      $chartContainer.after($exportExcelBtn);
      $chartContainer.after($exporttoPNGBtn);
      $chartContainer.after($exporttoSVGBtn);
      $(".orgchart").css("transform", "");
    }
    function exportToExcel() {
      const fileData = ConvertToCSV([chartData]); //JSON.stringify(chartData);
      str =
        "Position Number, Name, Title,Department Name, Department Id, Reports To,Contractor Count, Employee Count, Vacant Count,Total Employee Count, Total Contractor Count, Total Vacant Count";
      const blob = new Blob([fileData], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `OrgChartData.csv`;
      link.href = url;
      link.click();
    }
    function ConvertToCSV(objArray) {
      var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
      for (var i = 0; i < array.length; i++) {
        var line = "";
        for (var index in array[i]) {
          if (
            line !== "" &&
            index !== "level" &&
            index !== "parentId" &&
            index !== "relationship" &&
            index !== "className"
          )
            line += ",";
          if (typeof array[i][index] != "object") {
            if (
              index !== "level" &&
              index !== "parentId" &&
              index !== "relationship" &&
              index !== "className"
            ) {
              if (index === "id" || index === "parentid") {
                line += '="' + String(array[i][index]).padStart(6, "0") + '"';
              } else {
                line += '"' + array[i][index] + '"';
              }
            }
          } else {
            ConvertToCSV([array[i][index]]);
          }
        }
        str += line + "\r\n";
        // console.log("line", str);
      }

      return str;
    }
    function exportToPNG() {
      let $chartContainer = $("#printable-chart-container");
      var node = document.getElementsByClassName("orgchart");
      //var sourceChart = $chartContainer.addClass('canvasContainer').find('.orgchart:not(".hidden")').get(0);
      var sourceChart = $(".orgchart ul").first().get(0);
      //console.log(sourceChart);
      if (node === null) {
        //console.log('returning');
        return;
      }
      toPng(sourceChart, {
        cacheBust: false,
        pixelRatio: 1,
        skipAutoScale: false,
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "OrgChart.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.log(err);
        });
    }

    function exportToSVG() {
      let $chartContainer = $("#printable-chart-container");
      var node = document.getElementsByClassName("orgchart");
      //var sourceChart = $chartContainer.addClass('canvasContainer').find('.orgchart:not(".hidden")').get(0);
      var sourceChart = $(".orgchart ul").first().get(0);
      //console.log(sourceChart);
      if (node === null) {
        //console.log('returning');
        return;
      }
      toSvg(sourceChart, {
        cacheBust: false,
        pixelRatio: 1,
        skipAutoScale: false,
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "OrgChart.svg";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.log(err);
        });
    }

    function filter(node) {
      return node.tagName !== "i";
    }
    function exportToSVG() {
      let $chartContainer = $("#printable-chart-container");
      var node = document.getElementsByClassName("orgchart");
      //var sourceChart = $chartContainer.addClass('canvasContainer').find('.orgchart:not(".hidden")').get(0);
      var sourceChart = $(".orgchart ul").first().get(0);

      if (node === null) {
        //console.log('returning');
        return;
      }
      toSvg(sourceChart, {
        cacheBust: true,
        pixelRatio: 1,
        skipAutoScale: false,
        filter: filter,
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "OrgChart.svg";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.log(err);
        });
    }
    var ocPrintable = this.$elPrintable.orgchart({
      data: this.props.data,
      nodeContent: "title",
      nodeId: "id",
      //pan: true,
      nodeTemplate: nodeTemplate,
    });
    setTimeout(function () {
      setOrgChart();
    }, 500);
  }

  componentWillUnmount() {
    this.$elPrintable.empty();
    this.props.setPrintable(false);
  }

  render() {
    this.elPrintable = null;
    chartData = this.props.data;
    return (
      <>
        <div
          id="printable-chart-container"
          ref={(elPrintable) => (this.elPrintable = elPrintable)}
        ></div>
      </>
    );
  }
}

export default PrintableNew;
