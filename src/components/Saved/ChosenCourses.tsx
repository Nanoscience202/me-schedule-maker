import {
  Dispatch,
  useRef,
  useState,
  MouseEvent,
  useContext,
  useEffect,
} from "react";
import { Class, ViewData } from "../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { animated, useSpring } from "@react-spring/web";
import { ClassContext } from "../Schedule";

type Props = {
  viewData: ViewData[][];
};

type Saved = {
  id: number;
  vData: ViewData[][];
  data: Class[];
};

export default function ChosenCourses({ viewData }: Props) {
  const key = "jac-mock-schedule-maker";
  const [savedSchedule, setSavedSchedule] = useState<Saved[]>(() => {
    const keyItem = window.localStorage.getItem(key);

    if (keyItem) {
      return JSON.parse(keyItem);
    }
    return [];
  });
  const count = useRef(savedSchedule.length);

  const { chosenClasses } = useContext(ClassContext);

  function handleSaved(viewData: ViewData[][]) {
    setSavedSchedule([
      ...savedSchedule,
      {
        id: count.current,
        vData: viewData,
        data: chosenClasses,
      },
    ]);

    do {
      count.current += 1;
    } while (savedSchedule.map((s) => s.id).includes(count.current));
  }

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(savedSchedule));
  }, [savedSchedule]);

  return (
    <section className="md:row-span-1 md:col-span-full bg-c1 rounded-xl box-border flex max-md:order-1">
      <div
        className="md:m-4 m-2 bg-c2 hover:bg-c3 active:bg-c4 transition rounded-md flex items-center justify-center md:p-4 p-2 cursor-pointer shrink-0"
        onClick={() => handleSaved(viewData)}
      >
        <FontAwesomeIcon icon={faPlusCircle} className="md:text-4xl text-xl" />
      </div>
      <div className="flex gap-2 overflow-auto md:p-4 p-2 basis-full md:mr-4 mr-2">
        {savedSchedule.map((i) => {
          return (
            <SavedBlock
              i={i}
              savedSchedule={savedSchedule}
              setSavedSchedule={setSavedSchedule}
              key={i.id}
            />
          );
        })}
      </div>
    </section>
  );
}

function ClassBlocks({ blocksToShow }: { blocksToShow: ViewData[] }) {
  return blocksToShow.map((i) => {
    const t = Object.entries(i.time).flat();
    return (
      <div
        className={`z-10 border border-[black] box-border rounded-md`}
        style={{
          gridColumnStart: t[0],
          gridRowStart: t[1][0],
          gridRowEnd: t[1][1],
          backgroundColor: i.color,
        }}
        key={i.code + i.section + t[0]}
      ></div>
    );
  });
}

type SavedBlockProps = {
  i: Saved;
  savedSchedule: Saved[];
  setSavedSchedule: Dispatch<React.SetStateAction<Saved[]>>;
};

function SavedBlock({ i, savedSchedule, setSavedSchedule }: SavedBlockProps) {
  const { setChosenClasses } = useContext(ClassContext);

  const [springs, api] = useSpring(
    () => ({
      from: {
        opacity: 0,
        y: 30,
        scale: 1,
      },
      to: {
        opacity: 1,
        y: 0,
      },
    }),
    []
  );

  function handleRemoved(e: MouseEvent<SVGSVGElement>) {
    e.stopPropagation();
    api.start({
      from: { opacity: 1, scale: 1 },
      to: { opacity: 0, scale: 0 },
      onResolve: () => {
        setSavedSchedule(savedSchedule.filter((s) => s.id !== i.id));
      },
    });
  }

  function handleClick() {
    setChosenClasses(i.data);
  }

  return (
    <animated.div
      className="h-full aspect-[1.61/1] bg-[white] rounded-md grid grid-rows-[repeat(20,minmax(0,1fr))] grid-cols-5 relative hover:bg-slate-200 md:shadow-lg shadow-md cursor-pointer"
      key={i.id}
      style={springs}
      onClick={handleClick}
    >
      {i.vData.map((j, index) => {
        return <ClassBlocks blocksToShow={j} key={index} />;
      })}
      <FontAwesomeIcon
        icon={faTrash}
        className="absolute opacity-10 m-1 bottom-0 right-0 hover:opacity-50 cursor-pointer"
        onClick={handleRemoved}
      />
    </animated.div>
  );
}
