import React from 'react'


const CardDescription = ({foundListing}) => {
  return (
        <div className = "flex flex-col">
            <div>
                <h1>{foundListing.title}</h1>
            </div>
            <div>
                Insert location
            </div>
            <div>
                {foundListing.beds} Bedrooms | X Bathrooms | {foundListing.distance} miles from campus | Available when 
            </div>
            <div>
                About this Property
                <p>
                    Insert description
                </p>
            </div>
            <div>
                <h2>Amenities</h2>
                <ul>
                    {Object.entries(foundListing.amenities)
                        .filter(([key,value]) => value)
                        .map(([key]) => (
                            <li key="key">{key.replaceAll('_',' ')}</li>
                        )   
                    )}
                </ul>
            </div>
        </div>
  )
}

export default CardDescription
