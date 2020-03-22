const _ = require("lodash");
const api = require("addic7ed-api");
const path = require("path");
const { lstatSync, readdirSync } = require("fs");

const {
	BLACK_LIST: _BLACK_LIST,
	SUBTITLE_LANGUAGE_CODE,
	SUBTITLE_FILENAME_EXTENSION,
	ADDIC7ED_LANGUAGE_CODE,
} = process.env;

const BLACK_LIST = _BLACK_LIST.split(';');
const TV_SOURCE_DIRECTORY = "/tv";

// RegExp
const LAST_NUMBER_RGXP =  /(\d+)(?!.*\d)/;
const NAME_EPISODE_RGXP = /\.[a-z]+$/;
const SEASON_EPISODE_RGXP = /\ S([0-9]+)E([0-9]+)\ /;
const SUBTITLE_RGXP = new RegExp(`\.${SUBTITLE_LANGUAGE_CODE}\.${SUBTITLE_FILENAME_EXTENSION}$`);

function readDirectory(source, options = {}) {
	const files = readdirSync(source);

	if (options.onlyDirectory) {
		const isDirectory = source => lstatSync(source).isDirectory();
		return files.filter(name => isDirectory(path.join(source, name)));
	}

	return files;
}

function getAllEpisodes() {
	const episodes = [];

	readDirectory(TV_SOURCE_DIRECTORY, { onlyDirectory: true }).forEach(showName => {
		const showPath = `${TV_SOURCE_DIRECTORY}/${showName}`;

		if (BLACK_LIST.includes(showName)) return;

		readDirectory(showPath, { onlyDirectory: true }).forEach(seasonName => {
			const seasonPath = `${showPath}/${seasonName}`;
			const seasonNumber = seasonName.match(LAST_NUMBER_RGXP);

			if (!seasonNumber) return;

			const seasonFiles = readDirectory(seasonPath);

			seasonFiles.forEach(episodeFullName => {
				if (episodeFullName.match(SUBTITLE_RGXP)) return;

				const episodeSeasonNumberMatch = episodeFullName.match(
					SEASON_EPISODE_RGXP
				);

				if (!episodeSeasonNumberMatch) return;

				const fileName = episodeFullName.replace(NAME_EPISODE_RGXP, "");
				const episodeName = fileName.split(" - ")[0];

				episodes.push({
					path: seasonPath,
					fileName,
					episodeName,
					downloaded: seasonFiles.includes(`${fileName}.${SUBTITLE_LANGUAGE_CODE}.${SUBTITLE_FILENAME_EXTENSION}`),
					season: Number(episodeSeasonNumberMatch[1]),
					episode: Number(episodeSeasonNumberMatch[2])
				});
			});
		});
	});

	return episodes;
}

const episodes = getAllEpisodes();

episodes
	.filter(e => !e.downloaded)
	.forEach(async episode => {
		let resSearch;

		try {
			resSearch = await api.search(
				episode.episodeName,
				episode.season,
				episode.episode,
				[ADDIC7ED_LANGUAGE_CODE]
			);
		} catch (e) {}

		if (!resSearch || resSearch.length === 0) {
			console.log(
				"Not found : ",
				episode.episodeName,
				episode.season,
				episode.episode
			);
			return;
		}

		console.log(
			"[Search]",
			episode.episodeName,
			episode.season,
			episode.episode,
			`found ${resSearch.length} result(s)`
		);

		// Search most popular subtitle
		const toDownload = _.maxBy(resSearch, o => o.downloads);

		try {
			await api.download(
				toDownload,
				`${episode.path}/${episode.fileName}.${SUBTITLE_LANGUAGE_CODE}.${SUBTITLE_FILENAME_EXTENSION}`
			);
			console.log(
				"[Downloaded]",
				episode.episodeName,
				episode.season,
				episode.episode
			);
		} catch (e) {}
	});
