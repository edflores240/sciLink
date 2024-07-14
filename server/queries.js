import { pool, queryDatabase } from "./middleware.js";
import { createNotification } from "./controllers/notificationController.js";

//--------------------------------
//----  ts_timesheet_t
//-------------------------------
//#region ts_timesheet_t

// LOCATIONS FUNCTION HERE
const getLocationById = (req, res) => {
  console.log("qj1   ", req.params);
  // Extract username or person_id from request, assuming it's available in req.params
  const personID = req.params.id;

  // Check if a personID is present in the request

  // Construct the SQL query to fetch timesheets for the current year and specific user
  const query = `SELECT "location".* FROM "location" INNER JOIN ts_timesheet_t ON "location".location_id = ts_timesheet_t.location_id WHERE ts_timesheet_t."id" = $1`;

  pool.query(query, [personID], (error, result) => {
    if (error) {
      console.error("Error querying timesheets:", error);
      res.status(500).json({ error: "Error querying timesheets" });
      return;
    }

    res.status(200).json(result.rows);
  });
};

const getAllLocation = (req, res) => {
  console.log("qk1   ")
  const query = `SELECT "location".* FROM "location"`;

  pool.query(query, [], (error, result) => {
    if (error) {
      console.error("Error querying timesheets:", error);
      res.status(500).json({ error: "Error querying timesheets" });
      return;
    }

    res.status(200).json(result.rows);
  });
};

const editLocation = (req, res) => {
  console.log("ql1   ", req.body);
  const { locationId, locationName, roleId } = req.body;

  const query = `
    UPDATE "location"
    SET "location_name" = $1, "role_id" = $2
    WHERE "location_id" = $3
    RETURNING *`;

  pool.query(query, [locationName, roleId, locationId], (error, result) => {
    if (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Error updating location" });
      return;
    }

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Location not found" });
      return;
    }

    res.status(200).json(result.rows[0]);
  });
};

// Route for editing a location

// GetTimeSheets using the userID
const getTimesheetsById = (req, res) => {
  console.log("qo1   ", req.params);
  const userID = req.params.id;

  const query = `SELECT
	ts_timesheet_t.*, 
	"location".location_name
FROM
	"location"
	INNER JOIN
	ts_timesheet_t
	ON 
		"location".location_id = ts_timesheet_t.location_id
WHERE
	ts_timesheet_t."id" = $1`;

  pool.query(query, [userID], (error, result) => {
    if (error) {
      console.error("Error querying timesheets:", error);
      res.status(500).json({ error: "Error querying timesheets" });
      return;
    }

    res.status(200).json(result.rows);
  });
};

const getCurrentYearTimesheetsForUser = (req, res) => {
  // Extract username or person_id from request, assuming it's available in req.params
  console.log("cyt1   queries.js > getCurrentYearTimesheetsForUser() ");
  const personID = req.params.id;

  // Get the current year
  const currentYear = new Date().getFullYear();
  //console.table({ currentYear });

  // Construct the SQL query to fetch timesheets for the current year and specific user
  const query = `
      SELECT dates.date AS work_date, ts_timesheet_t.*
      FROM generate_series(
          DATE '$1-01-01',
          DATE '$1-12-31',
          INTERVAL '1 day'
      ) AS dates(date)
      LEFT JOIN ts_timesheet_t ON ts_timesheet_t.work_date = dates.date AND ts_timesheet_t.person_id = $2
      WHERE EXTRACT(YEAR FROM dates.date) = $1
      ORDER BY dates.date, ts_timesheet_t.id;
  
  `;
  console.log(
    "cyt5   " +
      "SELECT * FROM ts_timesheet_t WHERE EXTRACT(YEAR FROM work_date) = " +
      currentYear +
      " AND person_id = " +
      personID +
      ");"
  );
  
  // Execute the query with currentYear and username as parameters
  pool.query(query, [currentYear, personID], (error, result) => {
    if (error) {
      console.error("Error querying timesheets:", error);
      res.status(500).json({ error: "Error querying timesheets" });
      return;
    }
    console.log("cyt9   returning " + result.rows.length + " records ");
    res.status(200).json(result.rows);
  });
};

