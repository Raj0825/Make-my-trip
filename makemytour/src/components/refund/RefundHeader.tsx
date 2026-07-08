<div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl p-8 mb-8">

    <div className="flex justify-between items-center">

        <div>

            <p className="uppercase tracking-widest text-blue-100 text-sm">
                Refund Tracking
            </p>

            <h1 className="text-4xl font-bold mt-2">
                ₹ {refund.amount.toLocaleString()}
            </h1>

            <p className="mt-3 text-blue-100">
                Refund will be credited to your account shortly.
            </p>

        </div>

        <div className="hidden md:flex items-center justify-center">

            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">

                💸

            </div>

        </div>

    </div>

</div>