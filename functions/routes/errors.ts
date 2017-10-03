import * as debug from "debug"

export const error = (err, req, res, next) => {
  console.log("Error object: " + JSON.stringify(err, null, 2));
  if (res.headersSent) {
    console.log("Headers already sent. Continue request ...")
    return next(err)
  }

  const statusCode = err.status || 500;
  const locals:any = {
    title: `HTTP ${statusCode}`,
    message: err.message || "Something went wrong..."
  };

  if (req.app.get('env') === 'development') {
    locals.stackTrace = err.stack;
  }

  res.status(statusCode);
  res.render('error', locals);
};

export const notFound = (req, res, next) => {
  next({
    message: "Not found",
    status: 404
  });
};