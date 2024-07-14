
import axios from "axios";

const withOrganizationUser = async (req , res) => {
    const API_URL = process.env.API_URL;
    
    const data = await axios.get(`${API_URL}/users/userInfo/${req.user.id}`);

    if(data.data[0] == undefined ) {
        return res.redirect('/profile?status=noOrganization');
    }

    
    if(data.data[0].org_id == undefined || data.data[0].org_id == null ) {
       return res.redirect('/profile?status=noOrganization');
    }

    return data.data[0]
}

export {withOrganizationUser};