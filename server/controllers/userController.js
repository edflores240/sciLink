import { queryDatabase, pool } from "../middleware.js";
import bcrypt from "bcrypt";


const getUserInfo= (req, res) => {
    console.log("inf1    params, ", req.params);
    const userId = req.params.userID

    const query = `SELECT
	personelle.*, 
	users.username, 
	users.email, 
	users."role", 
	users."password"
FROM
	users
	INNER JOIN
	personelle
	ON 
		users."id" = personelle.person_id
WHERE
users."id" = $1`;
console.log("inf5    query", query);
queryDatabase(query, [userId], res, "User fetched successfully");
console.log("inf9");
}




//STATUS if ts_user_t.role_id = 1 then it is NORMAL USER
//STATUS if ts_user_t.role_id = 2 then it is MANAGER USER


const isManager = async (req, res) => {
    console.log("gt1    params, ", req.params);
    try {
        const userId = req.params.userID;
        const query = `SELECT
        users.*, 
        personelle.*
    FROM
        personelle
        INNER JOIN
        users
        ON 
            personelle.person_id = users."id"
    WHERE
        personelle."position" = 'manager'
     AND
        users."id" = $1`;

        // const result = await pool.query(query, [userId]);
		const result = await queryDatabase(query, [userId], res, "fetched Successfully")

        return result.rows.length > 0 ? true : false;
    } catch (error) {
        console.error("Error in isManager function:", error);
        return false;
    }
}


