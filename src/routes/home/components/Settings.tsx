import { animated, useSpring } from "@react-spring/web";
import { User } from "firebase/auth";
import { ReactElement, useState } from "react";
import { Chat, Delete, DisplayName, PasswordBox } from ".";

type Props = {
  user?: User;
  setDisplayName: React.Dispatch<React.SetStateAction<string>>;
};
export default function Settings({ user, setDisplayName }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div className="basis-full md:p-4 p-2 box-border flex max-md:flex-col w-full md:gap-4 gap-2 md:text-base text-sm">
      <nav className="md:basis-3/12 md:h-full shadow shadow-c9 md:rounded-l-xl rounded-t-xl md:rounded-r rounded-b box-border p-2 gap-2 flex md:flex-col">
        {["Account", "Other"].map((name, index) => (
          <NavItem
            active={active}
            index={index}
            name={name}
            setActive={setActive}
            key={index}
          />
        ))}
      </nav>

      <div className="md:basis-9/12 h-full shadow shadow-c9 md:rounded-r-xl rounded-t md:rounded-l rounded-b-xl box-border p-2 relative overflow-hidden">
        <Content active={active} index={0}>
          <>
            <h1 className="font-bold md:text-3xl text-xl">Account Settings</h1>
            <hr />

            <div className="flex flex-col w-full gap-4 mt-4">
              <DisplayName user={user} setNavDisplayName={setDisplayName} />
              <PasswordBox email={user?.email ?? undefined} />
              <Delete user={user} />
            </div>
          </>
        </Content>

        <Content active={active} index={1}>
          <div className="w-full h-full flex flex-col">
            <h1 className="font-bold md:text-3xl text-xl shrink-0">Other</h1>
            <hr />

            <div className="flex flex-col w-full gap-4 mt-4 basis-full">
              <Chat
                userEmail={user?.email ?? undefined}
                displayName={user?.displayName ?? undefined}
              />
            </div>
          </div>
        </Content>
      </div>
    </div>
  );
}

type NavItmeProps = {
  active: number;
  index: number;
  name: string;
  setActive: React.Dispatch<React.SetStateAction<number>>;
};
function NavItem({ active, index, name, setActive }: NavItmeProps) {
  const springs = useSpring({
    backgroundColor: active === index ? "#0f172a" : "#f1f5f9",
    color: active !== index ? "#0f172a" : "#f1f5f9",
  });

  return (
    <animated.div
      className="box-border cursor-pointer md:p-4 p-2 rounded-lg relative hover:font-bold"
      onClick={() => setActive(index)}
      style={springs}
    >
      {name}
    </animated.div>
  );
}

type ContentProps = {
  active: number;
  index: number;
  children?: ReactElement;
};
function Content({ active, index, children }: ContentProps) {
  const isActive = active === index;

  const springs = useSpring({
    opacity: isActive ? 1 : 0,
    delay: isActive ? 300 : 0,
    zIndex: isActive ? 5 : 0,
  });

  return (
    <animated.div
      style={springs}
      className="absolute w-full h-full box-border top-0 left-0 p-4"
    >
      {children}
    </animated.div>
  );
}
