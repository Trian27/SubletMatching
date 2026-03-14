import React from 'react'


const CardDescription = ({foundListing}) => {
  return (
        <div className = "flex flex-col gap-6 w-9/10">  
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
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>About this Property</h2>
                <p>
                    Insert description
                </p>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <ul className='grid grid-flow-col grid-rows-3 gap-3 sm:grid-cols-2'>
                    {/* {Object.entries(foundListing.amenities)
                        .filter(([,value]) => value)
                        .map(([key]) => (
                            <li key={key}>{key.replaceAll('_',' ')}</li>
                        )   
                    )} */}
                </ul>
            </div>
        </div>
  )
}

export default CardDescription
