import { Router } from "express";
import axios from "axios";
import handleError from "../utils/handleError.js";

const createActivityRoutes = (isAuthenticated) => {  
  const router = Router();
  const API_URL = process.env.API_URL;

  // Get all activities
  router.get("/", isAuthenticated, async (req, res) => {
    console.log("ra1     ")
    try {
      const data = await axios.get(`${API_URL}/users/userInfo/${req.user.id}`);

      if(data.data[0] == undefined ) {
          return res.redirect('/profile?status=noOrganization');
      }

      
      if(data.data[0].org_id == undefined || data.data[0].org_id == null ) {
         return res.redirect('/profile?status=noOrganization');
      }


      const response = await axios.put(`${API_URL}/activities/${data.data[0].org_id}`);
      // res.json(response.data);

      res.render("user/activity/activityManager.ejs", {
        user: req.user,
        activities: response.data,
        messages: req.flash("messages"),
        title: "Activity Manager",
      });
    } catch (error) {
      handleError(error, req, res);
      res.status(500).json({ error: error });
    }
  });

  // Get activity by ID
  router.get("/:id", isAuthenticated, async (req, res) => {
    console.log("rag1     ")

    const { id } = req.params;
    
    try {
      const data = await axios.get(`${API_URL}/users/userInfo/${id}`);

      if(data.data[0] == undefined ) {
          return res.redirect('/profile?status=noOrganization');
      }

      
      if(data.data[0].org_id == undefined || data.data[0].org_id == null ) {
         return res.redirect('/profile?status=noOrganization');
      }

      console.log("")

      const response = await axios.put(`${API_URL}/activities/${data.data[0].org_id}`);
      // res.json(response.data);

      console.table(response.data);

      res.render("user/activity/activityManager.ejs", {
        user: req.user,
        activities: response.data,
        messages: req.flash("messages"),
        title: "Activity Manager",
      });
    } catch (error) {
      handleError(error, req, res);
      res.status(500).json({ error: error });
    }
  });

  // Create a new activity
  router.post("/create", isAuthenticated, async (req, res) => {
    console.log("rac1     ")

    try {
      const data = await axios.get(`${API_URL}/users/userInfo/${req.user.id}`);

      if(data.data[0] == undefined ) {
          return res.redirect('/profile?status=noOrganization');
      }

      
      if(data.data[0].org_id == undefined || data.data[0].org_id == null ) {
         return res.redirect('/profile?status=noOrganization');
      }

      const { name, programs, percentages, status} = req.body;
      const user_id = req.user.id;
      const org_id = data.data[0].org_id;
      console.log("user ID: " + user_id);
      
      await axios.put(`${API_URL}/createActivity`, {
        name,
        programs,
        percentages,
        status,
        user_id,
        org_id
      });
      // res.json({ message: "Activity created successfully" });
      res.redirect("/activity/" + user_id);
      
    } catch (error) {
      handleError(error, req, res);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete an activity
  router.post("/delete", isAuthenticated, async (req, res) => {
    console.log("rad1     ")
    const id = req.body.id;
    console.log("The ID:" + id)
    try {
      await axios.post(`${API_URL}/deleteActivity`, { id });
      res.redirect("/activity/"+ req.user.id)
    } catch (error) {
      handleError(error, req, res);
      res.status(500).json({ error: error.message });
    }
  });

  // Edit an activity
  router.post("/edit", isAuthenticated, async (req, res) => {
    console.log("rae1     ")
    
    const { name, programs, percentages, status, id} = req.body;
    const user_id = req.user.id;

    try {
      await axios.put(`${API_URL}/updateActivity/${id}`, {
        name,
        programs,
        percentages,
        status,
        user_id,
      });
      res.redirect("/activity/" + user_id);
    } catch (error) {
      handleError(error, req, res);
      res.status(500).json({ error: error });
    }
  });

  return router;
};

export default createActivityRoutes;
