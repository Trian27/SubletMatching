import React from 'react'

const Sidebar = ({foundListing}) => {
  return (
    <div className='bg-gray-100 rounded-2xl p-6 sticky top-24 h-[350px]'>
        <h2 className='text-3xl font-bold text-[#cc0033] mb-6'>
            $2400/month
        </h2>
        <div>
            <h2 className='font-bold'>
                Contact Landlord
            </h2>
            <h3>
                Name
            </h3>
        </div>
        <div>
            <a className='hover:underline break-all' href={`tel:${foundListing.landlordNum}`}>{foundListing.landlordNum}</a>
        </div>
        <div>
            <a className='hover:underline break-all' href={`mailto:${foundListing.landlordEmail}`}>{foundListing.landlordEmail}</a>
        </div>
        <div className='flex flex-col pt-5 gap-5'>
            <button className='w-full bg-[#cc0033] text-white py-3 rounded-lg font-medium hover:bg-[#a80029] transition-colors mb-3'>Request Tour</button>
            <button className='w-full border border-[#cc0033] text-[#cc0033] py-3 rounded-lg font-medium hover:bg-[#cc0033] hover:text-white transition-colors'>Send Message</button>
        </div>
    </div>
  )
}

export default Sidebar
