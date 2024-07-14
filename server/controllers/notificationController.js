import { pool } from "../middleware.js";

// Function to create a new notification
const createNotification = async (req, res) => {
  const { title, message, senderId, receiverId, timesheetId } = req.body;

  const notificationQuery = `
        INSERT INTO notification (title, message, sender_id, receiver_id, timesheet_id, notification_type, created_at, sender_read_status, receiver_read_status)
        VALUES ($1, $2, $3, $4, $5,'timesheet', NOW(), FALSE, FALSE)
        RETURNING notification_id;
    `;

  const values = [title, message, senderId, receiverId, timesheetId || null];

  try {
    await pool.query(notificationQuery, values, (err, results) => {
      if(err) {
        console.error("Database error:", err);
        res.status(500).send({ error: "Failed to create notification." });
      } else {
        console.log("timsheet Notification created successfully")
      }
    });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send({ error: "Failed to create notification." });
  }
};

// Function to get recent notifications for a user
const getRecentNotifications = async (req, res) => {
  const { userId } = req.body;

  const query = `
        SELECT n.title, n.message, r.seen
        FROM notification n
        JOIN recipient r ON n.notification_id = r.notification_id
        WHERE r.user_id = $1 AND archive = FALSE
        AND n.created_at > NOW() - INTERVAL '24 hours'
        ORDER BY n.created_at DESC;
    `;

  try {
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error("Database error fetching recent notifications:", error);
    res.status(500).send({ error: "Failed to fetch recent notifications." });
  }
};

const getAllNotificationsByUserId = async (req, res) => {
  const { userId } = req.query;

  const query = `
  SELECT
	n.*, 
	COALESCE(t.work_date, NULL) AS work_date
FROM
	notification AS n
	LEFT JOIN
	ts_timesheet_t AS "t"
	ON 
		n.timesheet_id = "t"."id"
WHERE
	(n.receiver_id = $1 OR
	n.sender_id = $1) AND (
	"t".status = 'reject' OR n.notification_type = 'Manager Request') AND archive = FALSE
ORDER BY
	n.created_at DESC

    `;
//   const query = `
//   SELECT
//     n.*,
//     COALESCE(t.work_date, NULL) AS work_date 
// FROM
//     notification n
// LEFT JOIN
//     ts_timesheet_t t ON n.timesheet_id = t.id 
// WHERE
//     n.receiver_id = $1 OR
//     n.sender_id = $1 
// ORDER BY
//     n.created_at DESC;

//     `;
  try {
    await pool.query(query, [userId], (err, result) => {
      if (err) {
        console.error("Database error fetching notifications:", err);
        res.status(500).send({ error: "Failed to fetch notifications." });
        return;
      } else {
        res.status(200).json(result.rows);
      }
    });
  } catch (error) {
    console.error("Database error fetching notifications:", error);
    res.status(500).send({ error: "Failed to fetch notifications." });
  }
};

// Function to mark a notification as seen
const markAsSeen = async (req, res) => {
  const userId = parseInt(req.params.userID);
    await pool.query(`
    UPDATE notification SET receiver_read_status = TRUE
        WHERE receiver_id = $1;
    `, [userId] , async (err, result) => {
      if(err){
        console.log("Error marking notification as seen", err);
      } else {

        await pool.query(`
        UPDATE notification SET sender_read_status = TRUE
        WHERE sender_id = $1;
        `, [userId] , (err, result) => {
          if(err){
            console.log("Error marking notification as seen", err);
          } else {
            // console.log("Marking notification as seen successfully");
          }
        });
        
      }
    });
  

};


// Function to delete a notification
const deleteNotification = async (req, res) => {
  const notificationId = req.params.notificationID;

  // First, delete the recipient entries associated with the notification
  // const deleteRecipientQuery = `
  //       DELETE FROM notification
  //       WHERE notification_id = $1;
  //   `;

  const deleteRecipientQuery = `
        UPDATE notification SET archive = TRUE WHERE notification_id = $1;
    `;

  try {
    await pool.query(deleteRecipientQuery, [notificationId]);

    // Then, delete the notification itself
    

    res.json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Database error deleting notification:", error);
    res.status(500).send({ error: "Failed to delete notification." });
  }
};


const getCountUnseenNotifications = async (req, res) => {
  let userID = parseInt(req.params.userID)
  // console.log("userID", userID);
  // const query = `
  // SELECT COUNT(notification_id) as count
  //       FROM notification
  //       WHERE 	
  //     ( sender_id = $1 AND sender_read_status = FALSE) OR ( receiver_id =  $1 AND receiver_read_status = FALSE) ;
  //   `;  
    const query = `
    SELECT
    COUNT(notification.notification_id) AS "count"
  FROM
    notification
    LEFT JOIN
    ts_timesheet_t
    ON 
      notification.timesheet_id = ts_timesheet_t."id"
  WHERE
  
    (
    
    ( ts_timesheet_t.status = 'reject' OR notification_type = 'Manager Request') AND
      sender_id = $1 AND
      sender_read_status = FALSE
      
      
    ) OR
    (
    
    ( ts_timesheet_t.status = 'reject' OR notification_type = 'Manager Request') AND
      receiver_id = $1 AND
      receiver_read_status = FALSE
    )  
    
    `;
    await pool.query(query,[userID], (err, result) => { 
       if (err) {
        console.log("something went in fetching the unseen num", err )
          return

        }
        else {
          res.json(result.rows);
          // console.log("unseen", result.rows)
        }
    }
  )
  
}


// Exporting all the functions
export {
  createNotification,
  getRecentNotifications,
  getAllNotificationsByUserId,
  markAsSeen,
  deleteNotification,
  getCountUnseenNotifications,
};
