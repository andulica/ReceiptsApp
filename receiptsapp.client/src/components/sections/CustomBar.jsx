import React, { useState } from 'react';

const CustomBar = (props) => {
    const { x, y, width, height, fill, index, activeIndex, setActiveIndex } = props;

    const isActive = index === activeIndex;

    const barHeight = isActive ? height + 10 : height;
    const barY = isActive ? y - 10 : y;

    const barWidth = isActive ? width + 6 : width;
    const barX = isActive ? x - 3 : x;

    const barFill = isActive ? '#2ca6a4' : fill;

    return (
        <rect
            x={barX}
            y={barY}
            width={barWidth}
            height={barHeight}
            fill={barFill}
            rx={4} // colțuri rotunjite
            ry={4}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            style={{ cursor: 'pointer' }}
        />
    );
};
