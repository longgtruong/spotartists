const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const expressHandlebars = require("express-handlebars");
const fetch = require("node-fetch");


app.use(bodyParser.urlencoded({ extended: true }));
app.engine("handlebars", expressHandlebars());
app.set("view engine", "handlebars");



app.get('/', (req, res) => {
	res.render("layouts/home", {});
});

app.get('/:artisturi', async (req, res) => {
	var id = req.params.artisturi;
	var URIs = [];
	var allSongs = [];
	var releases = [];
	const result = await fetch("https://api.t4ils.dev/artistInfo?artistid=" + id).then(res => res.json()).catch(e => { console.error(e) })
	if (result.success == true) {
		var albums = result.data.releases.albums.releases;
		var singles = result.data.releases.singles.releases;
		albums.forEach(function (album) {
			URIs.push(album.uri);
		})
		singles.forEach(function (single) {
			URIs.push(single.uri);
		})

		for (var i = 0; i < URIs.length; i++) {
			var total = 0;
			var tracks = [];
			const discs = await fetch("https://api.t4ils.dev/albumPlayCount?albumid=" + URIs[i].substring(14)).then(res => res.json()).catch(e => { console.error(e) });
			discs.data.discs.forEach(function (track) {
				allSongs.push(track);
				tracks.push(track);
			})
			releases.push({
				name:discs.data.name,
				tracks: tracks,
				total: total
			})
		}
	} else {
		res.send("didn't get the data! please refresh the page...")
	}


	res.json(releases);

})

app.listen(process.env.PORT || 8080, function () {
	console.log('Express app running on port ' + (process.env.PORT || 8080))
});