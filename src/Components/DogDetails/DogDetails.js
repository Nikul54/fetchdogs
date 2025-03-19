import React from 'react';
import './DogDetails.css';

const DogDetails = ({ dog, addToFavorites }) => {
  return (
    <div className="dog-container">
      <div className="dog-list">
        {dog.length > 0 ? (
          dog.map((dog) => (
            <div className="dog-card" key={dog.id}>
              <img className="dog-image" src={dog.img} alt={dog.name} />
              <h3 className="dog-name">{dog.name}</h3>
              <p className="dog-breed">Breed: {dog.breed}</p>
              <p className="dog-age">Age: {dog.age} years</p>
              <p className="dog-location">Location: {dog.zip_code}</p>
              <button onClick={() => addToFavorites(dog)}>Favorite</button>
            </div>
          ))
        ) : (
          <p className="no-dogs-message">No dogs found for this breed.</p>
        )}
      </div>
    </div>
  );
};

export default DogDetails;