const createTimesheet = async (req, res) => {
  console.log("ct1   ");
  const {
    person_id,
    username,
    work_date,
    time_start,
    time_finish,
    time_total,
    time_flexi,
    time_til,
    time_leave,
    time_overtime,
    time_comm_svs,
    t_comment,
    location_id,
    activity,
    notes,
    time_lunch,
    time_extra_break,
    fund_src,
    variance,
    variance_type,
    entry_date,
    rwe_day,
    duty_category,
    status,
    on_duty,
  } = req.body;



  pool.query(
    "DELETE FROM ts_timesheet_t WHERE work_date = $1",
    [work_date],
    (error, results) => {
      if (error) {
        throw error;
      }
      console.log("ct2          INSERT INTO ts_timesheet_t ... ", time_flexi, time_til, time_leave, time_overtime);

      //Build SQL
      const query = `INSERT INTO ts_timesheet_t (person_id, username, work_date, time_start, time_finish, time_total, time_flexi, time_til, time_leave, time_overtime, time_comm_svs, t_comment, location_id, activity, notes, time_lunch, time_extra_break, fund_src, variance, variance_type, entry_date, duty_category, "status", on_duty, rwe_day) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) 
    RETURNING id`;
      const values = [
        person_id,
        username,
        work_date,
        time_start,
        time_finish,
        time_total,
        time_flexi,
        time_til,
        time_leave,
        time_overtime,
        time_comm_svs,
        t_comment,
        location_id,
        activity,
        notes,
        time_lunch,
        time_extra_break,
        fund_src,
        variance,
        variance_type,
        entry_date,
        duty_category,
        status,
        on_duty,
        rwe_day,
      ];

      // Log the SQL
      console.log(`ct3      `);

      // Execute the query
      pool.query(query, values, async (error, result) => {
        if (error) {
          console.error("Error creating timesheet:", error);
          return res.status(500).json({ error: "Error creating timesheet" });
        }
        
        
        const timesheetId = result.rows[0].id;
        
        // Assuming you have the required body for the notification controller
        const notificationReq = {
          body: {
            title: "Timesheet Submitted",
            message: `Your timesheet for the week has been submitted and is pending approval.`,
            senderId: person_id,
            receiverId: person_id,
            timesheetId: timesheetId,
          }
        };
       await createNotification(notificationReq, res)

        console.log("ct9 Successfully created timesheet with ID:", timesheetId);
        return res.status(201).json({
          id: timesheetId,
          message: `Added timesheet with ID ${timesheetId}`,
        });
      });


    }
  );
};

const deleteTimesheet = (req, res) => {
  console.log("qd1  ", req.params);
  const timesheetID = parseInt(req.params.id);

  try {
    pool.query(
      "DELETE FROM ts_timesheet_t WHERE id = $1",
      [timesheetID],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.status(200).send(`Timesheet deleted with ID: ${timesheetID}`);
        console.log("qd5  ");
      }
    );
  } catch (error) {
    console.error("qd8   Error deleting timesheet:", error);
    throw error; // Throw error for handling in upper layers
  }
};

const updateTimesheetStatus = (req, res) => {
  console.log("qud1   " + req.params.id + " ", req.body);
  const timesheetID = parseInt(req.params.id);
  let newStatus = req.body.status;

  try {
    let oldStatus;
    pool.query(
      "SELECT status FROM ts_timesheet_t WHERE id = $1",
      [timesheetID],
      (error, result) => {
        if (error) {
          console.error("qud3   Error querying timesheets:", error);
        }
        console.log("ud4 ", result.rows);
        oldStatus = result.rows[0].status;
        if (newStatus == oldStatus) {
          newStatus = "entered"; // toggle status, if it is already approved
        }
        console.log("qud5   ", newStatus);

        pool.query(
          "UPDATE ts_timesheet_t SET status = $1 WHERE id = $2",
          [newStatus, timesheetID],
          (error, results) => {
            console.log("qud6    ");
            if (error) {
              console.log("qud7    ");
              throw error;
            }
            res
              .status(200)
              .send(`Set Timesheet(${timesheetID}) to status : ${newStatus}`);
            console.log("qud9  ");
          }
        );
      }
    );
  } catch (error) {
    console.error("qud8   Error deleting timesheet:", error);
    throw error; // Throw error for handling in upper layers
  }
};
//#endregion

