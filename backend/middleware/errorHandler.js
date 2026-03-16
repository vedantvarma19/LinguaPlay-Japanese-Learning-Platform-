const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err); // 👈 log full error on server

  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong"
  });
};

module.exports = errorHandler;
