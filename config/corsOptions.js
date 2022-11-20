const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callBack) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callBack(null, true);
    } else {
      callBack(new Error("not allowed by CORS"));
    }
  },
  optionsSuccesStatus: 200,
  credentials: true,
};

module.exports = corsOptions;
