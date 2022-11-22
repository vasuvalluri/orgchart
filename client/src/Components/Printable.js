import React from "react";
import "./printable.css";
import * as html2canvas from "html2canvas";
import * as htmlToImage from 'html-to-image';
import { toPng, toSvg } from 'html-to-image';

import * as jspdf from "jspdf";
var $ = require("jquery");
let chartData = "";
let str =
  "Position Number, Name, Title,Department Name, Department Id, Reports To,Contractor Count, Employee Count, Vacant Count,Total Employee Count, Total Contractor Count, Total Vacant Count";

class Printable extends React.Component {
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
    let nodeTemplate = function (data) {
      return `        
        <div class="title">${data.name}-${data.deptid}</div>
        <div class="content">${data.title}</div>
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
          } catch { }
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
          if ($(e).find('ul.leaf').length !== 0) {
            //console.log('found');
          } else {
            var $temp = $(e).find('li.hierarchy');
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
        text: "Save as PNG New",
        click: function (e) {
          e.preventDefault();
          //exportToPNG();
          exportToSVG();

        },
      });

      $chartContainer.after($exportExcelBtn);
      $chartContainer.after($exporttoPNGBtn);
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
      var node = document.getElementsByClassName('orgchart');
      //var sourceChart = $chartContainer.addClass('canvasContainer').find('.orgchart:not(".hidden")').get(0);
      var sourceChart = $chartContainer.find('ul').first();
      if (node === null) {
        //console.log('returning');
        return
      }
      toPng(sourceChart, { cacheBust: true, pixelRatio: 1, skipAutoScale: false })
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = 'ITADM.png'
          link.href = dataUrl
          link.click()
        })
        .catch((err) => {
          console.log(err)
        })
    }
    function filter(node) {
      return (node.tagName !== 'i');
    }
    function exportToSVG() {
      let $chartContainer = $("#printable-chart-container");
      var node = document.getElementsByClassName('orgchart');
      var sourceChart = $chartContainer.addClass('canvasContainer').find('.orgchart:not(".hidden")').get(0);
      if (node === null) {
        //console.log('returning');
        return
      }
      toSvg(sourceChart, { cacheBust: true, pixelRatio: 1, skipAutoScale: false, filter: filter })
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = 'OrgChart.png'
          link.href = dataUrl
          link.click()
        })
        .catch((err) => {
          console.log(err)
        })
    }
    var ocPrintable = this.$elPrintable.orgchart({
      data: this.props.data,
      nodeContent: "title",
      nodeId: "id",
      //pan: true,
      nodeTemplate: nodeTemplate,
      exportButton: true,
      exportButtonName: "Save as PNG",
      exportFilename: "OrgChart",
      exportFileextension: "png",
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

export default Printable;
