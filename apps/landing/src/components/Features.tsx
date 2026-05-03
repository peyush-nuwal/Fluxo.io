const Features = () => {
  return (
    <div className="min-h-screen bg-green-200 py-10 ">
      <div className="flex flex-col justify-center items-center ">
        <p className="eyebrow">section</p>
        <h1 className="heading">dfsdfsa</h1>
        <p className="description">
          AI that handles onboarding, verification, and activation—without
          friction.
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[200px]">
          {/* BIG LEFT */}
          <div className="lg:col-span-1 lg:row-span-2 rounded-2xl bg-purple-300 p-6">
            Customization
          </div>

          {/* TOP RIGHT WIDE */}
          <div className="lg:col-span-2 rounded-2xl bg-pink-300 p-6">
            Scheduling
          </div>

          {/* MIDDLE RIGHT SMALL */}
          <div className="rounded-2xl bg-green-300 p-6">Wallet</div>

          <div className="rounded-2xl bg-yellow-300 p-6">Inbox</div>

          {/* BOTTOM LEFT WIDE */}
          <div className="lg:col-span-2 rounded-2xl bg-orange-300 p-6">
            Send Gifts
          </div>

          {/* BOTTOM RIGHT SMALL */}
          <div className="rounded-2xl bg-blue-300 p-6">Reminders</div>
        </div>
      </div>
    </div>
  );
};

export default Features;
