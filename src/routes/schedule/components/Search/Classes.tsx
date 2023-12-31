import { Class } from "../../../../types";
import { Dispatch, useContext, useEffect } from "react";
import { ScoreInfo } from ".";
import { checkForOverlap } from "../../functions";
import { ClassContext } from "../../classContext";

type ClassesProps = {
  input: string;
  classes: Class[];
  setLoading: Dispatch<React.SetStateAction<boolean>>;
};

export default function Classes({ input, classes, setLoading }: ClassesProps) {
  useEffect(() => {
    setLoading(true);
  }, []);

  let keywords: string[] = input.split(","); //* Gives an array of keywords
  keywords = keywords.map((keyword) => keyword.trim()); //* removes spaces around keyword

  const { chosenClasses, setChosenClasses, setHoveredClass } =
    useContext(ClassContext);

  // * keyword filter
  function condition(keyword: string, searches: Class[]) {
    const regexArr = [
      "[0-9]",
      "[0-9]",
      "[0-9]",
      "-",
      "[0-9A-Z]",
      "[0-9A-Z]",
      "[0-9A-Z]",
      "-",
      "[0-9A-Z]",
      "[0-9A-Z]",
    ];
    const regexStr = regexArr.slice(0, keyword.length).join("");
    const regex = new RegExp(regexStr);

    // check if keyword is "@"
    // filter out unavailable classes
    if (keyword === "@") {
      return searches.filter((c) => {
        if (
          chosenClasses.some(
            (i: Class) => c.code === i.code && c.section === i.section
          )
        ) {
          return false;
        }

        if (chosenClasses.some((i: Class) => c.code === i.code)) {
          return false;
        }

        const isValid = !checkForOverlap([...chosenClasses, c]);

        return isValid;
      });
    }

    // * check if keyword is a rating
    else if (
      ["r>", "r<", "r="].includes(keyword.slice(0, 2)) &&
      keyword.length > 2
    ) {
      if (!Number(keyword.slice(2))) {
        return [];
      }
      const inputRating = Number(keyword.slice(2));

      switch (keyword[1]) {
        case "=":
          return searches.filter((i) => i.lecture.rating.avg === inputRating);

        case ">":
          return searches.filter((i) => i.lecture.rating.avg >= inputRating);

        case "<":
          return searches.filter((i) => i.lecture.rating.avg <= inputRating);
      }
    }

    // * check if keyword is a score
    else if (
      ["s>", "s<", "s="].includes(keyword.slice(0, 2)) &&
      keyword.length > 2
    ) {
      if (!Number(keyword.slice(2))) {
        return [];
      }
      const inputRating = Number(keyword.slice(2));

      switch (keyword[1]) {
        case "=":
          return searches.filter((i) => i.lecture.rating.score === inputRating);

        case ">":
          return searches.filter((i) => i.lecture.rating.score >= inputRating);

        case "<":
          return searches.filter((i) => i.lecture.rating.score <= inputRating);
      }
    }

    // * check if it's a professor
    else if (keyword.slice(0, 2) === "p=") {
      const teacher = keyword.slice(2).toLowerCase();
      return searches.filter((i) =>
        i.lecture.prof.toLowerCase().includes(teacher)
      );
    }

    // * check if course code
    else if (regex.test(keyword)) {
      return searches.filter((i) => i.code.includes(keyword));
    }

    // * check if day
    else if (keyword.split("").every((i) => "MTWRF".includes(i))) {
      return searches.filter((i) => {
        const lecture = structuredClone(Object.keys(i.lecture));
        const lab = structuredClone(Object.keys(i.lab));
        const days = lecture
          .filter((i) => !["title", "prof", "rating"].includes(i))
          .concat(lab.filter((i) => !["title", "prof", "rating"].includes(i)))
          .join("");
        return days.includes(keyword);
      });
    }

    // * check if course name
    else if (keyword.toUpperCase() === keyword) {
      return searches.filter((i) => i.course.includes(keyword));
    }

    // * check if special keyword
    else if (["honours", "blended"].some((i) => i === keyword.toLowerCase())) {
      const special = keyword.toLowerCase();

      if ("honours".startsWith(special)) {
        return searches.filter((i) => i.more.startsWith("For Honours"));
      } else if ("blended".startsWith(special)) {
        return searches.filter((i) => i.more.startsWith("BLENDED"));
      }
    }

    // * if no pattern matches, search for name
    else {
      return searches.filter((i) =>
        i.lecture.title.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    return [];
  }

  // * filter the first keyword
  let targetClasses = condition(keywords[0], classes);

  // * from the current already filtered array, filter for every keyword
  keywords.slice(1).forEach((keyword) => {
    targetClasses = condition(keyword, targetClasses);
  });

  function toggleClass(selectedClass: Class) {
    if (
      chosenClasses.some(
        (i: Class) =>
          selectedClass.code === i.code && selectedClass.section === i.section
      )
    ) {
      setChosenClasses(
        chosenClasses.filter((i) => {
          if (
            selectedClass.code === i.code &&
            selectedClass.section === i.section
          ) {
            return false;
          }
          return true;
        })
      );
    } else if (
      chosenClasses.some((i: Class) => selectedClass.code === i.code)
    ) {
      alert("You already have a class from this course");
      return;
    } else {
      if (checkForOverlap([...chosenClasses, selectedClass])) {
        alert("The chosen class overlaps with another!");
        return;
      }
      setChosenClasses([...chosenClasses, selectedClass]);
    }
  }

  return (
    <>
      {targetClasses.map((i: Class, index: number) => (
        <div
          className="bg-c2 p-2 box-border md:mb-3 mb-2 rounded-lg md:shadow-lg shadow-md hover:bg-c3 transition cursor-pointer md:text-base text-xs"
          key={`i.code + ${index}`}
          onClick={() => toggleClass(i)}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredClass(i);
          }}
          onPointerOut={() => {
            setHoveredClass(undefined);
          }}
        >
          <p className="font-light">
            {i.program}: {i.course} {i.code}
          </p>

          <p className="md:text-xl font-bold text-base">
            {i.section} {i.lecture.title}
          </p>

          <div className="ml-4 relative">
            {i.lecture.prof}{" "}
            <span className="font-bold">
              {i.lecture.rating.score === 0 || !i.lecture.rating.score
                ? "N/A"
                : i.lecture.rating.score}
            </span>{" "}
            {<ScoreInfo rating={i.lecture.rating} />}
          </div>

          {Object.entries(i.lecture)
            .filter((i) => !["title", "prof", "rating"].includes(i[0]))
            .map((j, index) => {
              return (
                <p className="ml-8 font-extralight" key={index}>
                  <span className="font-normal">{j[0]}</span> {j[1] as string}
                </p>
              );
            })}

          {"prof" in i.lab && (
            <>
              <div className="ml-4 relative">
                <u>Lab</u>: {i.lab.prof}{" "}
                <span className="font-bold">
                  {i.lab.rating.score === 0 || !i.lab.rating.score
                    ? "N/A"
                    : i.lab.rating.score}
                </span>{" "}
                {<ScoreInfo rating={i.lab.rating} />}
              </div>

              {Object.entries(i.lab)
                .filter((i) => !["title", "prof", "rating"].includes(i[0]))
                .map((j, index) => {
                  return (
                    <p className="ml-8 font-extralight" key={index}>
                      <span className="font-normal">{j[0]}</span>{" "}
                      {j[1] as string}
                    </p>
                  );
                })}
            </>
          )}

          {i.more !== "" && (
            <>
              <p className="text-c6">{i.more}</p>
            </>
          )}
        </div>
      ))}
    </>
  );
}
