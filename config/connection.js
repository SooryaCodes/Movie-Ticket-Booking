const mongoClient = require('mongodb').MongoClient;

const state = {
    db: null
}

module.exports.connect = function (done) {


    // Connection URL
    const url = 'mongodb://localhost:27017';

    // Database Name
    const dbname = 'Movie';

    // Use connect method to connect to the server
    mongoClient.connect(url, { useUnifiedTopology: true },(err, data) => {

        if (err) return done(err)


        state.db = data.db(dbname)

        done()

    });


}


module.exports.get=function(){
    return state.db
}