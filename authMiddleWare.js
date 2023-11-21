const requireAuth = (req, res, next) => {
    if (req.session.user_id != 12) {
      // User is authenticated, proceed to the next middleware or route handler
      next();
    } else {
      // User is not authenticated, redirect to the login page or another route
      let message = "You do not have access to this page"
      res.redirect('/?message=' + message); // Adjust the URL accordingly
    }
  };

const loginAuth = (req, res, next) => {
if (req.session.user_id !== undefined && req.session.user_id !== null) {
    // User is authenticated, proceed to the next middleware or route handler
    next();
} else {
    // User is not authenticated, redirect to the login page or another route
    let message = "Please, login to access the system"
    res.redirect('/login?message=' + message); // Adjust the URL accordingly
}
};
module.exports = {
    requireAuth, 
    loginAuth}