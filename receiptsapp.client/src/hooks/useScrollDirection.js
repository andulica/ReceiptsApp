import { useState, useEffect } from "react";

export default function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState("up");

    useEffect(() => {
        let lastScrollY = window.pageYOffset;

        function updateScrollDirection() {
            const currentScrollY = window.pageYOffset;
            const diff = Math.abs(currentScrollY - lastScrollY);

            if (diff < 5) {
                // ignore small scroll differences
                return;
            }

            if (currentScrollY > lastScrollY) {
                setScrollDirection("down");
            } else {
                setScrollDirection("up");
            }
            lastScrollY = currentScrollY;
        }

        window.addEventListener("scroll", updateScrollDirection);
        return () => window.removeEventListener("scroll", updateScrollDirection);
    }, []);

    return scrollDirection;
}