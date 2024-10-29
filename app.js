require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const flash = require("express-flash");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yml"));

app.use(morgan('dev'))
app.use(flash())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const accountRouter = require("./routes/accountRoutes");
const transactionRouter = require("./routes/transactionRoutes");



app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/transactions", transactionRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;