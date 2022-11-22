import React from "react";
import "./ContactCard.css";
import { config } from "../Config";
import { getPhoneEmail } from "../GraphService";

const BASE_URL = config.BASE_URL;
const IMAGE_URL = config.IMAGE_URL;

const LEVEL1 = "/getContactCard/";
let $ = require("jquery");
let oc = null;

class ContactCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
    };
  }
  componentDidMount() {
    let accessToken = this.props.user.accessToken;
    this.$el = $(this.el);
    //  <img class="imgcircle" id="image${data.id}" src="http://localhost:3000/SreenivasaValluri.jpeg"></img>

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
    const dataUrl = `${BASE_URL}${LEVEL1}${this.props.user.givenName}&${this.props.user.surname}`;
    oc = this.$el.orgchart({
      data: dataUrl,
      nodeContent: "title",
      nodeId: "id",
      zoominLimit: 1.5,
      zoomoutLimit: 0.5,
      draggable: true,
      toggleSiblingsResp: true,
      nodeTemplate: nodeTemplate,
      createNode: function ($node, data) {
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
        }, 500);
      },
    });
    function imageExists(url, callback) {
      var img = new Image();
      img.onload = function () {
        callback(true);
      };
      img.onerror = function () {
        callback(false);
      };
      img.src = url;
    }
    function saveState() {
      let $employee = $(".orgchart").find(".employee, .contractor");
      let names = {};
      $employee.each(function (i, e) {
        const nodeId = $(e).attr("id");
        names[nodeId] = $(".orgchart")
          .find("#name" + nodeId)
          .html();
        const image_url = `${IMAGE_URL}${names[nodeId].replace(" ", "")}.jpeg`;
        imageExists(image_url, function (exists) {
          if (exists) {
            const imgHTML = `<img class="imgcircle"  src="${image_url}"></img>`;
            $(".orgchart")
              .find("#image" + nodeId)
              .html(imgHTML);
          }
        });
      });
      getPhoneEmail(accessToken, names).then((results) => {
        $employee.each(function (i, e) {
          const nodeId = $(e).attr("id");
          if (results[nodeId] !== undefined) {
            if (results[nodeId].mail === null) {
              $(".orgchart")
                .find("#email" + nodeId)
                .html("N/A");
            } else {
              $(".orgchart")
                .find("#email" + nodeId)
                .html(results[nodeId].mail);
            }

            if (results[nodeId].businessPhones[0] === null) {
              $(".orgchart")
                .find("#deskPhone" + nodeId)
                .html("N/A");
            } else {
              $(".orgchart")
                .find("#deskPhone" + nodeId)
                .html(results[nodeId].businessPhones[0]);
            }

            if (results[nodeId].mobilePhone === null) {
              $(".orgchart")
                .find("#mobilePhone" + nodeId)
                .html("N/A");
            } else {
              $(".orgchart")
                .find("#mobilePhone" + nodeId)
                .html(results[nodeId].mobilePhone);
            }
          } else {
            $(".orgchart")
              .find("#email" + nodeId)
              .html("N/A");
            $(".orgchart")
              .find("#deskPhone" + nodeId)
              .html("N/A");
            $(".orgchart")
              .find("#mobilePhone" + nodeId)
              .html("N/A");
          }
        });
      });
    }
  }

  componentWillUnmount() {
    this.$el.empty();
  }

  render() {
    this.el = null;
    if (oc) {
      const dataUrl = `${BASE_URL}${LEVEL1}${this.props.user.givenName}&${this.props.user.surname}`;
      oc.init({ data: dataUrl });
    }
    return (
      <>
        <div id="card-chart-container" ref={(el) => (this.el = el)}></div>
      </>
    );
  }
}
export default ContactCard;
