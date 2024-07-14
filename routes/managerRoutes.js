import { Router } from "express";
import axios from "axios";
import axiosRetry from 'axios-retry';
import handleError from "../utils/handleError.js"; // Import the handleError function

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const createManagerRoutes = (isAuthenticated) => {
  const router = Router();
  const API_URL = process.env.API_URL;

  // Set a timeout for all axios requests
  const axiosInstance = axios.create({
    timeout: 5000, // 5 seconds timeout
  });

  router.get("/pending", isAuthenticated, async (req, res) => {
    try {
      const data = await axios.get(`${API_URL}/timesheet/pending/${req.user.id}`);
      const timesheetIssues = await axios.get(`${API_URL}/timesheet/getAllIssues`);
      const userInfo = req.session.userInfo;

      const status = req.query.status;
      let statusMessage = "";

      if (status == 202) {
        statusMessage = "Update Successfully!"
      } else if (status == 500) {
        statusMessage = "Something went wrong. Try Again!"
      }

      res.render("user/manager/pendingTimeSheets.ejs", {
        user: req.user,
        data: data.data,
        timesheetIssues: timesheetIssues.data,
        userInfo: userInfo,
        messages: req.flash(""),
        statusMessage: statusMessage,
        title: "Pending Timesheets",
      });
    } catch (error) {
      handleError(error, req, res);
    }
  });

  router.get("/approved", isAuthenticated, async (req, res) => {
    try {
      const data = await axios.get(`${API_URL}/timesheet/approved/${req.user.id}`);
      const userInfo = req.session.userInfo;

      const status = req.query.status;
      let statusMessage = "";

      if (status == 202) {
        statusMessage = "Update Successfully!"
      } else if (status == 500) {
        statusMessage = "Something went wrong. Try Again!"
      }

      res.render("user/manager/approvedTimeSheets.ejs", {
        user: req.user,
        data: data.data,
        userInfo: userInfo,
        statusMessage: statusMessage,
        messages: req.flash(""),
        title: "Approved Timesheets",
      });
    } catch (error) {
      handleError(error, req, res);
    }
  });

  // Add try and catch blocks with handleError for the remaining routes as needed

  return router;
};

export default createManagerRoutes
