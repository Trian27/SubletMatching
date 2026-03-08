import React from 'react'
import ListingPage from "./pages/ListingPage";
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage';
import CardInfo from './pages/CardInfo';

const router = createBrowserRouter([
  {
    path:'/',
    element:<ListingPage/>,
    errorElement: <ErrorPage/>
  },
  {
    path:'/listings/:listingId',
    element:<CardInfo/>
  }
  
]);

const App = () => {
  return (
    <RouterProvider router={router}/>
  )
}

export default App
