
import { useEffect, useState } from "react";

function getGreetingByHour(hour) {
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Hope you’re doing well";
}

function formatDayAndDate(date) {
    return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(date);
}

export default function Greeting() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60 * 1000);

        return () => clearInterval(timer);
    }, []);

    const greeting = getGreetingByHour(now.getHours());
    const dayAndDate = formatDayAndDate(now);

    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold">
                {greeting}
            </h1>

            <p className="text-gray-400 mt-1">
                {dayAndDate}
            </p>
        </div>
    );
}