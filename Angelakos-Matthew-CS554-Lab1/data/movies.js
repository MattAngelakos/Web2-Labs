// This data file should export all functions using the ES6 standard as shown in the lecture code
import {movies} from '../config/mongoCollections.js'
import {ObjectId} from 'mongodb'
import{
  atLeast,
  stringCheck,
  objectCheck,
  arrayCheck,
  intCheck,
  numCheck,
  atMost
}from "../helpers.js"
const exportedMethods = {
  async create(
    title,
    cast,
    info,
    plot,
    rating
  ){
    //const nameRegex = /^[A-Za-z\s]+$/;
    const nameRegex = /^([^0-9]*)$/
    const allowedActorKeys = ['firstName', 'lastName'];
    const allowedInfoKeys = ['director', 'yearReleased'];
    let newMovie = {}
    stringCheck(title)
    title = title.trim()
    atLeast(title, 1)
    atMost(title, 255)
    newMovie.title = title
    stringCheck(plot)
    plot = plot.trim()
    atLeast(plot, 8)
    atMost(plot, 8191)
    newMovie.plot = plot
    arrayCheck(cast)
    for(let actor of cast){
      objectCheck(actor)
      const objectKeys = Object.keys(actor);
      if(!(objectKeys.length === allowedActorKeys.length && objectKeys.every(key => allowedActorKeys.includes(key)))){
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
      if(!nameRegex.test(actor.firstName)){
        throw `invalid actor first name ${actor.firstName}`
      }
      if(!nameRegex.test(actor.lastName)){
        throw `invalid actor last name ${actor.lastName}`
      }
    }
    newMovie.cast = cast
    objectCheck(info)
    const infoKeys = Object.keys(info);
    if(!(infoKeys.length === allowedInfoKeys.length && infoKeys.every(key => allowedInfoKeys.includes(key)))){
      throw `invalid info object ${info}`
    }
    stringCheck(info.director)
    info.director = info.director.trim()
    atLeast(info.director, 2)
    atMost(info.director, 25)
    if(!nameRegex.test(info.director)){
      throw `invalid director name ${info.director}`
    }
    if(typeof(info.yearReleased) === 'string'){
      try{
        info.yearReleased = parseInt(info.yearReleased)
      }
      catch(e){
        throw `${info.yearReleased} is not an int`
      }
    }
    numCheck(info.yearReleased)
    intCheck(info.yearReleased)
    const currentTime = new Date()
    const year = currentTime.getFullYear()
    if(info.yearReleased < 1878 || info.yearReleased > year+5){
      throw `invalid film year ${info.yearReleased}`
    }
    newMovie.info = info
    rating = parseFloat(rating)
    numCheck(rating)
    rating = parseFloat(rating.toFixed(1))
    if(rating < 0){
      throw `invalid rating too low: ${rating}`
    }
    if(rating > 5){
      throw `invalid rating too high: ${rating}`
    }
    newMovie.rating = rating
    newMovie.comments = []
    const moviesCollection = await movies();
    const insertInfo = await moviesCollection.insertOne(newMovie);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add product';
    const newId = insertInfo.insertedId.toString();
    const movie = await this.get(newId);
    return movie;
  },

  async getAll(skip, take){
    numCheck(skip)
    intCheck(skip)
    numCheck(take)
    intCheck(take)
    if(skip < 0){
      throw `invalid number for skip: ${skip}`
    }
    if(take < 0){
      throw `invalid number for take: ${take}`
    }
    if(take > 100){
      throw `invalid number for take: ${take}`
    }
    const moviesCollection = await movies()
    let movieList = await moviesCollection.find({}).toArray()
    if (!movieList) throw 'Could not get all movies'
    movieList = movieList.slice(skip, movieList.length);
    if(take <= movieList.length){
      movieList = movieList.slice(0, take)
    }
    return movieList
  },

  async get (movieId){
    stringCheck(movieId)
    movieId = movieId.trim()
    atLeast(movieId, 1)
    if (!ObjectId.isValid(movieId)) throw 'invalid object ID'
    const movieCollection = await movies()
    const findMovie = await movieCollection.findOne({_id: new ObjectId(movieId)})
    if (findMovie === null) throw 'No product with that id'
    return findMovie
  },

  // async remove (productId){
  //   stringCheck(productId)
  //   productId = productId.trim()
  //   atLeast(productId, 1)
  //   if (!ObjectId.isValid(productId)) throw 'invalid object ID'
  //   const productCollectionCollection = await products()
  //   const deletionInfo = await productCollectionCollection.findOneAndDelete({
  //     _id: new ObjectId(productId)
  //   })
  //   if (!deletionInfo) {
  //     throw `Could not delete product with id of ${productId}`
  //   }
  //   return {_id: productId, deleted: true}
  // },

  async update (
    movieId,
    updateObject
  ){
    const movie = await this.get(movieId)
    //const nameRegex = /^[A-Za-z\s]+$/;
    const nameRegex = /^([^0-9]*)$/
    const allowedActorKeys = ['firstName', 'lastName'];
    const allowedInfoKeys = ['director', 'yearReleased'];
    let newMovie = {}
    stringCheck(updateObject.title)
    updateObject.title = updateObject.title.trim()
    atLeast(updateObject.title, 1)
    atMost(updateObject.title, 255)
    newMovie.title = updateObject.title
    stringCheck(updateObject.plot)
    updateObject.plot = updateObject.plot.trim()
    atLeast(updateObject.plot, 8)
    atMost(updateObject.plot, 8191)
    newMovie.plot = updateObject.plot
    arrayCheck(updateObject.cast)
    for(let actor of updateObject.cast){
      objectCheck(actor)
      const objectKeys = Object.keys(actor);
      if(!(objectKeys.length === allowedActorKeys.length && objectKeys.every(key => allowedActorKeys.includes(key)))){
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
      if(!nameRegex.test(actor.firstName)){
        throw `invalid actor first name ${actor.firstName}`
      }
      if(!nameRegex.test(actor.lastName)){
        throw `invalid actor last name ${actor.lastName}`
      }
    }
    newMovie.cast = updateObject.cast
    objectCheck(updateObject.info)
    const infoKeys = Object.keys(updateObject.info);
    if(!(infoKeys.length === allowedInfoKeys.length && infoKeys.every(key => allowedInfoKeys.includes(key)))){
      throw `invalid info object ${updateObject.info}`
    }
    stringCheck(updateObject.info.director)
    updateObject.info.director = updateObject.info.director.trim()
    atLeast(updateObject.info.director, 2)
    atMost(updateObject.info.director, 255)
    if(!nameRegex.test(updateObject.info.director)){
      throw `invalid director name ${updateObject.info.director}`
    }
    if(typeof(updateObject.info.yearReleased) === 'string'){
      try{
        updateObject.info.yearReleased = parseInt(updateObject.info.yearReleased)
      }
      catch(e){
        throw `${updateObject.info.yearReleased} is not an int`
      }
    }
    numCheck(updateObject.info.yearReleased)
    intCheck(updateObject.info.yearReleased)
    const currentTime = new Date()
    const year = currentTime.getFullYear()
    if(updateObject.info.yearReleased < 1878 || updateObject.info.yearReleased > year+5){
      throw `invalid film year ${updateObject.info.yearReleased}`
    }
    newMovie.info = updateObject.info
    updateObject.rating = parseFloat(updateObject.rating)
    numCheck(updateObject.rating)
    updateObject.rating = parseFloat(updateObject.rating.toFixed(1))
    if(updateObject.rating < 0){
      throw `invalid rating too low: ${updateObject.rating}`
    }
    if(updateObject.rating > 5){
      throw `invalid rating too high: ${updateObject.rating}`
    }
    newMovie.comments = movie.comments
    newMovie.rating = updateObject.rating
    const moviesCollection = await movies();
    const updatedInfo = await moviesCollection.findOneAndUpdate(
      {_id: new ObjectId(movieId)},
      {$set: newMovie},
      {returnDocument: 'after'}
    )
    if (!updatedInfo) {
      throw 'could not update product successfully';
    }
    //updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
  }
};
export default exportedMethods;