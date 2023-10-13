export {} // This file needs to be a module.

interface User {
  id: string
  name: string
}

/**
 * Here we are extending the Express Request interface to include the user object
 * This is useful if you later wish to retrieve the user in your request.
 */
declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}
