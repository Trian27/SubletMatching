const Sidebar = ({ foundListing }) => {
  const hasPhone = Boolean(foundListing.landlordNum);
  const hasEmail = Boolean(foundListing.landlordEmail);

  return (
    <div className="sticky top-24 h-fit rounded-2xl bg-gray-100 p-6">
        <h2 className="mb-6 text-3xl font-bold text-[#cc0033]">
            ${foundListing.price}/month
        </h2>
        <div>
            <h2 className="font-bold">
                Contact Landlord
            </h2>
        </div>
        <div>
            {hasPhone ? (
              <a className="break-all hover:underline" href={`tel:${foundListing.landlordNum}`}>
                {foundListing.landlordNum}
              </a>
            ) : (
              <span className="text-slate-500">Phone not provided</span>
            )}
        </div>
        <div>
            {hasEmail ? (
              <a className="break-all hover:underline" href={`mailto:${foundListing.landlordEmail}`}>
                {foundListing.landlordEmail}
              </a>
            ) : (
              <span className="text-slate-500">Email not provided</span>
            )}
        </div>
        <div className="flex flex-col gap-5 pt-5">
            <button className="mb-3 w-full rounded-lg bg-[#cc0033] py-3 font-medium text-white transition-colors hover:bg-[#a80029]">Request Tour</button>
            <button className="w-full rounded-lg border border-[#cc0033] py-3 font-medium text-[#cc0033] transition-colors hover:bg-[#cc0033] hover:text-white">Send Message</button>
        </div>
    </div>
  )
}

export default Sidebar
