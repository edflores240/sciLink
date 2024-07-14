import { Router } from "express";
import axios from "axios";
import { withOrganizationUser } from "../utils/userInfo.js";

const createLocationRoutes = (isAuthenticated) => {
  console.log("lr1     ");
  const router = Router();
  const API_URL = process.env.API_URL;

  router.get("/", isAuthenticated, async (req, res) => {

    try {
      const data = await axios.get(`${API_URL}/users/userInfo/${req.user.id}`);

      if(data.data[0] == undefined ) {
          return res.redirect('/profile?status=noOrganization');
      }

      
      if(data.data[0].org_id == undefined || data.data[0].org_id == null ) {
         return res.redirect('/profile?status=noOrganization');
      }

      const org_id = data.data[0].org_id;

      // console.log("lr2 USER DATA ", userData);



      const locationResponse = await axios.get(`${API_URL}/location/byOrg/${org_id}`);
      const location = locationResponse.data; // Extract the data from the Axios response
    
      res.render("user/location/locationManager.ejs", {
        user: data.data[0],
        location: location,
   
        messages: req.flash("messages"),
        title: "Location Manager",
      });
    } catch (error) {
      handleError(error, req, res);
      res.redirect("/profile?status=noOrganization");
    }
  });

  router.post("/delete", isAuthenticated, async (req, res) => {
    console.log("lrd1     ");
    const { locationId } = req.body;

    try {
      await axios.post(`${API_URL}/deletelocation/`, { locationId });
      res.redirect("/locationManager");
    } catch (error) {
      handleError(error, req, res);
      res.status(500).json({ success: false, error: "Error deleting location" });
    }
  });

  router.post("/edit/:id", isAuthenticated, async (req, res) => {
    console.log("lre1     ");
    const locationId = req.params.id;
    const { locationName, locationRole, location_id } = req.body;

    const location_role = locationRole != "" ? locationRole : null;

    try {
      await axios.put(`${API_URL}/editlocation/${locationId}`, {
        locationName,
        location_role,
        location_id,
      });

      res.redirect("/locationManager");
    } catch (error) {
      handleError(error, req, res);
      res.status(500).json({ success: false, error: "Error updating location" });
    }
  });

  router.post("/add", isAuthenticated, async (req, res) => {
    console.log("lra1     ");
 

    const userData = await withOrganizationUser(req, res);
    const org_id = userData.org_id;

    const { locationName, locationRole, location_id } = req.body;

    const location_role = locationRole != "" ? locationRole : null;

    try {
      await axios.put(`${API_URL}/addlocation`, {
        locationName,
        location_role,
        location_id,
        org_id
      });

      res.redirect("/locationManager");
    } catch (error) {
      handleError(error, req, res);
      res.status(500).json({ success: false, error: error });
    }
  });

  return router;
};

export default createLocationRoutes;
