import { useState } from "react";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="mx-auto flex max-w-[1600px] justify-center px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm"
      >
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Login</h1>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Username
        </label>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          type="text"
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
          placeholder="Enter username"
        />

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
          placeholder="Enter password"
        />

        <div className="mt-8">
          <button
            type="submit"
            className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
