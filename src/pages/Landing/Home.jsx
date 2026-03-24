import { Link } from "react-router-dom";
import bgimg from "../../assets/Background.jpg";

function Home() {
  return (
    <>
      <div className=" bg-red-400 min-h-screen relative ">
        <img src={bgimg} className="h-screen w-screen object-cover" alt="" />
        <div className="bg-transparent absolute  bottom-0">
          <h2 className="font-mono"> Your flow state begins here.</h2>
          <hr />
          <h1 className="text-[300px]">
            <i>Pro</i>Striver
          </h1>
        </div>
      </div>
    </>
  );
}

export default Home;
