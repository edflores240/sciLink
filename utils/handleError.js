
const handleError = (error, req, res) => {
    const NODE_ENV = process.env.NODE_ENV || 'development';
    
    if (NODE_ENV === 'development') {
      console.error(error);
    } 
    else if (NODE_ENV === 'production') {
  
        if (res.statusCode === 400) {
        res.status(400).json({ error: "Bad Request" });
        } else if (res.statusCode === 401) {
        res.status(401).json({ error: "Unauthorized" });
        } else if (res.statusCode === 403) {
        res.status(403).json({ error: "Forbidden" });
        } else if (res.statusCode === 404) {
        res.status(404).json({ error: "Not Found" });
        } else if (res.statusCode === 500) {
        res.status(500).json({ error: "Internal Server Error" });
        } else {
        res.status(500).json({ error: "An error occurred while processing your request." });
        }
    };
  };
  
  export default handleError;
  