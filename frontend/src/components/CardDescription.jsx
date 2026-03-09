import React from 'react'


const CardDescription = ({foundListing}) => {
  return (
        <div className = "flex flex-col gap-6">  
            <div className='pb-8 mb-6 border-b border-gray-200 flex flex-col gap-6'>
                <div>   
                    <h1 className= "text-3xl font-bold text-gray-900 mb-2" >{foundListing.title}</h1>
                    <h3 className='size-6 text-gray-600 w-auto'>Insert location</h3>   

                </div>
                <div>
                    <h3 className='size-5 text-black-600 w-auto text-lg'>{foundListing.beds} Bedrooms | X Bathrooms | {foundListing.distance} miles from campus</h3>
                </div>
                <div>
                    <h3 className='size-5 text-black-600 w-auto text-lg'>Available when </h3>
                </div>
            </div>          
            <div>
                <h2>About this Property</h2>
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
