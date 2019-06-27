var count = 0;
var pre = "_id_";
var post = "_";
function IDGenerator(){
}

IDGenerator.generate = function(){
  var res = pre + count + post;
  count++;
  return res;
};


