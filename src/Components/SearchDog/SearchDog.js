import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactSelect from 'react-select';
import DogDetails from '../DogDetails/DogDetails';
import './SearchDog.css';

const SearchDog = () => {
  // Filter constants
  const [hasSearched, setHasSearched] = useState(false);
  const [dogs, setDogs] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [zipCode, setZipCode] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  // Pagination constants
  const [page, setPage] = useState(1);
  const [results, setResults] = useState(25);
  const [hasMore, setHasMore] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');
  // Favorites constants
  const [favorites, setFavorites] = useState([]);
  const [match, setMatch] = useState(null);

  // Fetch breeds initially for the dropdown
  useEffect(() => {
    fetchBreeds();
  }, []);

  //Can add dogs to favorites
  const addToFavorites = (dog) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.some((favorite) => favorite.id === dog.id)) {
        return prevFavorites.filter((favorite) => favorite.id !== dog.id);
      }
      return [...prevFavorites, dog];
    });
  };

  //Post call to API to pick a match from favorites
  const generateMatch = async () => {
    if (favorites.length === 0) {
      alert('Please add some dogs to your favorites first!');
      return;
    }

    try {
      const dogIds = favorites.map((dog) => dog.id);

      const response = await axios.post(
        'https://frontend-take-home-service.fetch.com/dogs/match',
        dogIds,
        { withCredentials: true }
      );

      const matchedDogId = response.data.match; // Matched dog ID from response
      const matchedDog = favorites.find((dog) => dog.id === matchedDogId);
      setMatch(matchedDog); // Assuming the response contains the matched dog(s)
    } catch (error) {
      console.error('Error generating match:', error);
    }
  };

  //Fetches all the dog breeds
  const fetchBreeds = async () => {
    try {
      const response = await axios.get(
        'https://frontend-take-home-service.fetch.com/dogs/breeds',
        { withCredentials: true }
      );

      // We are converting this to an array of objects so React-Select works
      const breedOptions = response.data.map((breed) => ({
        label: breed,
        value: breed,
      }));
      setBreeds(breedOptions);
    } catch (error) {
      console.error('Error fetching breeds:', error);
    }
  };

  // Fetches the dogs based off filter constants
  const fetchDogs = useCallback(async () => {
    try {
      if (!selectedBreeds.length && !zipCode && !ageMin && !ageMax) {
        setDogs([]);
        setHasMore(false);
        return;
      }
      const params = {
        //filter params
        breeds: selectedBreeds.length ? selectedBreeds : [],
        zipCodes: zipCode ? [zipCode] : [],
        ageMin: ageMin ? [ageMin] : [],
        ageMax: ageMax ? [ageMax] : [],
        //pagination params
        from: (page - 1) * results,
        size: results,
      };

      const searchResponse = await axios.get(
        'https://frontend-take-home-service.fetch.com/dogs/search',
        { params, withCredentials: true }
      );

      if (!searchResponse.data.resultIds?.length) {
        console.warn('No dogs found');
        setDogs([]);
        setHasMore(false);
        return;
      }

      setHasMore(searchResponse.data.resultIds.length === results);

      const dogDetailsResponse = await axios.post(
        'https://frontend-take-home-service.fetch.com/dogs',
        searchResponse.data.resultIds,
        { withCredentials: true }
      );

      // Sort the dogs alphabetically by breed
      const sortedDogs = dogDetailsResponse.data.sort((a, b) => {
        const breedA = a.breed?.trim().toLowerCase() || '';
        const breedB = b.breed?.trim().toLowerCase() || '';

        return sortOrder === 'asc'
          ? breedA.localeCompare(breedB)
          : breedB.localeCompare(breedA);
      });

      setDogs(sortedDogs);
    } catch (error) {
      console.error('Error fetching dogs:', error);
    }
  }, [selectedBreeds, zipCode, ageMin, ageMax, page, results, sortOrder]);

  useEffect(() => {
    if (hasSearched) {
      fetchDogs();
    }
  }, [
    selectedBreeds,
    zipCode,
    ageMin,
    ageMax,
    fetchDogs,
    hasSearched,
    sortOrder,
  ]);

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleBreedChange = (selectedOptions) => {
    setSelectedBreeds(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    );
    setHasSearched(true);
  };

  const handleAgeMinChange = (e) => {
    setAgeMin(e.target.value);
    setHasSearched(true);
  };

  const handleAgeMaxChange = (e) => {
    setAgeMax(e.target.value);
    setHasSearched(true);
  };

  const handleZipChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,5}$/.test(value)) {
      setZipCode(value);
      setHasSearched(true);
    }
  };

  return (
    <div className="dog-selection-container">
      <h1 className="title">Pick your favorite Dog!</h1>

      <div className="breed-input">
        <ReactSelect
          className="breed-dropdown"
          isMulti
          options={breeds}
          value={breeds.filter((breed) => selectedBreeds.includes(breed.value))}
          onChange={handleBreedChange}
          placeholder="Search breeds..."
          closeMenuOnSelect={false}
        />
      </div>

      <div className="input-container">
        <input
          className="age-input"
          type="number"
          placeholder="Enter Age Min"
          value={ageMin}
          onChange={handleAgeMinChange}
        />
      </div>

      <div className="input-container">
        <input
          className="age-input"
          type="number"
          placeholder="Enter Age Max"
          value={ageMax}
          onChange={handleAgeMaxChange}
        />
      </div>

      <div className="input-container">
        <input
          className="zip-input"
          type="number"
          placeholder="Enter ZIP Code"
          value={zipCode}
          onChange={handleZipChange}
          maxLength={5}
        />
      </div>

      {/* Sort Button */}
      <div className="sort-container">
        <button className="sort-button" onClick={toggleSortOrder}>
          Sort {sortOrder === 'asc' ? 'Z-A' : 'A-Z'}
        </button>
      </div>
      {/* Dog List */}
      <div className="dog-list">
        {hasSearched && dogs.length > 0 ? (
          <DogDetails
            key={dogs.id}
            dog={dogs}
            addToFavorites={addToFavorites}
          />
        ) : hasSearched ? (
          <p className="no-dogs-message">No dogs found for this breed.</p>
        ) : null}
      </div>

      <div className="pagination">
        <button
          className="pagination-button"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span className="page-number"> Page {page}</span>
        <button
          className="pagination-button"
          disabled={!hasMore}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* Favorites Section */}
      <div className="favorites">
        <h2>Your Favorites</h2>
        {favorites.length === 0 ? (
          <p>No dogs added to favorites yet.</p>
        ) : (
          <ul>
            {favorites.map((dog) => (
              <li key={dog.id}>
                {dog.name} ({dog.breed})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Generate Match Button */}
      <button className="match-button" onClick={generateMatch}>
        Generate Match
      </button>

      <div className="match-container">
        {match ? (
          <div>
            <h2 className="match-title">Your Perfect Match!</h2>
            <div className="dog-card match-card">
              <img className="dog-image" src={match.img} alt={match.name} />
              <h3 className="dog-name">{match.name}</h3>
              <p className="dog-breed">Breed: {match.breed}</p>
              <p className="dog-age">Age: {match.age} years</p>
              <p className="dog-location">Location: {match.zip_code}</p>
            </div>
          </div>
        ) : (
          <p className="no-match-message">
            Click 'Find Match' to see your best dog match!
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchDog;
