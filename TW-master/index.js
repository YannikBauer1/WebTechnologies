const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");
const crypto = require("crypto");
const updater=require("./updater.js");
const port = 8199;

const pecasTodas=[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6]];
const pecasED=[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[2,2],[2,3],[2,4],[2,5],[2,6],[3,3],[3,4],[3,5],[3,6],[4,4],[4,5],[4,6],[5,5],[5,6],[6,6]];
let jogosArray=[];
updater.delete();
class jogo{
	constructor(grupo,nick,pass){
	this.group=grupo;
		let g= Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	this.game=g;
		let pecasMonte=[];
		let pecasPlayer1=[];
		let pecasPlayer2=[];
		for (var key of pecasED){
			pecasMonte.push(key);		
		};
		for (let i=0;i<7;i++){
				let x=Math.floor(Math.random()*(28-i));
				pecasPlayer1.push(pecasMonte[x]);
				pecasMonte.splice(x,1);
		};
		for (let i=7;i<14;i++){
				let x=Math.floor(Math.random()*(28-i));
				pecasPlayer2.push(pecasMonte[x]);
				pecasMonte.splice(x,1);
		};
		let pecastab=[];
	this.player1={nick:nick,pass:pass,hand:pecasPlayer1};
	this.player2={hand:pecasPlayer2};
	this.board={line:pecastab,stock:pecasMonte,count:{player1:7,player2:7},piece:[],place:""};
	this.winner="";
	this.turn="";
	};
};

