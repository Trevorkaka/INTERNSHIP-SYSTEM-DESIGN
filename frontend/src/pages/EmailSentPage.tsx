export default function EmailSentPage() {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">
            Verify Your Email
          </h1>
  
          <p className="text-gray-600">
            We sent a verification link to your email address.
          </p>
  
          <p className="text-gray-500 text-sm mt-3">
            Please check your inbox and click the link to activate your account.
          </p>
        </div>
      </div>
    )
  }