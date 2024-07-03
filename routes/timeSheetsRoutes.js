import { Router } from "express";
import axios from "axios";

// Function to create timesheet routes
const createTimesheetRoutes = (isAuthenticated) => {
  const router = Router(); // Initialize the router
  const API_URL = process.env.API_URL; // Get the API URL from environment variables
  const NODE_ENV = process.env.NODE_ENV  // Set NODE_ENV to 'development' if not set

  // POST route to handle flexi day off
  router.post("/flexiDayOff", isAuthenticated, async (req, res) => {
    const userID = req.user.id;
    const { dayOffOption, workDate, flexiInput, tilInput } = req.body;

    try {
      // Make a POST request to the API to handle the flexi day off
      await axios.post(`${API_URL}/flexiDayOff/${userID}`, {
        dayOffOption,
        workDate,
        flexiInput,
        tilInput,
      });
      res.redirect("/time"); // Redirect to the timesheet page on success
    } catch (error) {
      // Log error details only in development mode
      if (NODE_ENV === 'development') {
        console.error(error);
      }
      // Send a generic error message to the client
      res.status(500).json({ error: "An error occurred while processing your request." });
    }
  });

  // GET route to fetch and display an individual timesheet by ID
  router.get("/:id", isAuthenticated, async (req, res) => {
    const ts_id = req.params.id;

    try {
      // Make a GET request to the API to fetch the timesheet by ID
      const timesheetResult = await axios.get(`${API_URL}/timesheets/getTimesheetById/${ts_id}`);

      // Redirect if no data is found or if the user is not authorized to view the timesheet
      if (timesheetResult.data.length === 0 || 
          (timesheetResult.data[0].manager_id !== req.user.id && timesheetResult.data[0].user_id !== req.user.id)) {
        return res.redirect(req.get('referer') || '/time');
      }

      const userInfo = req.session.userInfo; // Get user information from the session
      const data = timesheetResult.data[0]; // Extract the timesheet data

      // Render the individual timesheet page
      res.render("timesheet/individualTimeSheet.ejs", {
        title: "Timesheet",
        user: req.user,
        userInfo,
        data,
        messages: req.flash("messages"),
      });
    } catch (error) {
      // Log error details only in development mode
      if (NODE_ENV === 'development') {
        console.error(error);
      }
      res.redirect("/time"); // Redirect to the timesheet page on error
    }
  });

  // GET route to edit a timesheet by ID
  router.get("/edit/:id", isAuthenticated, async (req, res) => {
    const ts_id = req.params.id;
    const { work_date: workDate } = req.query;

    try {
      // Check if the user has a manager
      const myManager = await axios.get(`${API_URL}/users/checkMyManger/${req.user.id}`);
      if (myManager.data.length === 0) {
        return res.redirect("/profile?status=noManager");
      }

      // Fetch the pending timesheet data by ID and work date
      const tsData = await axios.get(`${API_URL}/timesheets/getPendingTimesheetById/${ts_id}?work_date=${workDate}`);
      if (tsData.data.length === 0) {
        return res.redirect("/time");
      }

      const userId = req.user.id;
      const locationResponse = await axios.get(`${API_URL}/location`);
      const userScheduleResponse = await axios.get(`${API_URL}/userSchedule/${userId}`);

      let userSchedules = [];
      // Process user schedule if available
      if (userScheduleResponse.data.length !== 0) {
        const { schedule_day: scheduleDays, paid_hours: paidHours, start_date: startDate, end_date: endDate } = userScheduleResponse.data[0];
        userSchedules = getPayPeriods(new Date(startDate), new Date(endDate), scheduleDays, paidHours);
      }

      const location = locationResponse.data; // Get location data
      const recentLocation = await axios.get(`${API_URL}/location/getRecentLocation/${userId}`);
      const selectedDate = workDate;

      // Redirect if no schedules are found
      if (userSchedules.length === 0) {
        return res.redirect("/time?m=noSchedule");
      }

      // Render the edit timesheet page
      res.render("timesheet/editTimesheet.ejs", {
        tsData: tsData.data[0],
        forDate: workDate,
        user: req.user,
        userWorkSchedule: userSchedules,
        selectedDate,
        location,
        recentLocation: recentLocation.data,
        title: "Enter Timesheet",
        messages: req.flash("messages"),
      });
    } catch (error) {
      // Log error details only in development mode
      if (NODE_ENV === 'development') {
        console.error(error);
      }
      res.redirect("/time"); // Redirect to the timesheet page on error
    }
  });

  // Helper function to get the name of the day of the week
  function getDayOfWeekName(dayOfWeek) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayOfWeek];
  }

  // Helper function to get pay periods
  function getPayPeriods(startDate, endDate, scheduleDays, paidHours) {
    const allDateSchedules = [];
    let currentDate = new Date(startDate);
    let i = 0;
    let paidHour = 0;

    // Iterate through the dates to generate schedules
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (scheduleDays.includes(getDayOfWeekName(dayOfWeek))) {
        if (i <= paidHours.length - 1) {
          paidHour = paidHours[i];
          i = i === paidHours.length - 1 ? 0 : i + 1;
        }

        allDateSchedules.push({
          date: currentDate.toISOString().split("T")[0],
          paidHour,
          start_date: startDate,
          end_date: endDate,
          user_id: userScheduleResponse.data[0].user_id,
          schedule_id: userScheduleResponse.data[0].schedule_id,
          disable_til: userScheduleResponse.data[0].disable_til,
          disable_flexi: userScheduleResponse.data[0].disable_flexi,
          disable_rdo: userScheduleResponse.data[0].disable_rdo,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDateSchedules;
  }


  // router.post("/edit/:id", isAuthenticated, async (req, res) => {
  //   const ts_id = req.params.id;
  //   const {
  //     work_date,
  //     time_start,
  //     time_finish,
  //     time_lunch,
  //     time_extra_break,
  //     location_id,
  //     fund_src,
  //     activity,
  //     comment,
  //     variance,
  //     notes,
  //   } = req.body;
    

  //   try {
  //     const result = await axios.put(`${API_URL}/timesheets/${ts_id}`, {
  //       work_date,
  //       time_start,
  //       time_finish,
  //       time_lunch,
  //       time_extra_break,
  //       location_id,
  //       fund_src,
  //       activity,
  //       comment,
  //       variance,
  //       notes,
  //     });

  //     console.log("Timesheet updated", result.data);
  //     req.flash("messages", "Timesheet updated successfully");
  //     res.redirect("/time");
  //   } catch (error) {
  //     console.error("Error updating timesheet:", error);
  //     req.flash(
  //       "messages",
  //       "An error occurred while updating the timesheet - the timesheet was not saved"
  //     );
  //     res.redirect("/time");
  //   }
  // });

  // router.post(
  //   "/edit/:id",
  //   isAuthenticated,
  //   [
  //     // Validate request body
  //     body("work_date")
  //       .optional()
  //       .isISO8601()
  //       .toDate()
  //       .withMessage("Timesheet not saved.  Invalid date format"),
  //     body("time_start")
  //       .optional()
  //       .custom(isValidTimeFormat)
  //       .withMessage(
  //         "Timesheet not saved.  Invalid time format for time_start (hh:mm)"
  //       ),
  //     body("time_finish")
  //       .optional()
  //       .custom(isValidTimeFormat)
  //       .withMessage(
  //         "Timesheet not saved.  Invalid time format for time_finish (hh:mm)"
  //       ),
  //     body("time_lunch")
  //       .optional()
  //       .isInt({ min: 0, max: 360 })
  //       .withMessage(
  //         "Timesheet not saved.  Please enter the number of minutes taken for lunch (eg. 90)"
  //       ),
  //     body("time_extra_break")
  //       .optional()
  //       .isInt({ min: 0, max: 360 })
  //       .withMessage(
  //         "Timesheet not saved.  Please enter the number of minutes taken for break (eg. 45)"
  //       ),
  //     //body('time_total').optional().custom(isValidTimeFormat).withMessage('Invalid time format for time_total (hh:mm)'),      //calculated field
  //     body("location_id")
  //       .optional()
  //       .isInt()
  //       .withMessage("Invalid entry for location_id"),
  //     body("fund_src")
  //       .optional()
  //       .isString()
  //       .withMessage("Invalid string format for fund_src"),
  //     body("activity")
  //       .optional()
  //       .isString()
  //       .isLength({ max: 30 })
  //       .withMessage("Activity must be less than 31 characters"),
  //     body("comment")
  //       .optional()
  //       .isString()
  //       .withMessage("Invalid string format for comment"),
  //     body("variance")
  //       .optional()
  //       .isString()
  //       .withMessage("Invalid string format for variance"),
  //     body("notes")
  //       .optional()
  //       .isString()
  //       .withMessage("Invalid string format for notes"),
  //     // body('flexi_accrued').optional().isNumeric().withMessage('Invalid numeric format for flexi_accrued'),
  //     // body('flexi_taken').optional().isNumeric().withMessage('Invalid numeric format for flexi_taken'),
  //     // body('til_accrued').optional().isNumeric().withMessage('Invalid numeric format for til_accrued'),
  //     // body('til_taken').optional().isNumeric().withMessage('Invalid numeric format for til_taken')
  //   ],
  //   async (req, res) => {
  //     console.log("n10 ", req.body);
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       req.flash(
  //         "messages",
  //         errors.array().map((error) => error.msg)
  //       );
  //       return res.redirect("/time");
  //     }
  
  //     try {
  //       const {
  //         work_date,
  //         time_start,
  //         time_finish,
  //         time_lunch,
  //         time_extra_break,
  //         time_total,
  //         location_id,
  //         fund_src,
  //         activity,
  //         comment,
  //         variance,
  //         notes,
  //         flexi_accrued,
  //         flexi_taken,
  //         til_accrued,
  //         til_taken,
  //       } = req.body;
  //       let { variance_type, time_leave, time_overtime } = req.body;

  //       const ts_id = req.params.id;
  
  //       console.log("n15   variance", variance);
  //       if (variance === "") {
  //         variance_type = ""; // timesheet has no variance, tidy up data set
  //         console.log("n16   variance_type", variance_type);
  //       }
  //       const currentDate = new Date();
  
  //       //set calculated fields
  //       let time_total_numeric = parseFloat(time_total);
  //       let flexi_accrued_numeric =
  //         flexi_accrued.trim() !== "" ? parseFloat(flexi_accrued) : 0;
  //       let flexi_taken_numeric =
  //         flexi_taken.trim() !== "" ? parseFloat(flexi_taken) : 0;
  //       let til_accrued_numeric =
  //         til_accrued.trim() !== "" ? parseFloat(til_accrued) : 0;
  //       let til_taken_numeric =
  //         til_taken.trim() !== "" ? parseFloat(til_taken) : 0;
  //       let time_leave_numeric =
  //         time_leave.trim() !== "" ? parseFloat(time_leave) : 0;
  //       let time_overtime_numeric =
  //         time_overtime.trim() !== "" ? parseFloat(time_overtime) : 0;
  //       const on_duty = 0; //activity.startsWith("Rest Day") ? 0 : 1;       //deleted 14May2024
  
  //       let time_flexi = null;
  //       let time_til = null;
  //       time_leave = null;
  //       time_overtime = null;
  //       if (variance_type === "flexi") {
  //         time_flexi = flexi_accrued_numeric - flexi_taken_numeric;
  //         console.log(
  //           "n21 " +
  //             time_flexi +
  //             " " +
  //             flexi_accrued_numeric +
  //             " " +
  //             flexi_taken_numeric
  //         );
  //       } else if (variance_type === "til") {
  //         time_til = til_accrued_numeric - til_taken_numeric;
  //         console.log("n22  ", time_til);
  //       } else if (variance_type === "leave") {
  //         time_leave = time_leave_numeric;
  //         console.log("n23  ", time_leave);
  //       } else if (variance_type === "overtime") {
  //         time_overtime = time_overtime_numeric;
  //         console.log("n24  ", time_overtime);
  //       } else {
  //         console.log("n25   mixed not working"); // mixed is not completed
  //       }
  
   
  //       const result = await axios.put(`${API_URL}/timesheets/edit/${ts_id}`, {
  //         person_id: req.user.id,
  //         username: req.user.username,
  //         work_date,
  //         time_start,
  //         time_finish,
  //         time_lunch,
  //         time_extra_break,
  //         time_total,
  //         location_id,
  //         fund_src,
  //         activity,
  //         t_comment: comment,
  //         entry_date: currentDate,
  //         variance,
  //         variance_type,
  //         notes,
  //         time_flexi,
  //         time_til,
  //         time_leave,
  //         time_overtime,
  //         on_duty, // 1 for work day, 0 if activity name begins with "Rest Day", ie. "Rest Day (Planned Burning)".
  //         duty_category: null,
  //         status: "entered",
  //         rwe_day: null, //
  //       });
  //       console.log("n30   res.status: ", result.status);
  
  //       const scanIssueResult = await axios.put(`${API_URL}/timesheet/scanIssues`, {
  //         person_id: req.user.id,
  //         username: req.user.username,
  //         work_date,
  //         time_start,
  //         time_finish,
  //         time_lunch,
  //         time_extra_break,
  //         time_total,
  //         location_id,
  //         fund_src,
  //         activity,
  //         t_comment: comment,
  //         entry_date: currentDate,
  //         variance,
  //         variance_type,
  //         notes,
  //         time_flexi,
  //         time_til,
  //         time_leave,
  //         time_overtime,
  //         on_duty, // 1 for work day, 0 if activity name begins with "Rest Day", ie. "Rest Day (Planned Burning)".
  //         duty_category: null,
  //         status: "entered",
  //         rwe_day: null, //
  //       });
  //       console.log("n90    New timesheet created");
  
  //       console.log("n30   res.status: ", scanIssueResult.status);
  
  
  //       req.flash("messages", "Thank you for entering your timesheet");
  //       return res.redirect("/time");
  //     } catch (error) {
  //       console.error("n80     Error creating timesheet:", error);
  //       req.flash(
  //         "messages",
  //         "An error occurred while creating the timesheet - the timesheet was not saved"
  //       );
  //       return res.redirect("/time");
  //     }
  //   }
  // );
  

  return router;
};



export default createTimesheetRoutes;
