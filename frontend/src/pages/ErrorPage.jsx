import React from 'react'
import { Link } from 'react-router-dom'


const ErrorPage = () => {
  return (
    <div className='flex flex-col gap-2'>404 Error

        <Link to="/">Home</Link>
    </div>
  )
}

export default ErrorPage
