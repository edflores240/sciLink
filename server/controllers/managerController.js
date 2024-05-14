import { queryDatabase } from "../middleware.js";



const getPendingTimeSheet = (req, res) => {
    console.log("Gwa1    ");
    const userId = req.params.userID
	console.log("Gwapo ko" + userId)

    const query = `SELECT
	ts_timesheet_t.*
FROM
	ts_timesheet_t
	INNER JOIN
	staff_hierarchy
	ON 
		ts_timesheet_t.person_id = staff_hierarchy.user_id
WHERE
	ts_timesheet_t.status = 'entered' AND
	staff_hierarchy.manager_id = $1
	
	`

queryDatabase(query, [userId], res, "Manager Timesheets fetched successfully");



}

const getApproveTimeSheet = (req, res) => { 
    console.log("gats1    ");
    const userId = req.params.userID
    const query = `SELECT
	ts_timesheet_t.*
FROM
	ts_timesheet_t
	INNER JOIN
	staff_hierarchy
	ON 
		ts_timesheet_t.person_id = staff_hierarchy.user_id
WHERE
	ts_timesheet_t.status = 'approved' AND
	staff_hierarchy.manager_id = $1
	
	`
    queryDatabase(query, [userId], res, "manager Timesheets fetched successfully!")
}

const getRejectTimeSheet = (req, res) => { 
    console.log("grts1    ");
    const userId = req.params.userID
    const query = `SELECT
	ts_timesheet_t.*
FROM
	ts_timesheet_t
	INNER JOIN
	staff_hierarchy
	ON 
		ts_timesheet_t.person_id = staff_hierarchy.user_id
WHERE
	ts_timesheet_t.status = 'reject' AND
	staff_hierarchy.manager_id = $1
	
	`
    queryDatabase(query, [userId], res, "manager Timesheets fetched successfully!")
}



const approveTimesheet = (req, res) => {
    console.log("ppt1   ")
    const userId = req.query.userID 
    const ts_id = req.body.ts_id

    const query = `UPDATE ts_timesheet_t SET status = 'approved' , activity = 'Approved by the Manager' WHERE id = $1`

    queryDatabase(query, [ts_id], res, "Timesheet updated Successfully!")
}


const rejectTimesheet = (req, res) => { 
	console.log("rpt1   ")
    const userId = req.query.userID 
    const ts_id = req.body.ts_id

    const query = `UPDATE ts_timesheet_t SET status = 'reject' , activity = 'Rejected by the Manager' WHERE id = $1`

    queryDatabase(query, [ts_id], res, "Timesheet updated Successfully!")
    
}


const getManager = (req,res) => { 

	const query = `SELECT
	users."id", 
	users.username, 
	users.email, 
	personelle."position", 
	personelle.first_name, 
	personelle.last_name
FROM
	personelle
	INNER JOIN
	users
	ON 
		personelle.person_id = users."id"
		
	WHERE position = 'manager'`

	queryDatabase(query, [], res, "Manager Fetched Successfully")
}



export {
  
  getRejectTimeSheet,
  getApproveTimeSheet,
  getPendingTimeSheet,
  approveTimesheet,
  rejectTimesheet,
  getManager,
};