const checkUserExist = async (req, res) => { 
    console.log("ck1     params, ", req.params);
    const { email, password } = req.body;
    

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
  
    try {
      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      // console.log(user.rows)

      if (!user) {
        return res.status(200).json({ exists: false });
      }

      
    //   console.log(user.rows[0])
      const isPasswordMatch = user && user.rows[0].password ? await bcrypt.compare(password, user.rows[0].password) : false;
      if (isPasswordMatch) {
        console.log("Password Match")
        return res.status(200).json({ exists: true, user: { id: user.id, username: user.username } });
      } else {
        console.log("Password Nope")
        return res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

}


// PROFILE PART
const editProfile = async (req, res) => { 
    // console.log("req.body:", req.body);
    const { firstName, lastName, email, username, password, userId, managerID } = req.body;

    console.log("req.body.firstName:", firstName);
    console.log("req.body.lastName:", lastName);
    console.log("req.body.email:", email);
    console.log("req.body.username:", username);
    console.log("req.body.password:", password);
    console.log("req.body.userIdm:", userId);
    console.log("req.body.managerID:", managerID);

    if (!firstName ||!lastName ||!email ||!username ||!password) {
        return res.status(400).json({ error: 'All fields must be filled out.' });
    }

    // Check if the user exists in the personelle table
    const userExists = await pool.query('SELECT * FROM personelle WHERE person_id = $1', [userId]);
   
    // If the user does not exist, insert it
    if (!userExists.rows.length) {
        await pool.query('INSERT INTO personelle (person_id, first_name, last_name) VALUES ($1, $2, $3)', [userId, firstName, lastName]);
    } else {
        await pool.query('UPDATE personelle SET first_name = $2, last_name = $3 WHERE person_id = $1', [userId, firstName, lastName]);
    }

    await pool.query('SELECT * FROM staff_hierarchy WHERE user_id = $1', [userId], async (err, result) => {
      console.log("uc 1 staff_hierarchy", result)
      if(!err) { 
       

        if(result.rowCount == 0)  {
          await pool.query(`INSERT INTO staff_hierarchy (user_id, manager_id) VALUES ($1, $2)`, [userId, managerID]);
          // console.log("ALKSD:LASJHD:LKASJD:LKASJDLKAJSD:KLAJSD:LKJAS:LDKJAS:LKJDA:LSKJDKL")
        } else { 
          await pool.query(`UPDATE staff_hierarchy SET  manager_id = $1 WHERE user_id = $2`, [managerID,userId]);
          // console.log("ALKSD:LASJHD:LKASJD:LKASJDLKAJSD:KLAJSD:LKJAS:LDKJAS:LKJDA:LSKJDKL")
          const oldManagerTitle = "Change Manager"
          const oldMangerMessage =  `${firstName} ${lastName} (@${email}) Assign a new manager`


          await pool.query(`
          INSERT INTO notification (title,message, sender_message, sender_title, sender_id, receiver_id, notification_type, read_status, created_at, sender_read_status, receiver_read_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, NOW(), FALSE, FALSE);
          `, [oldManagerTitle, oldMangerMessage , oldManagerTitle, oldMangerMessage , result.rows[0].manager_id, result.rows[0].manager_id, "Manager Request"]) 
          
        }

        
    const receiverTitle = "Assign Manager"
    const receiverMessage = `${firstName} ${lastName} (@${email}) Assign you as the manager`
    const senderTitle = "Assign Manager"
    const senderMessage = `You changed your Manager` 
    const senderId = userId 
    const receiverId = managerID
    const notificationType = "Manager Request"


    

    await pool.query(`
    INSERT INTO notification (title,message, sender_message, sender_title, sender_id, receiver_id, notification_type, read_status, created_at, sender_read_status, receiver_read_status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, NOW(), FALSE, FALSE);
    `, [receiverTitle, receiverMessage,senderMessage, senderTitle, senderId, receiverId, notificationType ]) 
  } else { 
        console.log("error in updateing or insterting the manager: ", err);
      }
    });

    try {
        await pool.query(`
        UPDATE users SET  email = $1, username = $2, password = $3 WHERE id = $4
        `,[email, username, password, userId]);
        return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

    
}


const getManager = async (req,res) => { 
// console.log("AKSJDHASJKDHASJKLDHASJKLDHAKLSJDHAKLSJHDKLAJSDHASKLJDH")
const orgID = req.params.orgID;

console.log("orgID: ", orgID)
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
		
	WHERE position = 'manager' AND org_id = $1`

	try {
		const result = await pool.query(query, [orgID]);
		res.status(200).json(result.rows);
	} catch (error) {
		console.error('Error fetching manager:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

const getMyManager = async (req, res) => { 
  
  const userId = req.params.userID;
  console.log("userid " + userId)
  

  const query = `SELECT
	users.email, 
	personelle.*
FROM
	staff_hierarchy
	INNER JOIN
	users
	ON 
		staff_hierarchy.manager_id = users."id"
	INNER JOIN
	personelle
	ON 
		users."id" = personelle.person_id
WHERE
	user_id = $1`

	try {
		const result = await pool.query(query, [userId]);
		res.status(200).json(result.rows);
	} catch (error) {
		console.error('Error fetching my manager:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}


const checkMyManger = async(req, res) => {

  const person_id = req.params.id
    // console.log("ct4");
    pool.query(`
    SELECT
  staff_hierarchy.*
  FROM
  staff_hierarchy
  WHERE
  user_id = $1
  `, [person_id], (error, result) => {
  
  
  if (error) {
  console.error("Error fetching Manager:", error);
  return res.status(500).json({ error: "Error creating timesheet" });
  } else {

    res.status(200).json(result.rows)
  
  }
  
  }) 
}


const assignManager =  async (req, res) => {
		
	const userId = res.body.userID
	const notificationID = res.body.notificationID
	const managerID = res.params.managerID

	
	await pool.query('SELECT * FROM staff_hierarchy WHERE user_id = $1', [userId], async (err, result) => {

		if(err) { 
			console.error("AssignManager getting staff error:", err);
		} else {
			if(result.rows.length == 0) {

				await pool.query('INSERT INTO staff_hierarchy (user_id, manager_id) VALUES ($1, $2) ',[userId, managerID], async (err, result) => {

					if (err) {
					  console.error("INSERTING MANAGER ", err);
				   
					  return;
					} else {
					  console.log("Manager assigned successfully!")
					}
			  });

		} else { 
			await pool.query('UPDATE staff_hierarchy SET manager_id = $2 WHERE user_id = $1',[userId, managerID],  async (err, result) => {

				if (err) {
				  console.error("UPDATING MANAGER ", err);
			   
				  return;
				} else {
				  console.log("Manager assigned successfully!")
				}
		  });
		}

	}

  const receiverTitle = "Manager Request Approved"

  const receiverMessage = `You can now manage ${firstName} ${lastName} (@${email}) timesheet Entries`
  const senderTitle = "Manager Request Approved"
  const senderMessage = `The Manager approved your request. The manager can now manage your timesheet entries` 
  const senderId = userId 
  const receiverId = managerID

  const approveManagerRequestQuery = `
  UPDATE notification SET 
  title = $1, message = $2, 
  sender_message = $3, 
  sender_title = $4,
  receiver_message = $5,
  receiver_title = $6, 
  sender_id = $7,
  receiver_id = $8,
  created_at = NOW(),
  sender_read_status = FALSE,
  receiver_read_status = FALSE

  WHERE notification_id = $9

  
  `


  await pool.query(
    approveManagerRequestQuery
    , [receiverTitle, receiverMessage, senderMessage, senderTitle, receiverMessage, receiverTitle, senderId, receiverId, notificationID], (err, res) => {
      if (err) {
        console.log("Manager Approve", err)
      }
    })


}


);
  
	

	 
  }

  const checkMyManagement = (req, res) => { 
    const {tsId, managerId} = req.body

    const query = `
    SELECT
	ts_timesheet_t.id
FROM
	ts_timesheet_t
	INNER JOIN
	staff_hierarchy
	ON 
		ts_timesheet_t.person_id = staff_hierarchy.user_id
	WHERE 
	
	ts_timesheet_t.id = $1 AND manager_id = $2
    `

    pool.query(query, [tsId, managerId], (err, result) => {

      if(err) {
        console.log("Checking management Error:", err)
        return res.status(500).json(err)
      } else { 
        return res.status(200).json(result.rows)
      }

    })
    
  }

  
  const addPersonelleInfo = (req , res) => { 
    const userId = req.params.userID;
    const query =   `INSERT INTO personelle (person_id, position) VALUES ($1 , 'user')`

    pool.query(query, [userId], (err, result) => {
      if(err) {
        console.log("Adding personelle info Error:", err)
        return res.status(500).json(err)
      } else { 
        return res.status(200).json()
      } 
    })
  }


  const addOrganizationToPersonelle = (req, res) => {

    const {person_id, position, org_id} = req.body
  
  pool.query(`INSERT INTO personelle (person_id , position, org_id) VALUES ($1, $2, $3)`, [person_id , position, org_id], (err, result)=> {
    if(!err){
      console.log("uc1" , result);
      
    }
   })
  }



  // ADMIN FUNCTIONS 

  const adminEditUser = (req, res) => {

    const { email, username, password, userId, role} = req.body;

    console.log("req.body.email:", email);
    console.log("req.body.username:", username);
    console.log("req.body.password:", password);
    console.log("req.body.userIdm:", userId);


    if (!email ||!username || !role ) {
        return res.status(400).json({ error: 'Important fields must be filled out.' });
    }




  }
  


export {
  
  getUserInfo,
  isManager,
  checkUserExist,
  editProfile,
  getMyManager,
  getManager, 
  assignManager, 
  checkMyManger, 
  checkMyManagement,
  addPersonelleInfo, 
  addOrganizationToPersonelle,
  adminEditUser
};
