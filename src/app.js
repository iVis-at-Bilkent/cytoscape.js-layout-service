const {port, app} = require('./index.js');

app.listen(process.env.PORT, () => {
    console.log("Listening on " + port);
});
