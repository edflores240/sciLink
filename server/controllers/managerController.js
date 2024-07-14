
import { queryDatabase, pool } from "../middleware.js";





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
	staff_hierarchy.manager_id = $1 ORDER BY work_date DESC 
	
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
	staff_hierarchy.manager_id = $1 ORDER BY work_date DESC 
	
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
	staff_hierarchy.manager_id = $1 ORDER BY work_date DESC 
	
	`
    queryDatabase(query, [userId], res, "manager Timesheets fetched successfully!")
}



const approveTimesheet = async (req, res) => {
    console.log("ppt1   ")
    const userId = req.query.userID 
    const ts_id = req.body.ts_id

	await pool.query("SELECT * FROM notification WHERE timesheet_id = $1", [ts_id], async (err, result) => {
		
		if (err) {
		  console.error("Database error fetching notification:", err);
		 
		  return;
		} else {

		let notificationId;

		   notificationId = result.rowCount != 0 ? result.rows[0].notification_id : 0;

		  console.log("NotoficationID: ", notificationId);

		  const query = `UPDATE ts_timesheet_t SET status = 'approved' , activity = 'Approved by the Manager' WHERE id = $1`
        
		  await pool.query(
			`UPDATE notification SET 
			title = 'Timesheet Approved',
			message = 'Your timesheet for the week has been approved by the Manager.',
			read_status = false, 
			created_at = NOW() WHERE notification_id = $1
			 `,[notificationId], (error) => { console.error("something went wrong in updating the notification", error)});


			await queryDatabase(query, [ts_id], res, "Timesheet updated Successfully!")
		}
	  });

    
}



const pendingTimesheet = async (req, res) => {
    console.log("ppt1   ")
    const userId = req.query.userID 
    const ts_id = req.body.ts_id

	await pool.query("SELECT * FROM notification WHERE timesheet_id = $1", [ts_id], async (err, result) => {
		
		if (err) {
		  console.error("Database error fetching notification:", err);
		 
		  return;
		} else {

		let notificationId;


		   notificationId = result.rowCount != 0 ? result.rows[0].notification_id : 0;

		  console.log("NotoficationID: ", notificationId);

		  const query = `UPDATE ts_timesheet_t SET status = 'entered' , activity = 'Move to pending by the Manager' WHERE id = $1`
        
		  await pool.query(
			`UPDATE notification SET 
			title = 'Timesheet Move to Pending',
			message = 'Your timesheet was move back to pending status.',
			read_status = false, 
			created_at = NOW() WHERE notification_id = $1
			 `,[notificationId], (error) => { console.error("something went wrong in updating the notification", error)});


			await queryDatabase(query, [ts_id], res, "Timesheet updated Successfully!")
		}
	  });

    
}





const rejectTimesheet = async (req, res) => { 
	console.log("rpt1   ")
    const userId = req.query.userID 
    const ts_id = req.body.ts_id

  
	await pool.query("SELECT * FROM notification WHERE timesheet_id = $1", [ts_id], async (err, result) => {
		
		if (err) {
		  console.error("Database error fetching notification:", err);
		 
		  return;
		} else {
		  
		let notificationId;

		notificationId = result.rowCount != 0 ? result.rows[0].notification_id : 0;

		  console.log("NotoficationID: ", notificationId);

		  const query = `UPDATE ts_timesheet_t SET status = 'reject' , activity = 'Rejected by the Manager' WHERE id = $1`

		  await pool.query(
			`UPDATE notification SET 
			title = 'Timesheet Rejected',
			message = 'Your timesheet for the week has been rejected by the Manager.',
			read_status = false, 
			created_at = NOW() WHERE notification_id = $1
			 `,[notificationId], (error) => { console.error("something went wrong in updating the notification", error)});


			await queryDatabase(query, [ts_id], res, "Timesheet updated Successfully!")
    
		}
	  });

}





export {
  
  getRejectTimeSheet,
  getApproveTimeSheet,
  getPendingTimeSheet,
  approveTimesheet,
  rejectTimesheet,
  pendingTimesheet,

  
};
