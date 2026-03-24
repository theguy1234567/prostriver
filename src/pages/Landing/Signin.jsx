import React, { useState } from "react";

export default function Signin() {
  const [user, setUser] = useState({
    email: "",
    fullname: "",
    password: "",
  });

  const handleSignin = async () => {
    console.log("btn cliked");
    console.log(user);
  };

  return (
    <div>
      <div className="bg-sky-500 min-h-screen flex justify-center items-center ">
        <div className="bg-white rounded-2xl p-4 flex  flex-col">
          <label htmlFor="">Email</label>
          <input
            className="border bg-sky-50 p-2 m-2 rounded-sm"
            placeholder="Email"
            type="text"
            onChange={(e) => {
              setUser({ ...user, email: e.target.value });
            }}
          />
          <label htmlFor="">Fullname</label>
          <input
            className="border bg-sky-50 p-2 m-2 rounded-sm"
            placeholder="Fullname"
            type="text"
            onChange={(e) => {
              setUser({ ...user, fullname: e.target.value });
            }}
          />
          <label htmlFor="">Passwrod</label>
          <input
            className="border bg-sky-50 p-2 m-2 rounded-sm"
            placeholder="Password"
            type="text"
            onChange={(e) => {
              setUser({ ...user, password: e.target.value });
            }}
          />
          <button
            onClick={handleSignin}
            className="bg-sky-300 rounded-2xl p-2 m-2"
          >
            Signin
          </button>
        </div>
      </div>
    </div>
  );
}
