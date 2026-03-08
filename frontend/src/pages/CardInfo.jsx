import React from 'react'
import { useParams } from 'react-router-dom'
import listings from '../data/listings';
import ErrorPage from './ErrorPage';
import { Link } from 'react-router-dom';
import CardDescription from '../components/CardDescription';

const CardInfo = () => {
  const params = useParams();
  const foundListing = listings.find(listing => listing.id == params.listingId)

  if (foundListing){
    const listingImages = foundListing.image;
    return (
    <>
        <div className='container mx-auto px-4 py-8'>
            <Link to="/" className="text-med font-large text-red-600 pl-4">
                ← Back to Search
            </Link>

            <div className = "flex items-center justify-center">
                <img className = "max-w-md max-h-48" src={listingImages} alt={foundListing.title}/>
            </div>
            <CardDescription foundListing={foundListing}/>
        </div>
    </>

    )
  }
  else {
    return <ErrorPage/>
  }
}

export default CardInfo
