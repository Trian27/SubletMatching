import { Link, useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import CardDescription from "../components/CardDescription";
import Sidebar from "../components/Sidebar";
import ListingImageGallery from "../components/ListingImageGallery";
import { useListings } from "../context/ListingsContext";
import { useAuth } from "../context/AuthContext";
import { deleteListing, updateListing } from "../api/listingsApi";

const CardInfo = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { getListingById, updateListing: updateListingInState, removeListing } =
    useListings();
  const foundListing = getListingById(params.listingId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const accessToken = session?.access_token ?? null;

  const isOwner =
    Boolean(session?.user?.id) &&
    Boolean(foundListing?.host_id) &&
    String(session.user.id) === String(foundListing.host_id);
  const canShowActions = Boolean(accessToken) && isOwner;

  const initialEditValues = useMemo(() => {
    if (!foundListing) return null;
    return {
      title: foundListing.title ?? "",
      price: String(foundListing.price ?? ""),
      description: foundListing.description ?? "",
    };
  }, [foundListing]);

  if (foundListing) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-[1600px] px-6 py-8">
          <div className="grid grid-cols-1 gap-8">
            <Link to="/" className="w-fit text-lg font-medium text-red-600">
              ← Back to Search
            </Link>

            <div className="w-full">
              <ListingImageGallery images={foundListing.images} title={foundListing.title} />
            </div>

            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <CardDescription foundListing={foundListing} />
              <Sidebar foundListing={foundListing} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ErrorPage />;
};

export default CardInfo
