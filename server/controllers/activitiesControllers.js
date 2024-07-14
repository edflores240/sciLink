import { queryDatabase } from "../middleware.js";

const getActivitiesByUserId = (req, res) => {
  console.log("ag1");
  const userID = req.params.id;
  const query = `SELECT
	users.username, 
	activities.*
FROM
	activities
	INNER JOIN
	users
	ON 
		activities.user_id = users."id" WHERE user_id = $1`;

  queryDatabase(query, [userID], res, "Activity fetched Successfully");
};

const getAllActivities = (req, res) => {
  console.log("aga1");
  const org_id = req.params.orgId;

  
  const query = "SELECT * FROM activities WHERE org_id = $1";

  queryDatabase(query, [org_id], res, "Activity fetched Successfully");
};

const createActivity = (req, res) => {
  console.log("ca1");
  const { name, programs, percentages, status, user_id, org_id } = req.body;
console.log("createActivity: " + programs)

const thePrograms = `{${programs}}`
  const query = `INSERT INTO activities (name, programs, percentages, status, user_id, org_id ) VALUES ($1, $2, $3, $4, $5 ,$6)`;

  queryDatabase(
    query,
    [name, `{${programs}}`, `{${percentages}}`, status, user_id, org_id],
    res,
    "Activity created successfully"
  );
};



const updateActivity = (req, res) => {
  console.log("ua1");
  const { name, programs, percentages, status, user_id } = req.body;
  const activityId = req.params.id;

  const query = `UPDATE activities SET name = $1, programs = $2, percentages = $3, status = $4, user_id = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6`;

  queryDatabase(
    query,
    [name, programs, percentages, status, user_id, activityId],
    res,
    "Activity updated successfully"
  );
};

const deleteActivity = (req, res) => {
  console.log("da1");
  const id = req.body.id


  const query = `DELETE FROM activities WHERE id = $1`;

  queryDatabase(query, [id], res, "Activity deleted successfully");
};

export {
  getActivitiesByUserId,
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
};
