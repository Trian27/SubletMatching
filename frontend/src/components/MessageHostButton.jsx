import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startConversation } from "../api/messagingApi";
import { useAuth } from "../context/AuthContext";

function MessageHostButton({
  listing,
  className = "",
  children = "Message Host",
  stopPropagation = false,
}) {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  const isOwnListing =
    Boolean(user?.id && listing?.host_id) && String(user.id) === String(listing.host_id);
  const hasHost = Boolean(listing?.host_id);
  const canMessage = Boolean(listing?.id && hasHost && !isOwnListing);

  const handleClick = async (event) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    setError("");

    if (!hasHost) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!canMessage || isStarting) return;

    setIsStarting(true);
    try {
      const conversation = await startConversation(listing.id, {
        accessToken: session?.access_token,
      });
      navigate(`/inbox/${conversation.id}`);
    } catch (startError) {
      setError(startError.message || "Could not start conversation.");
    } finally {
      setIsStarting(false);
    }
  };

  const label = isStarting
    ? "Opening..."
    : isOwnListing
      ? "Your Listing"
      : !hasHost
        ? "Messaging Unavailable"
      : children;

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={!hasHost || isOwnListing || isStarting}
        className={className}
      >
        {label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default MessageHostButton;
