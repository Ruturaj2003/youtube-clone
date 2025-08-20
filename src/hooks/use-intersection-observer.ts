import { useEffect, useRef, useState } from "react";

// A custom hook that tells you if an element is visible on screen
export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  // keeps track of whether the element is visible or not
  const [isIntersecting, setIsIntersecting] = useState(false);

  // this "ref" will be attached to the element we want to watch
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // create the observer, it runs whenever the element's visibility changes
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting); // true if visible, false if not
    }, options);

    // if the element exists, start observing it
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    // cleanup → stop observing when component unmounts
    return () => observer.disconnect();
  }, [options]);

  // return both the ref (to attach to element) and the state (visible or not)
  return { targetRef, isIntersecting };
};

/*
===========================
 Example usage:

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export const ExampleComponent = () => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5, // element is "visible" when 50% in viewport
  });

  return (
    <div>
      <div style={{ height: "150vh" }}>
        Scroll down to see the box 👇
      </div>

      <div
        ref={targetRef} // 👈 attach the ref to the element you want to watch
        style={{
          height: "200px",
          background: isIntersecting ? "lightgreen" : "lightcoral",
        }}
      >
        {isIntersecting ? "I am visible!" : "Scroll more..."}
      </div>
    </div>
  );
};

👉 What happens here:
1. Page loads with some extra height so you need to scroll.
2. The `targetRef` is linked to the box.
3. When at least 50% of the box is inside the screen, `isIntersecting` becomes true.
4. Box turns green and text changes to "I am visible!".
===========================
*/
