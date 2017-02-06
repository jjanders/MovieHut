var express = require('express');
var app = express();
var request = require('request');
var ejs = require('ejs');
var fs = require('fs');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var urlencodedBodyParser = bodyParser.urlencoded({extended: false});
app.use(urlencodedBodyParser);
app.use(methodOverride('_method'));
app.set('view_engine', 'ejs');


function getMovieData(){
	var theatreData = fs.readFileSync('./data/data.json', 'utf8');
	return JSON.parse(theatreData);
}
function saveMovieData(newData){
	fs.writeFile('./data/data.json', JSON.stringify(newData));
}

app.get('/', function(req, res){
	res.redirect('/movies');
});

app.get('/movies', function(req, res){
	var movieList = getMovieData().movies;
	res.render('show_movies.ejs', {movies: movieList});
});

app.post('/movies', function(req, res){
	//get title
	var title=req.body.title;
    title=title.replace(/ /g, '+');

	//search for results
	request("http://www.omdbapi.com/?t="+title+"&r=json", function(err, response, body) {
            var movieResponse = JSON.parse(body);
            if(!err){
            //if we get results, render update page
              res.render('new_movie.ejs', {movie: movieResponse})
			}
			else{
				res.redirect('/movies');
			}

    });//look for the movie
});

app.post('/movies/:id', function(req, res){
	var movieID=req.params.id;

	request("http://www.omdbapi.com/?i="+movieID+"&r=json", function(err, response, body) {
            var movieResponse = JSON.parse(body);

            if(!err){
              var movieData = getMovieData();
              var movieList = movieData.movies;
              var newId = parseInt(movieData.movies.length);
              var newMovie={
	 			"id": newId,
	 			"title": movieResponse.Title,
	 			"year": movieResponse.Year,
	 			"rating": movieResponse.Rated, 
	 			"director": movieResponse.Director,
	 			"actors": movieResponse.Actors,
	 			"plot": movieResponse.Plot,
	 			"poster": movieResponse.Poster,
	 			"showtimes": ["3:00", "5:30", "8:45"]
              }
              movieData.movies.push(newMovie);
              movieData.counter = movieData.movies.length;
              saveMovieData(movieData);
              res.redirect('/movies'); 
			}
			else{

			}
			//if we don't get results, return to page

    });//look for the movie
});

app.get('/movies/:id', function(req,res){
	console.log("looking for movie", req.params.id);
	var thisMovie = getMovieData().movies[req.params.id];
	res.render("show_movie_detail.ejs", {movie: thisMovie} );

});

app.get('/movies/:id/edit', function(req,res){
	var movieList=getMovieData();
	var thisMovie = movieList.movies[req.params.id];
	res.render("edit_movie.ejs", {movie: thisMovie} );
});

app.delete('/movies/:id', function(req, res){
	var movieData = getMovieData();
	var movieToDelete = movieData.movies[req.params.id];

	movieData.movies.splice(req.params.id, 1);
	
	movieData.counter=movieData.movies.length;
	for(i=0; i< movieData.movies.length;i++){
		movieData.movies[i].id=i;
	}

	saveMovieData(movieData);
 
    console.log("deleted"+movieToDelete);
	res.redirect('/movies');
});

app.put('/movies/:id', function(req,res){
	var movieData=getMovieData();
	var movieList=movieData.movies;
	var thisMovie = movieList[req.params.id];
	console.log(thisMovie);
	thisMovie["id"]= req.body.id;
	thisMovie["title"] = req.body.title;
	thisMovie["year"]= req.body.year;
	thisMovie["rating"]= req.body.rating; 
	thisMovie["director"]= req.body.director;
	thisMovie["actors"]= req.body.actors;
	thisMovie["plot"]= req.body.plot;
	thisMovie["poster"]= req.body.poster;
	thisMovie["showtimes"] = req.body.showtimes.split(",");
	console.log(thisMovie);
	saveMovieData(movieData);
	res.redirect('/movies');
});

app.listen(3000, function(){
	console.log('listening on port 3000!')
});