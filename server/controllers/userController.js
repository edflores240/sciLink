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
      console.log(user.rows)

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

    const { firstName, lastName, email, username, password, userId } = req.body;

    if (!firstName || !lastName || !email || !username || !password) {
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

    try {
        await pool.query(`
        UPDATE users SET  email = $3, username = $4, password = $5 WHERE id = $6;
        `, [firstName, lastName, email, username, password, userId]);
        return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}



export {
  
  getUserInfo,
  isManager,
  checkUserExist,
  editProfile

};
