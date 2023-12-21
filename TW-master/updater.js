let responses=[];
module.exports.remember = function(response) {
    responses.push(response);
}

module.exports.delete = function() {
    responses=[];
	console.log(responses,"resp delelte");
}

module.exports.update = function(message) {
	let resp1=responses[0];
	let resp2=responses[1];
	
        resp1.write('data: '+ JSON.stringify(message)+'\n\n');
        resp2.write('data: '+ JSON.stringify(message)+'\n\n');
}

