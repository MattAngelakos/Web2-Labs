//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
/* Todo: Implment any helper functions below 
    and then export them for use in your other files.
*/

import { ObjectId } from "mongodb";

//import axios from 'axios';
let numCheck = (num) => {
    if (typeof(num) !== 'number'){
        throw (`${num} is not a number`);
    }
    if(isNaN(num)){
        throw (`${num} is not a number`);
    }
};
let intCheck = (num) => {
    if(!Number.isInteger(num)){
        throw (`${num} is not an integer`);
    }
};
let objectCheck = (val) => {
    if (typeof(val) !== 'object'){
        throw (`${val} is not a object`);
    }
};
let arrayCheck = (val) => {
    if(!Array.isArray(val)){
        throw (`${val} is not an array`);
    }
};
let atLeast = (val, checkVal) => {
    if(val.length < checkVal){
        throw (`${val} has less than ${checkVal} elements`);
    }
};
let atMost = (val, checkVal) => {
    if(val.length > checkVal){
        throw (`${val} has more than ${checkVal}  elements`);
    }
};
let functionCheck = (val) => {
    if (typeof(val) !== 'function'){
        throw (`${val} is not a function`);
    }
}
let stringCheck = (val) => {
    if (typeof(val) !== 'string'){
        throw (`${val} is not a string`);
    }
}
let keyCheck = (val) => {
    if (Object.keys(val).length === 0) {
        throw (`${val} is empty`);
    }
}
let notArrayCheck = (val) => {
    if(Array.isArray(val)){
        throw (`${val} is an array`);
    }
};
const maxDecimal = (val, num) => {//modified stackoverflow https://stackoverflow.com/questions/69782313/how-to-validate-a-number-has-a-2-decimal-place-precision-with-javascript
    if(!(String(val).split(".")[1]?.length <= num)){
        throw 'Too many decimal places'
    }
}
const booleanCheck = (val) => {
    if (typeof(val) !== 'boolean'){
        throw ('${val} is not a string');
    }
}
const checkId = (id) =>{
    if (!id) throw 'Error: You must provide an id to search for';
    if (typeof id !== 'string') throw 'Error: id must be a string';
    id = id.trim();
    if (id.length === 0)
      throw 'Error: id cannot be an empty string or just spaces';
    return id;
}

export{
    numCheck,
    intCheck,
    objectCheck,
    arrayCheck,
    atLeast,
    functionCheck,
    stringCheck,
    keyCheck,
    notArrayCheck,
    maxDecimal,
    booleanCheck,
    checkId,
    atMost
};