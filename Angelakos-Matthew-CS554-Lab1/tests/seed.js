import { dbConnection, closeConnection } from "../config/mongoConnection.js";

import { moviesData } from "../data/index.js";

const db = await dbConnection();
await db.collection("movies").drop();

let movie = {
    "title": "Bill and Ted Face the Music",
    "cast": [{"firstName": "Keanu ", "lastName":"Reeves"},{"firstName": "Alex", "lastName":"Winter"}],
    "info": {"director": "Dean Parisot", "yearReleased": 2020},  
    "plot": "Once told they'd save the universe during a time-traveling adventure, 2 would-be rockers from San Dimas, California find themselves as middle-aged dads still trying to crank out a hit song and fulfill their destiny."
}

for (let i = 0; i < 150; i++) {
    try {
        const rating = Math.random() * 5;
        let newMovie = await moviesData.create(
          movie.title,
          movie.cast,
          movie.info,
          movie.plot,
          rating
        );
        console.log(newMovie)
      } catch (e) {
        console.log(e)
    }
}

await closeConnection();