//--------------------------------
//----  Other
//-------------------------------
const getRdoById = (req, res) => {
  console.log("rdo1    ", req.params.id);
  const id = parseInt(req.params.id);
  pool.query(
    "SELECT * FROM rdo_eligibility WHERE user_id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
};

//--------------------------------
//----  users
//-------------------------------
//#region users table

const getUsers = (req, res) => {

  const orgID = req.params.orgID;
  
  console.log("qg1   orgID", orgID);  
  pool.query(`
SELECT
	*
FROM
	users
	LEFT JOIN
	leave_balances
	ON 
		users."id" = leave_balances.person_id
	INNER JOIN
	personelle
	ON 
		users."id" = personelle.person_id
WHERE
	personelle.org_id = $1
ORDER BY
users."id" ASC;`, [orgID], (error, results) => {
    if (error) {
      console.log(error);
      throw error;
    }
    //console.log("SELECT * FROM users ORDER BY id ASC", results.rows)
    res.status(200).json(results.rows);
  });
  console.log("qg9   ")
};

const getUserById = (req, res) => {
  console.log("qh1   ", req.params.id);
  const id = parseInt(req.params.id)
  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw(error);
    }
    res.status(200).json(results.rows);
  });
};

const getUserByUsername = (req, res) => {
  console.log("qw1   ", req.params.username);
  console.log("qw2 SELECT * FROM users WHERE username = '" + req.params.username + "';");
  
  pool.query("SELECT * FROM users WHERE username = '" + req.params.username + "';",
    (error, result) => {
      // console.log("qw2    ");
      // if (error) {
      //   console.log("qw3      db error");
      //   throw error;
      // }
      if (result.rows.length === 0) {
        console.log("qw4      No user found");
        //throw new Error('No user found');
        res.status(404).json({ messages: ["No user found"] });
        return;
      }
      if (result.rows.length > 1) {
        console.log("qw5      several users with matching usernames");
        //test if result returns more than one row and throw an error
        throw new Error("Multiple users found");
        //the above will crash the server... instead use...
        res.status(500).json({ error: "Multiple users found" });
        return;
      }
      //success case. return data
      console.log("qw9     user returned ok ");
      res.status(200).json(result.rows);
    }
  );
};

const updateUser = (req, res) => {
  console.log("uu1  " + req.params.id + "  ", req.body);
  const id = parseInt(req.params.id);
  const { username, email, role, verified_email, password } = req.body;
  const updateFields = [];
  const values = [];

  let paramIndex = 1; // Start indexing from 1

  if (username) {
    updateFields.push(`username = $${paramIndex}`);
    values.push(username);
    paramIndex++;
  }
  if (email) {
    updateFields.push(`email = $${paramIndex}`);
    values.push(email);
    paramIndex++;
  }
  if (password) {
    updateFields.push(`password = $${paramIndex}`);
    values.push(password);
    paramIndex++;
  }
  if (role) {
    updateFields.push(`role = $${paramIndex}`);
    values.push(role);
    paramIndex++;
  }
  if (verified_email !== undefined) {
    updateFields.push(`verified_email = $${paramIndex}`);
    values.push(verified_email);
    paramIndex++;
  }
  values.push(id); // Add id to the end of the values array

  const setClause = updateFields.join(", "); // Join update fields with comma
  const nonParamQuery = `UPDATE users SET ${setClause} WHERE id = ${id}`;
  console.log("Non-parametized SQL Query:", nonParamQuery);
  // Replace $1 through $5 with actual values
  const valuesString = values.join(", "); // Join values with comma
  const replacedQuery = nonParamQuery.replace(/\$\d+/g, (match) => {
    return valuesString.split(",")[parseInt(match.slice(1)) - 1];
  });
  console.log("Replaced SQL Query:", replacedQuery);

  console.log(
    `uu6     UPDATE users SET ${setClause} WHERE id = $${values.length}`
  );
  console.log("uu7     ", values);
  
  pool.query(
    `UPDATE users SET ${setClause} WHERE id = $${values.length}`, // Dynamic SET clause
    values,
    (error, results) => {

      if (error) {
        console.log("uu8   ");
        throw error;
      }
      res.status(200).send(`User(${id}) modified successfully`);
    }
  );
  console.log("uu9 ");
};

