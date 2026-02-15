"use client";

import React from "react";

/**
 * Drop-in replacement for next/image.
 * The original project used unoptimized={true} everywhere,
 * so this is just a thin wrapper around <img>.
 */
interface ImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    sizes?: string;
    priority?: boolean;
    unoptimized?: boolean;
    loading?: "lazy" | "eager";
    onClick?: () => void;
}

export default function Image({
    src,
    alt,
    fill,
    width,
    height,
    className,
    style,
    priority,
    loading,
    ...rest
}: ImageProps) {
    const loadingProp = priority ? "eager" : loading || "lazy";

    if (fill) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    ...style,
                }}
                loading={loadingProp}
                decoding="async"
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            loading={loadingProp}
            decoding="async"
        />
    );
}
