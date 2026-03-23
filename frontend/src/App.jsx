import ListingPage from "./pages/ListingPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import CardInfo from "./pages/CardInfo";
import RootLayout from "./components/RootLayout";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import AddListingPage from "./pages/AddListingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ListingPage />,
      },
      {
        path: "favorites",
        element: <FavoritesPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "listings/new",
        element: <AddListingPage />,
      },
      {
        path: "listings/:listingId",
        element: <CardInfo />,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
