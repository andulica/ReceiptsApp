function Logo() {
    return (
        <svg
            width="300"
            height="120"
            viewBox="0 0 300 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="verdeflowGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0f3d3e" />
                    <stop offset="100%" stopColor="#00c9a7" />
                </linearGradient>
            </defs>

            <path
                d="
                  M60,60
                  C60,15 240,15 240,60
                  C240,105 60,105 60,60
                  Z
                "
                        fill="url(#verdeflowGradient)"
                        opacity="0.85"
                    />
                    <path
                        d="
                  M90,60
                  C90,35 210,35 210,60
                  C210,85 90,85 90,60
                  Z
                "
                fill="#0b1514"
                opacity="1"
            />
            <text
                x="50%"
                y="65%"
                fill="white"
                fontFamily="Poppins"
                fontWeight="600"
                fontSize="28"
                textAnchor="middle"
                style={{ letterSpacing: "1px" }}
            >
                ReceiptX
            </text>
        </svg> 
    );
}

export default Logo;