// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!
import { Router } from 'express';
import { ObjectId } from 'mongodb'
import { commentsData, moviesData } from '../data/index.js';

const router = Router();
import {
  stringCheck,
  atLeast,
  arrayCheck,
  objectCheck,
  numCheck,
  intCheck,
  atMost
} from '../helpers.js';
const hasLetter = /[a-zA-Z]/;
router
  .route('/')
  .get(async (req, res) => {
    try {
      let skip = req.query.skip;
      let take = req.query.take;
      let given = true
      if (skip === undefined) {
        skip = 0;
        given = false
      }
      if (take === undefined) {
        take = 20;
      }
      if (skip === '') {
        throw 'skip is missing a value';
      }
      if (take === '') {
        throw 'take is missing a value';
      }
      if (isNaN(skip)) {
        throw 'skip must be a valid integer';
      }
      if (isNaN(take)) {
        throw 'take must be a valid integer';
      }
      skip = parseInt(skip);
      take = parseInt(take);
      if(given){
        if (skip < 1) {
          throw `Skip too low: ${skip}`;
        }
      }
      if (take < 1 || take > 100) {
        throw `Take should be between 1 and 100`;
      }
      const movieList = await moviesData.getAll(skip, take);
      return res.status(200).json(movieList);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  })
  .post(async (req, res) => {
    let movieData = req.body;
    if (!movieData || Object.keys(movieData).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' })
    }
    //check all inputs, that should respond with a 400
    let title, plot, cast, info, rating
    try {
      //const nameRegex = /^[A-Za-z\s]+$/;
      const nameRegex = /^([^0-9]*)$/
      const allowedActorKeys = ['firstName', 'lastName'];
      const allowedInfoKeys = ['director', 'yearReleased'];
      title = movieData.title
      plot = movieData.plot
      cast = movieData.cast
      info = movieData.info
      rating = movieData.rating
      stringCheck(title)
      title = title.trim()
      atLeast(title, 1)
      atMost(title, 255)
      stringCheck(plot)
      plot = plot.trim()
      atLeast(plot, 8)
      atMost(plot, 8191)
      if (!hasLetter.test(plot)) {
        throw `invalid plot no letters ${plot}`
      }
      arrayCheck(cast)
      for (let actor of cast) {
        objectCheck(actor)
        const objectKeys = Object.keys(actor)
        if (!(objectKeys.length === allowedActorKeys.length && objectKeys.every(key => allowedActorKeys.includes(key)))) {
          throw `invalid actor object ${actor}`
        }
        stringCheck(actor.firstName)
        stringCheck(actor.lastName)
        actor.firstName = actor.firstName.trim()
        actor.lastName = actor.lastName.trim()
        atLeast(actor.firstName, 2)
        atLeast(actor.lastName, 2)
        atMost(actor.firstName, 25)
        atMost(actor.lastName, 25)
        if (!nameRegex.test(actor.firstName)) {
          throw `invalid actor first name ${actor.firstName}`
        }
        if (!nameRegex.test(actor.lastName)) {
          throw `invalid actor last name ${actor.lastName}`
        }
      }
      objectCheck(info)
      const infoKeys = Object.keys(info);
      if (!(infoKeys.length === allowedInfoKeys.length && infoKeys.every(key => allowedInfoKeys.includes(key)))) {
        throw `invalid info object ${info}`
      }
      stringCheck(info.director)
      info.director = info.director.trim()
      atLeast(info.director, 2)
      atMost(info.director, 25)
      if (!nameRegex.test(info.director)) {
        throw `invalid director name ${info.director}`
      }
      if (typeof (info.yearReleased) === 'string') {
        try {
          const parsed = parseInt(info.yearReleased, 10)
          if (isNaN(parsed) || !Number.isInteger(Number(info.yearReleased))) {
            throw "Input must be an integer."
          }
          info.yearReleased = parsed
        }
        catch (e) {
          throw `year released is not an int`
        }
      }
      numCheck(info.yearReleased)
      intCheck(info.yearReleased)
      const currentTime = new Date()
      const year = currentTime.getFullYear()
      if (info.yearReleased < 1878 || info.yearReleased > year + 5) {
        throw `invalid film year ${info.yearReleased}`
      }
      if (typeof (rating) === 'string') {
        try {
          rating= parseFloat(rating)
        }
        catch (e) {
          throw `rating is not a num`
        }
      }
      numCheck(rating)
      rating = rating.toFixed(1)
      if (rating < 0) {
        throw `invalid rating too low: ${rating}`
      }
      if (rating > 5) {
        throw `invalid rating too high: ${rating}`
      }
    } catch (e) {
      console.log(e)
      return res.status(400).json({ error: e });
    }
    //insert the post
    try {
      let newMovie = await moviesData.create(
        title,
        cast,
        info,
        plot,
        rating
      );
      return res.status(200).json(newMovie);
    } catch (e) {
      console.log(e)
      return res.status(500).json({ error: e });
    }
  });

router
  .route('/:id')
  .get(async (req, res) => {
    //check inputs that produce 400 status
    try {
      stringCheck(req.params.id)
      req.params.id = req.params.id.trim()
      atLeast(req.params.id, 1)
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try getting the post by ID
    try {
      const movie = await moviesData.get(req.params.id);
      return res.status(200).json(movie);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .patch(async (req, res) => {
    try {
      stringCheck(req.params.id)
      req.params.id = req.params.id.trim()
      atLeast(req.params.id, 1)
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    let movie
    try {
      movie = await moviesData.get(req.params.id);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
    let movieData = req.body;
    if (!movieData || Object.keys(movieData).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' })
    }
    //check all inputs, that should respond with a 400
    let title, plot, cast, info, rating
    try {
      //const nameRegex = /^[A-Za-z\s]+$/;
      const nameRegex = /^([^0-9]*)$/
      const allowedActorKeys = ['firstName', 'lastName'];
      const allowedInfoKeys = ['director', 'yearReleased'];
      title = movieData.title
      plot = movieData.plot
      cast = movieData.cast
      info = movieData.info
      rating = movieData.rating
      if (title !== undefined) {
        stringCheck(title)
        title = title.trim()
        atLeast(title, 1)
        atMost(title, 255)
      }
      else {
        title = movie.title
      }
      if (plot !== undefined) {
        stringCheck(plot)
        plot = plot.trim()
        atLeast(plot, 8)
        atMost(plot, 8191)
        if (!hasLetter.test(plot)) {
          throw `invalid plot no letters ${plot}`
        }
      } else {
        plot = movie.plot
      }
      if (cast !== undefined) {
        arrayCheck(cast)
        for (let actor of cast) {
          objectCheck(actor)
          const objectKeys = Object.keys(actor)
          if (!(objectKeys.length === allowedActorKeys.length && objectKeys.every(key => allowedActorKeys.includes(key)))) {
            throw `invalid actor object ${actor}`
          }
          stringCheck(actor.firstName)
          stringCheck(actor.lastName)
          actor.firstName = actor.firstName.trim()
          actor.lastName = actor.lastName.trim()
          atLeast(actor.firstName, 2)
          atLeast(actor.lastName, 2)
          atMost(actor.firstName, 25)
          atMost(actor.lastName, 25)
          if (!nameRegex.test(actor.firstName)) {
            throw `invalid actor first name ${actor.firstName}`
          }
          if (!nameRegex.test(actor.lastName)) {
            throw `invalid actor last name ${actor.lastName}`
          }
        }
      }
      else {
        cast = movie.cast
      }
      if (info !== undefined) {
        objectCheck(info)
        const infoKeys = Object.keys(info);
        if (!(infoKeys.length === allowedInfoKeys.length && infoKeys.every(key => allowedInfoKeys.includes(key)))) {
          throw `invalid info object ${info}`
        }
        stringCheck(info.director)
        info.director = info.director.trim()
        atLeast(info.director, 2)
        atMost(info.director, 25)
        if (!nameRegex.test(info.director)) {
          throw `invalid director name ${info.director}`
        }
        if (typeof (info.yearReleased) === 'string') {
          try {
            info.yearReleased = parseInt(info.yearReleased)
          }
          catch (e) {
            throw `${info.yearReleased} is not an int`
          }
        }
        numCheck(info.yearReleased)
        intCheck(info.yearReleased)
        const currentTime = new Date()
        const year = currentTime.getFullYear()
        if (info.yearReleased < 1878 || info.yearReleased > year + 5) {
          throw `invalid film year ${info.yearReleased}`
        }
      }
      else {
        info = movie.info
      }
      if (rating !== undefined) {
        if (typeof (rating) === 'string') {
          try {
            rating= parseFloat(rating)
          }
          catch (e) {
            throw `rating is not a num`
          }
        }
        numCheck(rating)
        rating = rating.toFixed(1)
        if (rating < 0) {
          throw `invalid rating too low: ${rating}`
        }
        if (rating > 5) {
          throw `invalid rating too high: ${rating}`
        }
      }
      else {
        rating = movie.rating
      }
    } catch (e) {
      console.log(e)
      return res.status(400).json({ error: e });
    }
    //insert the post
    const updateObj = {
      title: title,
      plot: plot,
      cast: cast,
      info: info,
      rating: rating
    }
    try {
      let newMovie = await moviesData.update(
        req.params.id,
        updateObj
      );
      return res.status(200).json(newMovie);
    } catch (e) {
      console.log(e)
      return res.status(500).json({ error: e });
    }
  })
  .put(async (req, res) => {
    try {
      stringCheck(req.params.id)
      req.params.id = req.params.id.trim()
      atLeast(req.params.id, 1)
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    let movieData = req.body;
    if (!movieData || Object.keys(movieData).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' })
    }
    let movie
    try {
      movie = await moviesData.get(req.params.id);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
    //check all inputs, that should respond with a 400
    let title, plot, cast, info, rating
    try {
      //const nameRegex = /^[A-Za-z\s]+$/;
      const nameRegex = /^([^0-9]*)$/
      const allowedActorKeys = ['firstName', 'lastName'];
      const allowedInfoKeys = ['director', 'yearReleased'];
      title = movieData.title
      plot = movieData.plot
      cast = movieData.cast
      info = movieData.info
      rating = movieData.rating
      stringCheck(title)
      title = title.trim()
      atLeast(title, 1)
      atMost(title, 255)
      stringCheck(plot)
      plot = plot.trim()
      atLeast(plot, 8)
      atMost(plot, 8191)
      if (!hasLetter.test(plot)) {
        throw `invalid plot no letters ${plot}`
      }
      arrayCheck(cast)
      for (let actor of cast) {
        objectCheck(actor)
        const objectKeys = Object.keys(actor)
        if (!(objectKeys.length === allowedActorKeys.length && objectKeys.every(key => allowedActorKeys.includes(key)))) {
          throw `invalid actor object ${actor}`
        }
        stringCheck(actor.firstName)
        stringCheck(actor.lastName)
        actor.firstName = actor.firstName.trim()
        actor.lastName = actor.lastName.trim()
        atLeast(actor.firstName, 1)
        atLeast(actor.lastName, 1)
        atMost(actor.firstName, 25)
        atMost(actor.lastName, 25)
        if (!nameRegex.test(actor.firstName)) {
          throw `invalid actor first name ${actor.firstName}`
        }
        if (!nameRegex.test(actor.lastName)) {
          throw `invalid actor last name ${actor.lastName}`
        }
      }
      objectCheck(info)
      const infoKeys = Object.keys(info);
      if (!(infoKeys.length === allowedInfoKeys.length && infoKeys.every(key => allowedInfoKeys.includes(key)))) {
        throw `invalid info object ${info}`
      }
      stringCheck(info.director)
      info.director = info.director.trim()
      atLeast(info.director, 2)
      atMost(info.director, 25)
      if (!nameRegex.test(info.director)) {
        throw `invalid director name ${info.director}`
      }
      if (typeof (info.yearReleased) === 'string') {
        try {
          info.yearReleased = parseInt(info.yearReleased)
        }
        catch (e) {
          throw `${info.yearReleased} is not an int`
        }
      }
      numCheck(info.yearReleased)
      intCheck(info.yearReleased)
      const currentTime = new Date()
      const year = currentTime.getFullYear()
      if (info.yearReleased < 1878 || info.yearReleased > year + 5) {
        throw `invalid film year ${info.yearReleased}`
      }
      if (typeof (rating) === 'string') {
        try {
          rating= parseFloat(rating)
        }
        catch (e) {
          throw `rating is not a num`
        }
      }
      numCheck(rating)
      rating = rating.toFixed(1)
      if (rating < 0) {
        throw `invalid rating too low: ${rating}`
      }
      if (rating > 5) {
        throw `invalid rating too high: ${rating}`
      }
    } catch (e) {
      console.log(e)
      return res.status(400).json({ error: e });
    }
    //insert the post
    const updateObj = {
      title: title,
      plot: plot,
      cast: cast,
      info: info,
      rating: rating
    }
    try {
      let newMovie = await moviesData.update(
        req.params.id,
        updateObj
      );
      return res.status(200).json(newMovie);
    } catch (e) {
      console.log(e)
      return res.status(500).json({ error: e });
    }
  });

router
  .route('/:id/comments')
  .post(async (req, res) => {
    try {
      stringCheck(req.params.id)
      req.params.id = req.params.id.trim()
      atLeast(req.params.id, 1)
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    let movieData = req.body;
    if (!movieData || Object.keys(movieData).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' })
    }
    let comment
    let name
    try {
      //const nameRegex = /^[A-Za-z\s]+$/;
      const nameRegex = /^([^0-9]*)$/
      try {
        await moviesData.get(req.params.id);
      } catch (e) {
        return res.status(404).json({ error: e });
      }
      comment = movieData.comment
      name = movieData.name
      stringCheck(comment)
      comment = comment.trim()
      if(!hasLetter.test(comment)){
        throw `invalid comment no letters`
      }
      atLeast(comment, 2)
      atMost(comment, 8191)
      stringCheck(name)
      name = name.trim()
      atLeast(name, 2)
      atMost(name, 25)
      if (!nameRegex.test(name)) {
        throw `invalid name ${name}`
      }
    } catch (e) {
      console.log(e)
      return res.status(400).json({ error: e });
    }
    try {
      let newMovie = await commentsData.createComment(req.params.id, name, comment)
      return res.status(200).json(newMovie);
    } catch (e) {
      console.log(e)
      return res.status(500).json({ error: e });
    }
  });
router
  .route('/:movieId/:commentId')
  .delete(async (req, res) => {
    //code here for DELETE
    try {
      stringCheck(req.params.movieId)
      req.params.reviewId = req.params.movieId.trim()
      atLeast(req.params.movieId, 1)
      try {
        const movie = await moviesData.get(req.params.movieId);
        const length = movie.comments.length
        movie.comments = movie.comments.filter(item => {
          let id = item._id.toString()
          return id !== req.params.commentId
        });
        if (length === movie.comments.length){
          throw 'id does not exist'
        }
      } catch (e) {
        console.log(e)
        return res.status(404).json({ error: e });
      }
      if (!ObjectId.isValid(req.params.commentId)) throw 'invalid object ID';
      stringCheck(req.params.commentId)
      req.params.reviewId = req.params.commentId.trim()
      atLeast(req.params.commentId, 1)
      if (!ObjectId.isValid(req.params.commentId)) throw 'invalid object ID';
    } catch (e) {
      console.log(e)
      return res.status(400).json({ error: e });
    }
    try {
      const updatedInfo = await commentsData.remove(req.params.movieId, req.params.commentId)
      return res.status(200).json(updatedInfo);
    }
    catch (e) {
      console.log(e)
      return res.status(500).json({ error: e });
    }
  });

export default router;