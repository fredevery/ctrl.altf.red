"use client";

import { useState, useEffect } from 'react';
import { useWindowResize } from '@/utilities/useWindowResize';
import { stripWhitespace } from '@/utilities/string';
import styles from './Grid.module.css';
import rem from '@/utilities/rem';

const COLUMN_COUNT = 12;
const ROW_COUNT = 6;
const COLUMN_PADDING_REM = 0.75;
const COLUMN_COLOR = "125, 255, 125";
const PAGE_MARGIN_REM = 4;

type ColumnConfig = {
    padding: { x: number, width: number }[]
    x: number
}

export default function Grid() {
    const [gridVisible, setGridVisible] = useState(false);
    const { width, height } = useWindowResize();
    const [gridConfig, setGridConfig] = useState({
        width: 0,
        height: 0,
        left: 0,
        right: 0,
        columnWidth: 0,
        columnPadding: 0,
        columns: [] as ColumnConfig[],
        cssVariables: ''
    })


    function toggleGrid(event: KeyboardEvent) {
        if (event.code === 'Backquote') {
            setGridVisible(!gridVisible)
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', toggleGrid);
        return () => window.removeEventListener('keydown', toggleGrid);
    })

    useEffect(() => {
        const columnPadding = rem(COLUMN_PADDING_REM);
        const pageMargin = rem(PAGE_MARGIN_REM);
        const gridWidth = width - pageMargin * 2;
        const gridHeight = height - columnPadding * 2;
        const gridLeft = pageMargin;
        const gridRight = pageMargin + gridWidth;
        // const columnGapSum = COLUMN_PADDING * 2 * COLUMN_COUNT;

        const columnWidth = gridWidth / COLUMN_COUNT;
        const rowHeight = gridHeight / ROW_COUNT;
        const columns = Array.from({ length: COLUMN_COUNT }, (_, index) => {
            const x = pageMargin + index * columnWidth;
            const padding = [{
                x: x,
                width: columnPadding
            }, {
                x: x + columnWidth - columnPadding,
                width: columnPadding
            }]
            return {
                x,
                padding
            };
        });

        setGridConfig({
            width: gridWidth,
            height: height,
            left: gridLeft,
            right: gridRight,
            columnWidth: columnWidth,
            columnPadding: columnPadding,
            columns: columns,
            cssVariables: `
                :root {
                    --page-margin-block: ${columnPadding * 2}px;
                    --page-margin-inline: ${pageMargin}px;
                    --page-margin-inline-total: ${pageMargin * 2}px;
                    --grid-left: ${gridLeft}px;
                    --grid-left-safe: ${gridLeft + columnPadding}px;
                    --grid-right: ${gridRight}px;
                    --grid-right-safe: ${gridRight - columnPadding}px;
                    --grid-width: ${gridWidth}px;
                    --grid-width-safe: ${gridWidth - columnPadding * 2}px;
                    --grid-height-safe: ${height - columnPadding * 4}px;
                    --column-count: ${COLUMN_COUNT};
                    --column-width: ${columnWidth}px;
                    --column-width-safe: ${columnWidth - columnPadding * 2}px;
                    --column-padding: ${columnPadding}px;
                    --row-count: ${ROW_COUNT};
                    --row-height: ${rowHeight}px;
                    --row-height-safe: ${rowHeight - columnPadding * 2}px;

                    ${columns.map((column, index) => (`
                        --column-${index + 1}: ${column.x}px;
                        --column-${index + 1}-safe: ${column.x + columnPadding}px;
                        --column-${index + 1}-right: ${columns[index + 1]?.x || gridRight}px;
                        --column-span-${index + 1}: ${columnWidth * (index + 1)}px;
                        --column-span-${index + 1}-safe: ${columnWidth * (index + 1) - columnPadding * 2}px;    
                    `)).join("")}
                }`
        })
    }, [width, height]);
    console.log(gridConfig.cssVariables);

    return (
        <>
            <style href="column-variables">{stripWhitespace(gridConfig.cssVariables)}</style>
            <div className={styles.gridContainer}>
                {gridVisible && (
                    <svg className={styles.grid} viewBox={`0 0 ${width} ${height} `} preserveAspectRatio="none">
                        {
                            gridConfig.columns.map((column) => (
                                <>
                                    <rect x={column.padding[0].x} y="0" width={column.padding[0].width} height={height} fill={`rgba(${COLUMN_COLOR}, 0.25)`} />
                                    <line x1={column.x} y1="0" x2={column.x} y2={height} stroke={`rgba(${COLUMN_COLOR}, 0.5)`} strokeWidth="1" />
                                    <rect x={column.padding[1].x} y="0" width={column.padding[1].width} height={height} fill={`rgba(${COLUMN_COLOR}, 0.25)`} />
                                </>
                            ))
                        }
                        <line x1={gridConfig.right} y1="0" x2={gridConfig.right} y2={height} stroke={`rgba(${COLUMN_COLOR}, 0.5)`} strokeWidth="1" />
                    </svg>
                )}
            </div>
        </>
    )
}