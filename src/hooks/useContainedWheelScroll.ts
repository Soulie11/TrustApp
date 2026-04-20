import { useEffect, type RefObject } from "react";
import { clampNumber, normalizeWheelDelta } from "../utils/number";

export function useContainedWheelScroll(
  ref: RefObject<HTMLElement | null>,
  dependencyKey: unknown
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const scrollElement = element;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      event.stopPropagation();

      const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
      if (maxScroll <= 0) {
        return;
      }

      scrollElement.scrollTop = clampNumber(
        scrollElement.scrollTop + normalizeWheelDelta(event),
        0,
        maxScroll
      );
    }

    scrollElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollElement.removeEventListener("wheel", handleWheel);
    };
  }, [ref, dependencyKey]);
}
