const express = require("express");
const router = new express.Router();
const getChildren = require("../controllers/getChildren.js");
router
  .route("/getChildren/:isShowContractors?&:isShowVacant?&:id?")
  .get(getChildren.get);

const getContactCard = require("../controllers/getContactCard.js");
router.route("/getContactCard/:givenName?&:surname?").get(getContactCard.get);

const getDataByDept = require("../controllers/getDataByDept.js");
router
  .route("/getDataByDept/:isShowContractors?&:isShowVacant?&:depts?")
  .get(getDataByDept.get);

const getDataByName = require("../controllers/getDataByName.js");
router.route("/getDataByName/:name?").get(getDataByName.get);

const getDepartments = require("../controllers/getDepartments.js");
router.route("/getDepartments").get(getDepartments.get);

const getLevel1 = require("../controllers/getLevel1.js");
router
  .route("/getLevel1/:isShowContractors?&:isShowVacant?")
  .get(getLevel1.get);

const getNames = require("../controllers/getNames.js");
router.route("/getNames/:name?").get(getNames.get);

const generateFiles = require("../controllers/generateFiles.js");
router.route("/generateFiles").get(generateFiles.get);

const saveFeedback = require("../controllers/saveFeedback.js");
router.route("/saveFeedback").post(saveFeedback.post);
const saveLogin = require("../controllers/saveLogin.js");
router.route("/saveLogin").post(saveLogin.post);
module.exports = router;