const server = http.createServer((request,response)=> {
	const preq = url.parse(request.url,true);
	const pathname= preq.pathname;
	const query = preq.query;
	let answer={};

	switch(request.method){
	case "GET":
		answer=doGet(pathname,request,response,query);
		break;
	case "POST":
		doPost(pathname,request,response);
	}

	switch(request.url){
		case'/style.css':
			response.writeHead(200,{'Content-Type': "text/css"});
			fs.readFile("./style.css",function(err,data){
				response.end(data);
			})
			break;
		case '/js.js':
			response.writeHead(200,{'Content-type': 'text/js'});
			fs.readFile("./js.js",function(err,data){
				response.end(data);
			})
			break;
		case '/':
			fs.readFile("./index.html",function(err,data){
				response.end(data);
			})
			break;
	}
	if (answer.style=="sse"){
		response.writeHead(200,{'Access-Control-Allow-Origin':'*','Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
		if(jogosArray[0].player2.nick!=null){updater.update(answer);}
	}
	//response.setHeader('Access-Control-Allow-Origin','*');
	//response.writeHead(200);
	});
server.listen(port);

function doGet(pathname,request,response,query){
	let answer={};
	switch(pathname){
		case "/update":
			let nick=query.nick;
			let game=query.game;
			for (i of jogosArray){
				if(i.game==game){
					if(i.player1.nick!=null && i.player2.nick!=null){
						//response.writeHead(200,{'Access-Control-Allow-Origin':'*','Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
						//i.player2.resp=response;
						let x=Math.floor(Math.random()*(2));
						if (x==0){answer={board:{count:i.board.count,stock:i.board.stock.length,piece:i.board.piece,place:i.board.place,line:i.board.line},turn:i.player1.nick}}
							else{answer={board:{count:i.board.count,stock:i.board.stock.length,piece:i.board.piece,place:i.board.place,line:i.board.line},turn:i.player2.nick}};
						updater.remember(response);
						//response.writeHead(200,{'Access-Control-Allow-Origin':'*','Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
						//response.write('data: '+ JSON.stringify(answer)+'\n\n');
						answer.style="sse";
						//response.writeHead(200,{'Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
						//response.write('data: '+JSON.stringify(answer)+'\n\n');
						//let resp1=i.player1.resp;
						//let resp2=i.player2.resp;
						//console.log(resp1.url,"    ",resp2.url);
						//resp1.writeHead(200,{'Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
						//resp1.write('data: '+JSON.stringify(answer)+'\n\n');
						//resp2.writeHead(200,{'Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
						//resp2.write('data: '+JSON.stringify(answer)+'\n\n');
					} else{
						//response.writeHead(200,{'Access-Control-Allow-Origin':'*','Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
						updater.remember(response);
						answer.style="sse";
						//response.writeHead(200,{'Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
						//i.player1.resp=response;
						//response.writeHead(200,{'Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
						//response.write('data: '+JSON.stringify(answer)+'\n\n');
						//console.log(response.url,"url response");
						//response.end(JSON.stringify(answer));
					}
				}
			}
	}
	return answer;	
};

function doPost(pathname,request,response){
	let answer ={};
	switch(pathname){
		case "/register":
			register(request,response);
			break;
		case "/ranking":
			ranking(request,response);
			break;
		case "/join":
			join(request,response);
			break;
		case "/leave":
			leave(request,response);
			break;
		case "/notify":
			notify(request,response);
			break;
		default:
			console.log("default");
			answer.status=400;
			break;
	}
};

function register(request,response){
	let answer={}
	request.on("data",function aj(data){

		let parsed_data =JSON.parse(data);

		let nick = parsed_data.nick;
		//let pass = parsed_data.pass;
		const pass = crypto.createHash('md5').update(parsed_data.pass).digest('hex');

		var text = JSON.parse(fs.readFileSync("utilizadores.txt","utf8"));
		for (let i of text){
			if(i.nick === nick && i.pass === pass){
				answer={};
				response.end(JSON.stringify(answer));
				return;
			}
		}
		for (let i of text){
			if(i.nick === nick && i.pass !== pass){
				answer={"error":"User registered with a different password"};
				response.end(JSON.stringify(answer));
				return;
			}
		}
		parsed_data.pass=pass;
		text.push(parsed_data);
		fs.writeFileSync("utilizadores.txt",JSON.stringify(text),(err)=>{});
		answer={};
		response.end(JSON.stringify(answer));
	})
	
};
function ranking(request,response){
	var text = fs.readFileSync("ranking.txt","utf8");
	response.end(text);
};
function join(request,response){
	request.on("data",function aj(data){
		let parsed_data =JSON.parse(data);
		let g= parsed_data.group;
		for (let i of jogosArray){
			if (i.group==g){
				i.player2.nick=parsed_data.nick;
				i.player2.pass=parsed_data.pass;
				let answer={game:i.game,hand:i.player2.hand};
				response.end(JSON.stringify(answer));
				return;
			};
		};
		jog = new jogo(parsed_data.group,parsed_data.nick,parsed_data.pass);
		let answer={game:jog.game,hand:jog.player1.hand};
		jogosArray.push(jog);
		response.end(JSON.stringify(answer));

	})
};
function leave(request,response){
	let answer={};
	request.on("data",function aj(data){
		let parsed_data =JSON.parse(data);
		let g = parsed_data.game;
		let player=parsed_data.nick;
		let gameObjekt={};
		for (i of jogosArray){
			if(i.game==g){
				gameObjekt=i;
				if(i.player2.nick!=null){
					if(i.player1.nick==player){i.winner=i.player2.nick;}
						else{i.winner=i.player1.nick;};
					//response.end(JSON.stringify(answer));
					let d={winner:i.winner};
					updater.update(d);
					updater.delete();
					//let resp1=i.player1.resp;
					//let resp2=i.player2.resp;
					//console.log(resp1.url,"   ",resp2.url);
					//resp1.writeHead(200,{'Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
					//resp1.write('data: '+JSON.stringify(d)+'\n\n');
					//resp2.writeHead(200,{'Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
					//resp2.write('data: '+JSON.stringify(d)+'\n\n');
				}else{
					i.winner=null;
					//response.end(JSON.stringify(answer));
					let d={winner:null};
					updater.update(d);
					updater.delete();
					//let resp=i.player1.resp;
					//resp.writeHead(200,{'Content-Type': "text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
					//resp.write('data: '+JSON.stringify(d)+'\n\n');
				}
			}
		};
		let n = jogosArray.indexOf(gameObjekt);
		jogosArray.splice(n,1);		
	})
};

function notify(request,response){
	let answer={};
	request.on("data",function aj(data){
		let parsed_data =JSON.parse(data);
		let g = parsed_data.game;
		for (i of jogosArray){
			if(i.game==g){
				if (parsed_data.skip===null){
					console.log("passar jogada");
					response.end(JSON.stringify(answer));
					let d={};
					console.log(i.board.count);
					if (parsed_data.nick==i.player1.nick){
						d={turn:i.player2.nick,board:{count:i.board.count,stock:i.board.stock.length,piece:i.board.piece,place:i.board.place,line:i.board.line}}
					}else{
						d={turn:i.player1.nick,board:{count:i.board.count,stock:i.board.stock.length,piece:i.board.piece,place:i.board.place,line:i.board.line}};
					}
					updater.update(d);
				}else if(parsed_data.piece===null){
					let n= i.board.stock.length;
					let x=Math.floor(Math.random()*(n));
					let p=i.board.stock[x];
					answer={piece:p};
					response.end(JSON.stringify(answer));
					let ind =i.board.stock.indexOf(p);
					i.board.stock.splice(ind,1);
					if (parsed_data.nick==i.player1.nick){i.player1.hand.push(p);
						let num=i.board.count.player1;
						i.board.count.player1=num+1;
					}else{i.player2.hand.push(p);
						let num=i.board.count.player2;
						i.board.count.player2=num+1;};
					let da={};
					if (parsed_data.nick==i.player1.nick){da={turn:i.player1.nick,board:{count:i.board.count,stock:i.board.stock.length,piece:i.board.piece,place:i.board.place,line:i.board.line}}
					}else{da={turn:i.player2.nick,board:{count:i.board.count,stock:i.board.stock.length,piece:i.board.piece,place:i.board.place,line:i.board.line}}};
					updater.update(da);
				}else{
					response.end(JSON.stringify(answer));
					let p=parsed_data.piece;
					if (parsed_data.nick==i.player1.nick){
						let num=i.board.count.player1;
						i.board.count.player1=num-1;
						let ind=i.player1.hand.indexOf(p);
						i.player1.hand.splice(ind,1);
					}else{
						let num=i.board.count.player2;
						i.board.count.player2=num-1;
						let ind=i.player2.hand.indexOf(p);
						i.player2.hand.splice(ind,1);
					};
					if(parsed_data.side=="start"){
						let l=i.board.line;
						l.unshift(p);
						i.board.line=l}
					else if(parsed_data.side=="end"){
						let l=i.board.line;
						l.push(p);
						i.board.line=l};
					if(i.board.count.player1==0){
						let daaa={winner:i.player1.nick};
						updater.update(daaa);
						updater.delete();
						jogosArray=[];
						return
					}else if(i.board.count.player2==0){
						let daaaa={winner:i.player2.nick};
						updater.update(daaaa);
						updater.delete();
						jogosArray=[];
						return
					}
					let daa={};
					if (parsed_data.nick==i.player1.nick){
						daa ={turn:i.player2.nick,board:{count:i.board.count,stock:i.board.stock.length,piece:p,place:i.board.place,line:i.board.line}};
					}else{
						daa ={turn:i.player1.nick,board:{count:i.board.count,stock:i.board.stock.length,piece:p,place:i.board.place,line:i.board.line}};
					}
					updater.update(daa);	
				}
			}
		};
	});
}
