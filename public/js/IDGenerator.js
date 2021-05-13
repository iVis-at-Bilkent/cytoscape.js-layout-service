let count = 0;
let pre = "_id_";
let post = "_";
function IDGenerator(){
}

IDGenerator.generate = function(){
  let res = pre + count + post;
  count++;
  return res;
};


