import React from 'react'
import { useEffect, useMemo, useState} from 'react';
import { useParams } from 'react-router-dom'
import ErrorPage from './ErrorPage';
import { Link } from 'react-router-dom';
import CardDescription from '../components/CardDescription';
import Sidebar from '../components/Sidebar';

const CardInfo = () => {
    const params = useParams();


    const API_URL = "http://localhost:3001";
    
    const [listing, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    fetch(`${API_URL}/listings/${params.listingId}`)
    .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch listings");
        return res.json();
    })
    .then((data) => {
        setListings(data);
        setLoading(false);
    })
    .catch((err) => {
        setError(err.message);
        setLoading(false);
    });
    }, []);
    const foundListing = useMemo(() => {
        return listing;
    }, [listing]);

  if (foundListing){
    const listingImages = foundListing.image;
    return (
    <div className='bg-white'>
        <div className='container mx-auto px-30 py-8'>
            <div className="grid grid-cols-1 gap-8">
                <Link to="/" className="text-lg bold w-auto font-large text-red-600 pl-4">
                    ← Back to Search
                </Link>

                <div className = "flex items-center justify-center">
                    <img className = "w-1/2" src={listingImages} alt={foundListing.title}/>
                </div>
                <div className='grid grid-cols-[2fr_1fr] '>
                    <CardDescription foundListing={foundListing}/>
                    <Sidebar className='col-span-1' foundListing={foundListing}/>
                </div>
            </div>
        </div>
    </div>

    )
  }
  else {
    return <ErrorPage/>
  }
}

export default CardInfo
