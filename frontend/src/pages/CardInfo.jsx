import React from 'react'
import { useParams } from 'react-router-dom'
import listings from '../data/listings';
import ErrorPage from './ErrorPage';

const CardInfo = () => {
  const params = useParams();
  const foundListing = listings.find(listing => listing.id == params.listingId)

  if (foundListing){
    return (
    
    <div className='flex flex-col gap-2'>
        CardInfo
        <div>{foundListing.beds}</div>
        
    </div>
    )
  }
  else {
    return <ErrorPage/>
  }
}

export default CardInfo
