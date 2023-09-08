import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { $getAuth, $signOut, listenForChange } from "../../backend/api";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { animated, useSpring } from "@react-spring/web";
import { View } from "../schedule/components";
import { Saved } from "../../types";
import Select from "./components/Select";
import Welcome from "./components/Welcome";
import Bg from "./components/Bg";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{
    uid: string;
    schedules: Saved[];
  } | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    onAuthStateChanged($getAuth(), (user) => {
      if (!user) {
        navigate("/");
      } else {
        setUserEmail(user.email ? user.email : "User");
        listenForChange(
          user.uid,
          (snapshot) => {
            setUserData({
              uid: user.uid,
              schedules: snapshot.val() as Saved[],
            });
          },
          "schedules"
        );
      }
    });
  }, []);

  return (
    <section className="w-[100dvw] h-[100dvh] relative overflow-x-hidden flex flex-col">
      <nav className="shrink-0 flex justify-between box-border p-1 h-20 w-full items-center bg-white">
        <Link to="/" className="h-20">
          <img
            src="/me-schedule-maker/images/jac-mock-schedule-maker-high-resolution-color-logo-2.png"
            className="h-full aspect-[4/3] cursor-pointer"
          />
        </Link>
        <div className="flex gap-4 items-center box-border pr-4">
          <p>{userEmail}</p>
          <MenuIcon
            menuOpen={menuOpen}
            handleOnClick={() => setMenuOpen((m) => !m)}
          />
        </div>
      </nav>
      <Menu menuOpen={menuOpen} />

      {location.pathname.includes("/settings") ? (
        <Outlet />
      ) : (
        <>
          {/* absolute */}
          <BottomTriangles />
          <Bg />

          <Welcome />

          <div className="shrink-0 flex justify-center box-border p-6 items-center">
            <h1 className="font-bold text-4xl z-10 text-c1">My Schedules</h1>
          </div>

          <div
            className="bg-c9 h-full box-border p-2 w-full grid grid-rows-6 grid-cols-9 gap-2 grow-0 absolute top-[100dvh]"
            id="schedules"
          >
            <View viewData={userData?.schedules?.[index]?.vData ?? []} login />
            <Select
              uid={userData?.uid}
              setIndex={setIndex}
              viewData={userData?.schedules}
              currentIndex={index}
            />
          </div>
        </>
      )}
    </section>
  );
}

type MenuProps = {
  menuOpen: boolean;
};
function Menu({ menuOpen }: MenuProps) {
  const springs = useSpring({
    x: menuOpen ? "-100%" : "0%",
  });

  async function handleSignOut() {
    await $signOut();
  }

  return (
    <animated.div
      className="absolute top-20 left-full bg-c1 z-10 p-2 w-28"
      style={springs}
    >
      <Link to="settings">
        <p className="hover:underline cursor-pointer">Settings</p>
      </Link>
      <p
        onClick={() => void handleSignOut()}
        className="mt-2 hover:underline cursor-pointer"
      >
        Sign Out
      </p>
    </animated.div>
  );
}

type MenuIconProps = {
  menuOpen: boolean;
  handleOnClick: () => void;
};
// svg morph thing
function MenuIcon({ menuOpen, handleOnClick }: MenuIconProps) {
  const width = 100;
  const height = 100;

  // each index correspond to the d value in <path />
  const bars = [
    `M1 ${height * 0.2}L${width} ${height * 0.2}`,
    `M1 ${height * 0.5}L${width * 0.75} ${height * 0.5}`,
    `M1 ${height * 0.8}L${width * 0.5} ${height * 0.8}`,
  ];
  const close = [
    `M1 1L${width} ${height}`,
    `M1 ${height}L${width} 1`,
    `M1 ${height}L${width} 1`,
  ];

  const path1 = useSpring({
    d: !menuOpen ? bars[0] : close[0],
  });

  const path2 = useSpring({
    d: !menuOpen ? bars[1] : close[1],
  });

  const path3 = useSpring({
    d: !menuOpen ? bars[2] : close[2],
  });
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="h-10 aspect-square"
      onClick={handleOnClick}
    >
      <animated.path
        d={path1.d}
        stroke="#33363F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <animated.path
        d={path2.d}
        stroke="#33363F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <animated.path
        d={path3.d}
        stroke="#33363F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BottomTriangles() {
  return (
    <>
      <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180 flex flex-col">
        <div className="w-full h-10 bg-c1 order-1 relative bottom-0" />
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block w-[calc(100%+1.3px)] h-32 order-2 top-0"
        >
          <path d="M1200 0L0 0 598.97 114.72 1200 0z" className="fill-c1" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180 flex flex-col">
        <div className="w-full h-5 bg-c5 order-1 relative bottom-0" />
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block w-[calc(100%+1.3px)] h-32 order-2 top-0"
        >
          <path d="M1200 0L0 0 598.97 114.72 1200 0z" className="fill-c5" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block w-[calc(100%+1.3px)] h-32"
        >
          <path d="M1200 0L0 0 598.97 114.72 1200 0z" className="fill-c9" />
        </svg>
      </div>
    </>
  );
}