const createUser = (req, res) => {
  console.log("k1 ");
  const { org_id, username, email, password, role, verificationToken, verified_email } =
    req.body;
  console.log("k2", req.body);

  

  pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    (error, result) => {
      if (error) {
        console.log("k3 error");
        console.error("Error checking email:", error);
        return res.status(500).json({ messages: ["Internal Server Error"] });
      }
      if (result.rows.length !== 0) {
        console.error("k4     email already exists:", email);
        return res
          .status(400)
          .json({ messages: [`Email ${email} already exists`] });
      }

      console.log("k5");
      const query =
        `INSERT INTO users (username, email, password, role, verification_token, verified_email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id; `;
      const values = [
        username,
        email,
        password,
        role,
        verificationToken,
        verified_email,
      ];
      pool.query(query, values, (error, result) => {
        if (error) {
          console.error("k6 Error inserting user:", error);
          return res
            .status(500)
            .json({ messages: ["Error adding user to the database"] });
        }
        console.log("k7");
        const userId = result.rows[0].id;

        // INSERTING THE REGISTERED USER TO THE ts_user_t

        // !error && pool.query("INSERT INTO ts_user_t (person_id) VALUES ($1)", [userId], (error, result) => {
        //   if (error) {
        //     console.error("k8    Adding User Error:", error);
        //     return res
        //       .status(500)
        //       .json({ messages: ["Error adding user to the database"] });
        //   } })

        if (org_id != undefined || org_id != null) {

          pool.query(`INSERT INTO personelle (person_id , position, org_id) VALUES ($1, $2, $3)`, [userId , 'user', org_id])
        }

          // the schedule id of the flexible time is "0"
          const defaultScheduleQuery = `
          INSERT INTO user_work_schedule (user_id, schedule_id, disable_til, disable_flexi, disable_rdo)
          VALUES ($1, 0, false, false, true)
          `

          !error && pool.query(defaultScheduleQuery, [userId], (error, result) => {
            if (error) {
              console.error("Adding User Error:", error);
              return res
                .status(500)
                .json({ messages: ["Error adding user to the database"] });
            } })


        console.log("k9 successfully created user");
        return res
          .status(201)
          .json({ id: userId, messages: [`Added user with ID: ${userId}`] });
      });
    }
  );
};

const verifyUserEmail = (req, res) => {
  console.log("vue1    ", req.params);
  const token = req.params.token;
  // const { name, email } = req.body

  console.log("vue2     ", token);
  pool.query(
    "SELECT id, verified_email FROM users WHERE verification_token = $1 ",
    [token],
    (error, results) => {
      if (error) {
        console.error("vue3   Error executing query:", error);
        return res.status(500).send("Error verifying token");
      }

      if (results.rows.length === 0) {
        console.log("vue5  No unverified token found");
        return res.status(404).send("Could not find an unverified token");
      }

      if (results.rows[0].verified_email === true) {
        console.log("vue4    email has already been verified");
        return res.status(409).send("Email has already been verified");
      }
      const userId = results.rows[0].id;

      // Now that we've confirmed the token is valid and the email is not yet verified,
      // proceed with updating the database to mark the email as verified
      pool.query(
        "UPDATE users SET verified_email = true WHERE id = $1",
        [userId],
        (error, updateResult) => {
          if (error) {
            console.error("Error executing update query:", error);
            return res
              .status(500)
              .send("Error updating user email verification status");
          }

          console.log(`vue9    User(${userId}) activated with verified email.`);
          res
            .status(200)
            .send(`User(${userId}) activated with verified email.`);
        }
      );
    }
  );
};

const deleteUser = (req, res) => {
  console.log("qde1   ", req.params);
  const id = parseInt(req.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).send(`User deleted with ID: ${id}`);
  });
}; //unused. no delete route as ov 20Mar

//#endregion
export {
  getUsers,
  getUserById,
  getUserByUsername,
  getLocationById,
  getAllLocation,
  getCurrentYearTimesheetsForUser,
  createUser,
  updateUser,
  verifyUserEmail,
  deleteUser,
  createTimesheet,
  deleteTimesheet,
  updateTimesheetStatus,
  getRdoById,
  getTimesheetsById,
};
