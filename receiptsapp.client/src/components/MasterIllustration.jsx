import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function MasterIllustration({ step, setStep }) {
    const [lastTriggerTime, setLastTriggerTime] = useState(0);
    const flashControls = useAnimation();
    const COOLDOWN_MS = 10000;

    // 1) Whenever step===0, we start steps 1→4 with 2s gaps
    useEffect(() => {
        if (step === 0) {
            setTimeout(() => setStep(1), 2000);
            setTimeout(() => setStep(2), 8000);
            setTimeout(() => setStep(3), 14000);
            setTimeout(() => setStep(4), 20000);
        }
    }, [step, setStep]);

    // 2) When step=3, trigger a flash after 1 second
    useEffect(() => {
        if (step === 3) {
            const timer = setTimeout(() => {
                flashControls.start("flash");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [step, flashControls]);

    // 3) Once we reach step=4, we set lastTriggerTime (so user must wait 10s to restart)
    useEffect(() => {
        if (step === 4) {
            // Record the time we *finished* the animation
            setLastTriggerTime(Date.now());
        }
    }, [step]);

    // 4) On hover, we only restart if 10s passed *since finishing step=4*
    const handleMouseEnter = () => {
        // If we haven't finished step=4 yet, ignore the hover => do nothing
        if (step < 4) {
            return;
        }

        // If we did finish step=4, check the cooldown
        const now = Date.now();
        if (now - lastTriggerTime < COOLDOWN_MS) {
            // It's not been 10s yet => skip
            return;
        }

        // If 10s have passed, reset step=0 => re-run
        setStep(0);
    };

    // Variants for framer-motion
    const receiptVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };
    const phoneVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };
    const handVariants = {
        offscreen: { opacity: 0, x: 300, y: 400, rotate: 0 },
        onscreen: {
            opacity: 1,
            rotate: -25,
            x: 300,
            y: 420,
            transition: { type: "spring", stiffness: 300 },
        },
    };
    const flashVariants = {
        hidden: { opacity: 0 },
        flash: {
            opacity: [0, 1, 0],
            transition: {
                duration: 0.4,
                times: [0, 0.3, 1],
            },
        },
    };

    // Decide which layers to show based on step
    const receiptAnimate = step >= 1 ? "visible" : "hidden";
    const phoneAnimate = step >= 2 ? "visible" : "hidden";
    const handAnimate = step >= 3 ? "onscreen" : "offscreen";

    return (
        <svg
            onMouseEnter={handleMouseEnter}
            viewBox="0 0 800 600"
            xmlns="http://www.w3.org/2000/svg"
            style={{ maxWidth: "100%" }}

        >
            {/* Receipt */}
            <motion.g
                id="ReceiptLayer"
                variants={receiptVariants}
                initial="hidden"
                animate={receiptAnimate}
                transition={{ duration: 1 }}
                transform="translate(320,150) scale(0.6)"
            >
                <defs>
                    <linearGradient id="paperGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="100%" stopColor="#f3f3f3" />
                    </linearGradient>
                </defs>

                <path
                    d="M 0 0 
                         H 190 
                         V 370 
                         L 195 375 
                         L 190 370 
                         L 185 375
                         L 180 370
                         L 175 375
                         L 170 370
                         L 165 375
                         L 160 370
                         V 400
                         H 0
                         Z"
                    fill="url(#paperGradient)"
                    stroke="#ccc"
                    strokeWidth="1"
                />
                <text
                    x="50%"
                    y="40"
                    fill="#333"
                    fontSize="16"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                >
                </text>
                <line x1="20" y1="50" x2="180" y2="50" stroke="#ccc" strokeWidth="1" />
                <text x="10" y="70" fontSize="10" fill="#555" fontFamily="sans-serif">
                    Date: 2025-01-27
                </text>
                <text x="10" y="85" fontSize="10" fill="#555" fontFamily="sans-serif">
                    Time: 10:00 AM
                </text>
                <line x1="10" y1="95" x2="190" y2="95" stroke="#999" strokeDasharray="3,3" />
                <text x="10" y="115" fontSize="10" fill="#333">
                    Coffee
                </text>
                <text x="170" y="115" fontSize="10" fill="#333" textAnchor="end">
                    $2.50
                </text>
                <text x="10" y="130" fontSize="10" fill="#333">
                    Sandwich
                </text>
                <text x="170" y="130" fontSize="10" fill="#333" textAnchor="end">
                    $5.50
                </text>
                <line x1="10" y1="140" x2="190" y2="140" stroke="#999" strokeDasharray="3,3" />
                <text x="10" y="160" fontSize="10" fill="#333" fontWeight="bold" fontFamily="sans-serif">
                    Total
                </text>
                <text
                    x="170"
                    y="160"
                    fontSize="10"
                    fill="#333"
                    fontWeight="bold"
                    textAnchor="end"
                    fontFamily="sans-serif"
                >
                    $8.00
                </text>
                <text
                    x="50%"
                    y="350"
                    fill="#888"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                >
                </text>
            </motion.g>

            {/* Phone */}
            <motion.g
                id="PhoneLayer"
                variants={phoneVariants}
                initial="hidden"
                animate={phoneAnimate}
                transition={{ duration: 1 }}
                transform="translate(250,100) scale(1.2)"
            >
                <defs>
                    <linearGradient id="phoneBodyGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6E8E59" />
                        <stop offset="50%" stopColor="#6E8E59" />
                        <stop offset="100%" stopColor="#6E8E59" />
                    </linearGradient>
                </defs>

                <path
                    fill="url(#phoneBodyGradient)"
                    fillRule="evenodd"
                    d="
                    M 25,20
                    a 20,20 0 0 1 20,-20
                    h 120
                    a 20,20 0 0 1 20,20
                    v 300
                    a 20,20 0 0 1 -20,20
                    h -120
                    a 20,20 0 0 1 -20,-20
                    z

                    M 50,45
                    a 10,10 0 0 1 10, -10
                    h 95
                    a 10,10 0 0 1 10,10
                    v 255
                    a 10,10 0 0 1 -10,10
                    h -95
                    a 10,10 0 0 1 -10,-10
                    z"
                />
                {/* Speaker */}
                <rect x="84" y="15" width="40" height="5" rx="2" ry="2" fill="#333" />
                {/* Camera */}
                <circle cx="105" cy="27" r="4" fill="#222" />
                {/* Home Button */}
                <rect x="95" y="320" width="30" height="6" rx="2" ry="2" fill="#666" />
                {/* Side Buttons */}
                <rect x="23" y="100" width="2" height="20" fill="#666" />
                <rect x="185" y="100" width="2" height="50" fill="#666" />
            </motion.g>

            {/* Hand */}
            <motion.g
                id="HandLayer"
                variants={handVariants}
                initial="offscreen"
                animate={handAnimate}
                transform="translate(360,480) scale(0.4)"
            >
                <path
                    fill="#000"
                    d="M88.4,87.996c2.525-2.146,2.832-5.933,0.687-8.458C82.801,72.144,79.34,62.719,79.34,53
             c0-22.607,18.393-41,41-41c22.607,0,41,18.393,41,41c0,9.729-3.467,19.161-9.761,26.557c-2.148,2.523-1.843,6.311,0.681,8.458
             c1.129,0.961,2.511,1.431,3.886,1.431c1.698,0,3.386-0.717,4.572-2.111C168.858,77.77,173.34,65.576,173.34,53
             c0-29.225-23.775-53-53-53c-29.225,0-53,23.775-53,53c0,12.563,4.476,24.748,12.602,34.31C82.089,89.835,85.873,90.141,88.4,87.996z"
                />
                <path
                    fill="#000"
                    d="M120.186,41.201c13.228,0,23.812,8.105,27.313,19.879c0.761-2.562,1.176-5.271,1.176-8.08
             c0-15.649-12.685-28.335-28.335-28.335c-15.648,0-28.334,12.686-28.334,28.335c0,2.623,0.364,5.16,1.031,7.571
             C96.691,49.076,107.152,41.201,120.186,41.201z"
                />
                <path
                    fill="#000"
                    d="M234.21,169.856c-3.769-22.452-19.597-26.04-27.034-26.462c-2.342-0.133-4.516-1.32-5.801-3.282
             c-5.388-8.225-12.609-10.4-18.742-10.4c-4.405,0-8.249,1.122-10.449,1.932c-0.275,0.102-0.559,0.15-0.837,0.15
             c-0.87,0-1.701-0.47-2.163-1.262c-5.472-9.387-13.252-11.809-19.822-11.809c-3.824,0-7.237,0.82-9.548,1.564
             c-0.241,0.077-0.764,0.114-1.001,0.114c-1.256,0-2.637-1.03-2.637-2.376V69.753c0-11.035-8.224-16.552-16.5-16.552
             c-8.276,0-16.5,5.517-16.5,16.552v84.912c0,4.989-3.811,8.074-7.918,8.074c-2.495,0-4.899-1.138-6.552-3.678l-7.937-12.281
             c-3.508-5.788-8.576-8.188-13.625-8.189c-11.412-0.001-22.574,12.258-14.644,25.344l62.491,119.692
             c0.408,0.782,1.225,1.373,2.108,1.373h87.757c1.253,0,2.289-1.075,2.365-2.325l2.196-35.816c0.025-0.413,0.162-0.84,0.39-1.186
             C231.591,212.679,237.828,191.414,234.21,169.856z"
                />
            </motion.g>

            {/* Flash overlay */}
            <motion.rect
                x="0"
                y="0"
                width="800"
                height="600"
                fill="#fff"
                variants={flashVariants}
                initial="hidden"
                animate={flashControls}
            />
        </svg>
    );
}