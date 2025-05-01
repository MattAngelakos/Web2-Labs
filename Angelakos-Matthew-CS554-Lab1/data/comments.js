import {movies} from '../config/mongoCollections.js'
import {ObjectId} from 'mongodb'
import{
  atLeast,
  atMost,
  stringCheck
}from "../helpers.js"
import {moviesData} from '../data/index.js';
const exportedMethods = {
  async createComment(
    movieId,
    name,
    comment
  ){
    //const nameRegex = /^[A-Za-z\s]+$/;
    const nameRegex = /^([^0-9]*)$/
    let x = new ObjectId()
    let newMovie = await moviesData.get(movieId)
    let newComment = {
      _id: x
    }
    stringCheck(comment)
    comment = comment.trim()
    atLeast(comment, 2)
    atMost(comment, 8191)
    newComment.comment = comment
    stringCheck(name)
    name = name.trim()
    atLeast(name, 2)
    atMost(name, 255)
    newComment.name = name
    if(!nameRegex.test(name)){
      throw `invalid name ${name}`
   }
    newMovie.comments.push(newComment)
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
  },

  async remove (movieId, commentId){
    let newMovie = await moviesData.get(movieId)
    commentId = commentId.trim()
    atLeast(commentId, 1)
    if (!ObjectId.isValid(commentId)) throw 'invalid object ID'
    const length = newMovie.comments.length
    newMovie.comments = newMovie.comments.filter(item => {
      let id = item._id.toString()
      return id !== commentId
    });
    if (length === newMovie.comments.length){
      throw 'id does not exist'
    }
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
  },
};
export default exportedMethods;

