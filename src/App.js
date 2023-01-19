import {useEffect, useState} from 'react';
import './App.scss';
import Species from './Species';

const API_URL = 'https://swapi.dev/api/films/';
const SPECIES_IMAGES = {
  droid:
    'https://static.wikia.nocookie.net/starwars/images/f/fb/Droid_Trio_TLJ_alt.png',
  human:
    'https://static.wikia.nocookie.net/starwars/images/3/3f/HumansInTheResistance-TROS.jpg',
  trandoshan:
    'https://static.wikia.nocookie.net/starwars/images/7/72/Bossk_full_body.png',
  wookie:
    'https://static.wikia.nocookie.net/starwars/images/1/1e/Chewbacca-Fathead.png',
  yoda: 'https://static.wikia.nocookie.net/starwars/images/d/d6/Yoda_SWSB.png',
};

/**
 * This map is used to match the species names with the names of the SPECIES_IMAGES constants.
 * I could change directly the name of "yoda" to "Yoda's species" but I wanted to keep SPECIES_IMAGES as it was since
 * it could represent the result from another API for getting the images.
 */
const MAP_IMAGES = {
  Droid: SPECIES_IMAGES.droid,
  Human: SPECIES_IMAGES.human,
  Trandoshan: SPECIES_IMAGES.trandoshan,
  Wookie: SPECIES_IMAGES.wookie,
  "Yoda's species": SPECIES_IMAGES.yoda,
};

// const CM_TO_IN_CONVERSION_RATIO = 2.54; This convertion ratio for cm to in was wrong.
const CM_TO_IN_CONVERSION_RATIO = 0.3937;

/**
 * Takes a film Id, fetches in the API and returns the film object from the API.
 */
const getFilm = async id => {
  if (!id) {
    return undefined;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`);
    return await response.json();
  } catch {
    console.log('There was an error fetching the film.');
    throw new Error('There was an error fetching the film.');
  }
};

/**
 * Takes a film Id, fetches the film in the API, and for each species it fetches in the API.
 * Returns an array of species objects from the film.
 */
const getSpeciesFromFilm = async filmId => {
  if (!filmId) {
    return undefined;
  }

  try {
    const {species} = await getFilm(filmId);
    const fetchSpecies = species.map(
      species => new Promise(resolve => resolve(fetch(species)))
    );

    const responses = await Promise.all(fetchSpecies);
    const payloadResponses = responses.map(
      async response => await response.json()
    );

    return await Promise.all(payloadResponses);
  } catch (error) {
    console.log(
      "There were one or more than one species that couldn't be fetched.",
      error
    );
    throw new Error(error);
  }
};

/**
 * Takes a height in cm represented into a string (first param), and returns the height expresed in inches as a string.
 * Additionally, the second param represents how many decimals will contain the height in inches.
 * Returns "n/a" as result if the first param can not be converted to a number.
 */
export const convertHeight = (heightInCm, decimals = 0) => {
  const value = Number(heightInCm);
  if (isNaN(value)) {
    return 'n/a';
  }
  return `${(heightInCm * CM_TO_IN_CONVERSION_RATIO).toFixed(decimals)}"`;
};

const App = () => {
  const [species, setSpecies] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [somethingWentWrong, setSomethingWentWrong] = useState(false);

  useEffect(() => {
    setIsFetching(true);
    getSpeciesFromFilm(2)
      .then(species => {
        setIsFetching(false);
        setSpecies(species);
      })
      .catch(error => {
        setIsFetching(false);
        setSomethingWentWrong(true);
        console.log('Something went wrong.', error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Empire Strikes Back - Species Listing</h1>
      {isFetching && <h3>Fetching results... </h3>}
      {somethingWentWrong && (
        <h3>Ups! Something went wrong. Please try again later. </h3>
      )}
      <div className="App-species">
        {species &&
          species.map(species => (
            <Species
              key={species.name}
              name={species.name || 'n/a'}
              classification={species.classification || 'n/a'}
              designation={species.designation || 'n/a'}
              height={convertHeight(species.average_height)}
              image={MAP_IMAGES[species.name]}
              numFilms={Array.isArray(species.films) ? species.films.length : 0}
              language={species.language || 'n/a'}
            />
          ))}
      </div>
    </div>
  );
};

export default App;
