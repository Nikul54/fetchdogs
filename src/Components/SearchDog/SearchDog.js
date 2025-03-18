import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactSelect from 'react-select';
import DogDetails from '../DogDetails/DogDetails';
import './SearchDog.css';

const SearchDog = () => {
  // Add filters
  const [hasSearched, setHasSearched] = useState(false);
  const [dogs, setDogs] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [zipCode, setZipCode] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  // Add Pagination
  const [page, setPage] = useState(1);
  const [results, setResults] = useState(25);
  const [hasMore, setHasMore] = useState(true);
  // Sorting state
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch breeds initially
  useEffect(() => {
    fetchBreeds();
  }, []);

  const fetchBreeds = async () => {
    try {
      const response = await axios.get(
        'https://frontend-take-home-service.fetch.com/dogs/breeds',
        { withCredentials: true }
      );
      console.log('FETCHING BREEDS', response.data);

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

        console.log('Comparing Breeds:', breedA, breedB); // For debugging purposes

        return sortOrder === 'asc'
          ? breedA.localeCompare(breedB)
          : breedB.localeCompare(breedA);
      });

      console.log('sorted Dogs & breeds: ', selectedBreeds, sortedDogs);
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
    setHasSearched(true); // Ensures fetchDogs is called only after user interaction
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
          options={breeds} // Options from the API
          value={breeds.filter((breed) => selectedBreeds.includes(breed.value))} // Set the selected breeds
          onChange={handleBreedChange}
          placeholder="Search breeds..."
          closeMenuOnSelect={false} // Allows multiple selections
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

      <div className="dog-list">
        {hasSearched && dogs.length > 0 ? (
          <DogDetails dog={dogs} />
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
    </div>
  );
};

export default SearchDog;
