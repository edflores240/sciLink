import { Router } from "express";
import axios from "axios";
import bcrypt from "bcrypt";
import handleError from "../utils/handleError.js";

const createProfileRoutes = (isAuthenticated) => {
  const router = Router();
  const API_URL = process.env.API_URL;

  router.post("/update", isAuthenticated, async (req, res) => {
    const { firstName, lastName, email, username, newPassword, confirmPassword, managerID } = req.body;
    const userId = req.user.id;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password must match' });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await axios.post(`${API_URL}/users/update`, { firstName, lastName, email, username, password: hashedPassword, userId, managerID });
      res.redirect("/profile");
    } catch (error) {
      handleError(error, req, res);
    }
  });

  router.get("/edit", isAuthenticated, async (req, res) => {
    try {
      const data = await axios.get(`${API_URL}/users/userInfo/${req.user.id}`);
      const userSchedule = await axios.get(`${API_URL}/userSchedule/${req.user.id}`);
      const userInfo = req.session.userInfo;
      const password = 123;

      res.render("editProfile.ejs", {
        user: req.user,
        password: password,
        userSchedule: userSchedule.data,
        userData: data.data[0],
        userInfo: userInfo,
        messages: req.flash(""),
        title: "Edit Profile",
      });
    } catch (error) {
      handleError(error, req, res);
    }
  });

  router.get("/check", isAuthenticated, (req, res) => {
    try {
      res.redirect("/profile");
    } catch (error) {
      handleError(error, req, res);
    }
  });

  router.post("/check", isAuthenticated, async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const checkUser = await checkUserExists(email, password);
      const data = await axios.get(`${API_URL}/users/userInfo/${req.user.id}`);

      if (!data.data[0]?.org_id) {
        return res.redirect('/profile?status=noOrganization');
      }

      const userSchedule = await axios.get(`${API_URL}/userSchedule/${req.user.id}`);
      const userInfo = req.session.userInfo;
      const myManager = await axios.get(`${API_URL}/users/getMyManager/${req.user.id}`);
      const managers = await axios.get(`${API_URL}/users/getManager/${data.data[0].org_id}`);

      if (checkUser) {
        res.render("editProfile.ejs", {
          user: req.user,
          myManager: myManager.data[0],
          managers: managers.data,
          userSchedule: userSchedule.data,
          userData: data.data[0],
          userInfo: userInfo,
          messages: req.flash(""),
          title: "Edit Profile",
        });
      } else {
        res.redirect("/profile?status=404");
      }
    } catch (error) {
      handleError(error, req, res);
    }
  });

  const checkUserExists = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/users/check`, { email, password });
      return response.data.exists;
    } catch (error) {
      throw error;
    }
  };

  const getPayPeriods = (startDate, endDate, scheduleDays) => {
    const allDateSchedules = [];
    const payPeriods = [];
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    if (startDate < startOfYear) {
      startDate = startOfYear;
    }

    if (endDate > endOfYear) {
      endDate = endOfYear;
    }

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (scheduleDays.includes(getDayOfWeekName(dayOfWeek))) {
        allDateSchedules.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let i = allDateSchedules.length - 1;
    let payDayIndex = scheduleDays.length;

    while (i > 1) {
      if (i > scheduleDays.length - 1) {
        payPeriods.push(allDateSchedules[payDayIndex]);
        payDayIndex += scheduleDays.length;
        i -= scheduleDays.length;
      } else {
        payPeriods.push(allDateSchedules[allDateSchedules.length - 1]);
        i = 0;
      }
    }

    return payPeriods;
  };

  const getDayOfWeekName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  router.get("/", isAuthenticated, async (req, res) => {
    try {
      const data = await axios.get(`${API_URL}/users/userInfo/${req.user.id}`);
      const userScheduleResponse = await axios.get(`${API_URL}/userSchedule/${req.user.id}`);
      const myManager = await axios.get(`${API_URL}/users/getMyManager/${req.user.id}`);
      const userInfo = req.session.userInfo;

      if (!userScheduleResponse.data || userScheduleResponse.data.length === 0) {
        return res.render("profile.ejs", {
          status: req.query.status,
          user: req.user,
          payPeriods: [],
          userSchedule: [],
          totalHours: 0,
          myManager: [],
          userData: data.data[0],
          myManager: myManager.data[0],
          userInfo: userInfo,
          messages: req.flash(""),
          title: "Pending Timesheets",
        });
      }

      let totalHours = 0;
      const paidHours = Number(userScheduleResponse.data[0].paid_hours);
      const scheduleDays = userScheduleResponse.data[0].schedule_day;
      const startDate = new Date(userScheduleResponse.data[0].start_date);
      const endDate = new Date(userScheduleResponse.data[0].end_date);
      const payPeriods = getPayPeriods(startDate, endDate, scheduleDays);

      userScheduleResponse.data[0].paid_hours.forEach(paidHour => {
        totalHours += parseFloat(paidHour);
      });

      let initiateStartDate = false;

      const individaulSchedTotalHoursPromises = payPeriods.map(async (date, index) => {
        let start_date;
        let end_date;

        if (!initiateStartDate) {
          start_date = startDate ? startDate.toISOString().split('T')[0] : null;
          end_date = payPeriods[index] ? payPeriods[index].toISOString().split('T')[0] : null;
          initiateStartDate = true;
        } else {
          start_date = payPeriods[index - 1] ? payPeriods[index - 1].toISOString().split('T')[0] : null;
          end_date = payPeriods[index] ? payPeriods[index].toISOString().split('T')[0] : null;
        }

        try {
          const totalTimeResponse = await axios.post(`${API_URL}/totalHours/${req.user.id}`, {
            startDate: start_date,
            endDate: end_date
          });

          let totalTime = totalTimeResponse.data.data[0].totalhours;
          return totalTime == null || totalTime === "" ? 0 : totalTime;
        } catch (error) {
          console.error("Error fetching total hours:", error);
          return 0;
        }
      });

      const individaulSchedTotalHours = await Promise.all(individaulSchedTotalHoursPromises);

      res.render("profile.ejs", {
        user: req.user,
        status: req.query.status,
        payPeriods: payPeriods,
        userSchedule: userScheduleResponse.data,
        totalHours: totalHours,
        userData: data.data[0],
        myManager: myManager.data[0],
        userInfo: userInfo,
        messages: req.flash(""),
        title: "Pending Timesheets",
        individaulSchedTotalHours: individaulSchedTotalHours,
      });
    } catch (error) {
      handleError(error, req, res);
    }
  });

  return router;
};

export default createProfileRoutes;
