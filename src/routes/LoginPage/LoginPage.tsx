import { useContext, useEffect, useState } from "react";
import { LoginBg, SignIn, SignUp } from "./components";

import { animated, useSpring } from "@react-spring/web";
import { $signOut, verifyEmail } from "../../backend/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../userContext";

export default function LoginPage() {
  const [active, setActive] = useState<"Login" | "Sign Up">("Login");
  const navigate = useNavigate();
  const [notVerified, setNotVerified] = useState(false);

  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      if (!user.emailVerified) {
        navigate("/email-verification-confirmation");
        verifyEmail(user).catch((err) => console.log(err));
        setNotVerified(true);
        $signOut().catch((err) => console.log(err));
      } else navigate(`/users/${user.uid}`);
    }
  }, [user]);

  function handleClick(meth: string) {
    if (meth === "Login") {
      setActive("Login");
    } else if (meth === "Sign Up") {
      setActive("Sign Up");
    }
  }

  return (
    <>
      <section className="w-[100dvw] h-[100dvh] bg-white flex">
        <div className="md:basis-5/12 w-full bg-white flex flex-col items-center justify-center box-border p-6 shrink-0">
          {/* Login form */}
          <div className="bg-c1 w-full h-full flex flex-col items-center rounded-lg overflow-hidden">
            <nav className="flex w-full shrink-0 rounded-t-lg">
              {["Login", "Sign Up"].map((i) => (
                <NavBar
                  meth={i}
                  key={i}
                  active={active}
                  onClick={handleClick}
                />
              ))}
            </nav>

            <img
              src="/me-schedule-maker/images/jac-mock-schedule-maker-high-resolution-logo-black-on-transparent-background.png"
              className="w-28 mt-12"
            />

            <Carousel active={active} notVerified={notVerified} />
          </div>
        </div>

        <div className="basis-7/12 bg-white text-xl md:block hidden">
          <LoginBg />
        </div>
      </section>
    </>
  );
}

function NavBar({
  meth,
  active,
  onClick,
}: {
  meth: string;
  active: "Login" | "Sign Up";
  onClick: (meth: string) => void;
}) {
  const [spring, ctr] = useSpring(
    () => ({
      from: {
        backgroundColor: meth === active ? "#03045e" : "#caf0f8",
        color: meth === active ? "#caf0f8" : "#03045e",
      },
    }),
    []
  );

  useEffect(() => {
    ctr.start({
      to: {
        backgroundColor: meth === active ? "#03045e" : "#caf0f8",
        color: meth === active ? "#caf0f8" : "#03045e",
      },
    });
  }, [active]);

  return (
    <>
      <animated.p
        className="text-center basis-1/2 cursor-pointer p-2 box-border text-c9"
        style={spring}
        onClick={() => onClick(meth)}
        key={meth}
      >
        {meth}
      </animated.p>
    </>
  );
}

function Carousel({
  active,
  notVerified,
}: {
  active: "Login" | "Sign Up";
  notVerified: boolean;
}) {
  const [springs, ctr] = useSpring(
    () => ({
      from: {
        x: "0%",
      },
    }),
    []
  );

  useEffect(() => {
    ctr.start({
      to: {
        x: active === "Login" ? "0%" : "-100%",
      },
    });
  }, [active]);

  return (
    <div className="overflow-x-hidden overflow-y-auto w-full h-full">
      <animated.div className="flex relative" style={springs}>
        <SignIn notVerified={notVerified} />
        <SignUp />
      </animated.div>
    </div>
  );
}
