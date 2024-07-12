import { Router } from "express";
import axios from "axios";
import handleError from "../utils/handleError.js";

const createFundSourceRoutes = (isAuthenticated) => {
  const router = Router();
  const API_URL = process.env.API_URL;

  // Get all fund sources
  router.get("/", isAuthenticated, async (req, res) => {
    console.log("rfs1     ")
    try {
      const fundSources = await axios.get(`${API_URL}/fundSource`);
      // console.log(fundSources.data)
      res.render("user/fundSources/fundSourcesManagement.ejs", {
        user: req.user,
        data: fundSources.data,
        messages: req.flash("messages"),
        title: "Fund Source Manager",
      });
    } catch (error) {
      handleError(error, req, res);
    }
  });

  // Create a new fund source
  router.post("/create", isAuthenticated, async (req, res) => {
    console.log("rfc1     ")
    try {
      const { fund_source_num, fund_source_name } = req.body;
      await axios.post(`${API_URL}/fundSource/create`, { fund_source_num, fund_source_name });
      res.redirect("/fundSource");
    } catch (error) {
      handleError(error, req, res);
    }
  });

  // Update an existing fund sources
  router.post("/update", isAuthenticated, async (req, res) => {
    console.log("rfu1     ")
    try {
      const { id, fund_source_num, fund_source_name } = req.body;
      await axios.post(`${API_URL}/fundSource/update`, { id, fund_source_num, fund_source_name });
      res.redirect("/fundSource");
    } catch (error) {
      handleError(error, req, res);
    }
  });

  // Delete a fund source
  router.post("/delete", isAuthenticated, async (req, res) => {
    console.log("rfd1     ")
    try {
      const { id } = req.body;
      await axios.post(`${API_URL}/fundSource/delete`, { id });
      res.redirect("/fundSource");
    } catch (error) {
      handleError(error, req, res);
    }
  });

  return router;
};

export default createFundSourceRoutes;
